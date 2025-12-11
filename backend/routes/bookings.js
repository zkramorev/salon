const express = require('express');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Получить бронирования пользователя
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    
    let query = `
      SELECT b.*, 
             s.date, s.start_time, s.end_time,
             srv.name as service_name, srv.duration,
             client.name as client_name, client.email as client_email, client.phone as client_phone,
             master.name as master_name, master.email as master_email
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      JOIN services srv ON b.service_id = srv.id
      JOIN users client ON b.client_id = client.id
      JOIN users master ON b.master_id = master.id
    `;
    
    if (role === 'client') {
      query += ' WHERE b.client_id = ?';
    } else if (role === 'master') {
      query += ' WHERE b.master_id = ?';
    }
    
    query += ' ORDER BY s.date DESC, s.start_time DESC';
    
    const [bookings] = await pool.execute(query, [userId]);
    res.json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении бронирований' });
  }
});

// Создать бронирование
router.post('/', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { masterId, serviceId, slotId, notes } = req.body;
    const clientId = req.user.id;
    
    // Проверка доступности слота
    const [slots] = await connection.execute(
      'SELECT * FROM slots WHERE id = ? AND is_available = TRUE FOR UPDATE',
      [slotId]
    );
    
    if (slots.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Слот недоступен для бронирования' });
    }
    
    // Получение цены услуги
    const [prices] = await connection.execute(`
      SELECT COALESCE(ms.price, s.price) as price
      FROM services s
      LEFT JOIN master_services ms ON s.id = ms.service_id AND ms.master_id = ?
      WHERE s.id = ?
    `, [masterId, serviceId]);
    
    const price = prices[0].price;
    
    // Создание бронирования
    const [result] = await connection.execute(
      `INSERT INTO bookings (client_id, master_id, service_id, slot_id, price, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [clientId, masterId, serviceId, slotId, price, notes]
    );
    
    // Обновление слота
    await connection.execute(
      'UPDATE slots SET is_available = FALSE WHERE id = ?',
      [slotId]
    );
    
    // Создание уведомления для мастера
    await connection.execute(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES (?, 'booking_confirmed', 'Новая запись', 'У вас новая запись на услугу')`,
      [masterId]
    );
    
    await connection.commit();
    
    res.status(201).json({ 
      message: 'Бронирование создано успешно',
      bookingId: result.insertId 
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Ошибка при создании бронирования' });
  } finally {
    connection.release();
  }
});

// Отменить бронирование
router.put('/:bookingId/cancel', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { bookingId } = req.params;
    const userId = req.user.id;
    
    // Получение информации о бронировании
    const [bookings] = await connection.execute(
      `SELECT b.*, s.date, s.start_time 
       FROM bookings b 
       JOIN slots s ON b.slot_id = s.id 
       WHERE b.id = ? AND (b.client_id = ? OR b.master_id = ?)`,
      [bookingId, userId, userId]
    );
    
    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    const booking = bookings[0];
    
    // Проверка времени (нельзя отменить менее чем за 24 часа)
    const bookingDateTime = new Date(`${booking.date} ${booking.start_time}`);
    const now = new Date();
    const hoursDiff = (bookingDateTime - now) / (1000 * 60 * 60);
    
    if (hoursDiff < 24) {
      await connection.rollback();
      return res.status(400).json({ error: 'Отмена возможна не менее чем за 24 часа' });
    }
    
    // Обновление статуса бронирования
    await connection.execute(
      'UPDATE bookings SET status = "cancelled" WHERE id = ?',
      [bookingId]
    );
    
    // Освобождение слота
    await connection.execute(
      'UPDATE slots SET is_available = TRUE WHERE id = ?',
      [booking.slot_id]
    );
    
    // Создание уведомления
    const notifyUserId = req.user.id === booking.client_id ? booking.master_id : booking.client_id;
    await connection.execute(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES (?, 'booking_cancelled', 'Запись отменена', 'Запись на ${booking.date} была отменена')`,
      [notifyUserId]
    );
    
    await connection.commit();
    
    res.json({ message: 'Бронирование отменено успешно' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Ошибка при отмене бронирования' });
  } finally {
    connection.release();
  }
});

// Подтвердить бронирование (только для мастера)
router.put('/:bookingId/confirm', authMiddleware, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const masterId = req.user.id;
    
    const [result] = await pool.execute(
      'UPDATE bookings SET status = "confirmed" WHERE id = ? AND master_id = ? AND status = "pending"',
      [bookingId, masterId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Бронирование не найдено или уже подтверждено' });
    }
    
    // Уведомление клиенту
    const [bookings] = await pool.execute(
      'SELECT client_id FROM bookings WHERE id = ?',
      [bookingId]
    );
    
    await pool.execute(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES (?, 'booking_confirmed', 'Запись подтверждена', 'Ваша запись была подтверждена мастером')`,
      [bookings[0].client_id]
    );
    
    res.json({ message: 'Бронирование подтверждено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при подтверждении бронирования' });
  }
});

// Перенести бронирование
router.put('/:bookingId/reschedule', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { bookingId } = req.params;
    const { newSlotId } = req.body;
    const userId = req.user.id;
    
    // Проверка прав и получение старого бронирования
    const [bookings] = await connection.execute(
      'SELECT * FROM bookings WHERE id = ? AND client_id = ?',
      [bookingId, userId]
    );
    
    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    const oldBooking = bookings[0];
    
    // Проверка доступности нового слота
    const [newSlots] = await connection.execute(
      'SELECT * FROM slots WHERE id = ? AND is_available = TRUE AND master_id = ? FOR UPDATE',
      [newSlotId, oldBooking.master_id]
    );
    
    if (newSlots.length === 0) {
      await connection.rollback();
      return res.status(400).json({ error: 'Новый слот недоступен' });
    }
    
    // Освобождение старого слота
    await connection.execute(
      'UPDATE slots SET is_available = TRUE WHERE id = ?',
      [oldBooking.slot_id]
    );
    
    // Занятие нового слота
    await connection.execute(
      'UPDATE slots SET is_available = FALSE WHERE id = ?',
      [newSlotId]
    );
    
    // Обновление бронирования
    await connection.execute(
      'UPDATE bookings SET slot_id = ?, status = "pending" WHERE id = ?',
      [newSlotId, bookingId]
    );
    
    // Уведомление мастеру
    await connection.execute(
      `INSERT INTO notifications (user_id, type, title, message) 
       VALUES (?, 'booking_confirmed', 'Запись перенесена', 'Клиент перенес запись на другое время')`,
      [oldBooking.master_id]
    );
    
    await connection.commit();
    
    res.json({ message: 'Бронирование перенесено успешно' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Ошибка при переносе бронирования' });
  } finally {
    connection.release();
  }
});

module.exports = router;