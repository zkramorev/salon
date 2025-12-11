const express = require('express');
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Получить все услуги
router.get('/', async (req, res) => {
  try {
    const [services] = await pool.execute(`
      SELECT s.*, COUNT(DISTINCT ms.master_id) as masters_count
      FROM services s
             LEFT JOIN master_services ms ON s.id = ms.service_id
      GROUP BY s.id
    `);
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении услуг' });
  }
});

// Получить мастеров по услуге
router.get('/:serviceId/masters', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const [masters] = await pool.execute(`
      SELECT u.id, u.name, u.email, ms.price as custom_price, s.price as default_price,
             COUNT(DISTINCT b.id) as total_bookings,
             CASE
               WHEN COUNT(b.id) = 0 THEN NULL
               ELSE AVG(CASE WHEN b.status = 'completed' THEN 5 ELSE NULL END)
               END as rating
      FROM users u
             JOIN master_services ms ON u.id = ms.master_id
             JOIN services s ON ms.service_id = s.id
             LEFT JOIN bookings b ON u.id = b.master_id AND b.service_id = s.id
      WHERE ms.service_id = ? AND u.role = 'master'
      GROUP BY u.id, u.name, u.email, ms.price, s.price
    `, [serviceId]);

    res.json(masters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ошибка при получении мастеров' });
  }
});

module.exports = router;