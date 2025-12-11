const express = require('express');
const pool = require('../config/database');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Получить профиль текущего пользователя
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, name, phone, role FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении профиля' });
  }
});

// Получить статистику мастера
router.get('/statistics', authMiddleware, roleMiddleware(['master', 'admin']), async (req, res) => {
  try {
    const masterId = req.user.role === 'master' ? req.user.id : req.query.masterId;
    
    // Общая статистика
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN status IN ('pending', 'confirmed') THEN 1 END) as upcoming_bookings,
        SUM(CASE WHEN status = 'completed' THEN price ELSE 0 END) as total_revenue,
        COUNT(DISTINCT client_id) as unique_clients
      FROM bookings
      WHERE master_id = ?
    `, [masterId]);
    
    // Статистика по дням недели
    const [weekStats] = await pool.execute(`
      SELECT 
        DAYNAME(s.date) as day_name,
        COUNT(b.id) as bookings_count
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE b.master_id = ? AND b.status = 'completed'
      GROUP BY DAYOFWEEK(s.date), DAYNAME(s.date)
      ORDER BY DAYOFWEEK(s.date)
    `, [masterId]);
    
    // Популярные услуги
    const [popularServices] = await pool.execute(`
      SELECT 
        srv.name,
        COUNT(b.id) as bookings_count,
        SUM(b.price) as revenue
      FROM bookings b
      JOIN services srv ON b.service_id = srv.id
      WHERE b.master_id = ? AND b.status = 'completed'
      GROUP BY srv.id, srv.name
      ORDER BY bookings_count DESC
      LIMIT 5
    `, [masterId]);
    
    // Загрузка по времени
    const [timeStats] = await pool.execute(`
      SELECT 
        HOUR(s.start_time) as hour,
        COUNT(b.id) as bookings_count
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      WHERE b.master_id = ? AND b.status = 'completed'
      GROUP BY HOUR(s.start_time)
      ORDER BY hour
    `, [masterId]);
    
    res.json({
      general: stats[0],
      byWeekDay: weekStats,
      popularServices,
      byHour: timeStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении статистики' });
  }
});

// Получить уведомления
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const [notifications] = await pool.execute(
      `SELECT * FROM notifications 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );
    
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении уведомлений' });
  }
});

// Отметить уведомления как прочитанные
router.put('/notifications/read', authMiddleware, async (req, res) => {
  try {
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ error: 'Необходимо указать ID уведомлений' });
    }
    
    const placeholders = notificationIds.map(() => '?').join(',');
    await pool.execute(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE id IN (${placeholders}) AND user_id = ?`,
      [...notificationIds, req.user.id]
    );
    
    res.json({ message: 'Уведомления отмечены как прочитанные' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при обновлении уведомлений' });
  }
});

module.exports = router;