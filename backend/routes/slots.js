const express = require('express');
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Получить слоты мастера
router.get('/master/:masterId', async (req, res) => {
  try {
    const { masterId } = req.params;
    const { date } = req.query;
    
    let query = `
      SELECT s.*, b.id as booking_id, b.client_id, b.service_id, b.status,
             u.name as client_name, srv.name as service_name
      FROM slots s
      LEFT JOIN bookings b ON s.id = b.slot_id
      LEFT JOIN users u ON b.client_id = u.id
      LEFT JOIN services srv ON b.service_id = srv.id
      WHERE s.master_id = ?
    `;
    
    const params = [masterId];
    
    if (date) {
      query += ' AND s.date = ?';
      params.push(date);
    }
    
    query += ' ORDER BY s.date, s.start_time';
    
    const [slots] = await pool.execute(query, params);
    res.json(slots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении слотов' });
  }
});

// Создать слоты для мастера (только для мастера/админа)
router.post('/', authMiddleware, roleMiddleware(['master', 'admin']), async (req, res) => {
  try {
    const { date, startTime, endTime, duration = 60 } = req.body;
    const masterId = req.user.role === 'master' ? req.user.id : req.body.masterId;
    
    // Генерация слотов на день
    const slots = [];
    let currentTime = new Date(`${date} ${startTime}`);
    const endDateTime = new Date(`${date} ${endTime}`);
    
    while (currentTime < endDateTime) {
      const slotEndTime = new Date(currentTime.getTime() + duration * 60000);
      
      slots.push([
        masterId,
        date,
        currentTime.toTimeString().slice(0, 5),
        slotEndTime.toTimeString().slice(0, 5)
      ]);
      
      currentTime = slotEndTime;
    }
    
    // Вставка слотов
    if (slots.length > 0) {
      const placeholders = slots.map(() => '(?, ?, ?, ?)').join(', ');
      const values = slots.flat();
      
      await pool.execute(
        `INSERT INTO slots (master_id, date, start_time, end_time) VALUES ${placeholders}`,
        values
      );
    }
    
    res.status(201).json({ message: 'Слоты созданы успешно', count: slots.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при создании слотов' });
  }
});

// Удалить слот
router.delete('/:slotId', authMiddleware, roleMiddleware(['master', 'admin']), async (req, res) => {
  try {
    const { slotId } = req.params;
    
    // Проверка, что слот принадлежит мастеру
    const [slots] = await pool.execute(
      'SELECT * FROM slots WHERE id = ? AND master_id = ?',
      [slotId, req.user.id]
    );
    
    if (slots.length === 0) {
      return res.status(404).json({ error: 'Слот не найден' });
    }
    
    // Проверка на наличие бронирования
    const [bookings] = await pool.execute(
      'SELECT * FROM bookings WHERE slot_id = ? AND status != "cancelled"',
      [slotId]
    );
    
    if (bookings.length > 0) {
      return res.status(400).json({ error: 'Невозможно удалить слот с активным бронированием' });
    }
    
    await pool.execute('DELETE FROM slots WHERE id = ?', [slotId]);
    res.json({ message: 'Слот удален успешно' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при удалении слота' });
  }
});

module.exports = router;