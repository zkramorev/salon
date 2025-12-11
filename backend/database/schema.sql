-- Установка кодировки
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Создание базы данных с правильной кодировкой
CREATE DATABASE IF NOT EXISTS master_booking 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE master_booking;

-- Далее весь остальной SQL из schema.sql
-- Создание пользователя для любого хоста
CREATE USER IF NOT EXISTS 'booking_user'@'%' IDENTIFIED BY 'booking_password';
GRANT ALL PRIVILEGES ON master_booking.* TO 'booking_user'@'%';
FLUSH PRIVILEGES;

CREATE DATABASE IF NOT EXISTS master_booking;
USE master_booking;

-- Таблица пользователей
CREATE TABLE users (
                       id INT PRIMARY KEY AUTO_INCREMENT,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       password VARCHAR(255) NOT NULL,
                       name VARCHAR(255) NOT NULL,
                       phone VARCHAR(20),
                       role ENUM('client', 'master', 'admin') DEFAULT 'client',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица услуг
CREATE TABLE services (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          name VARCHAR(255) NOT NULL,
                          description TEXT,
                          price DECIMAL(10, 2) NOT NULL,
                          duration INT NOT NULL, -- в минутах
                          image_url VARCHAR(500),
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица связи мастеров и услуг
CREATE TABLE master_services (
                                 id INT PRIMARY KEY AUTO_INCREMENT,
                                 master_id INT NOT NULL,
                                 service_id INT NOT NULL,
                                 price DECIMAL(10, 2), -- персональная цена мастера
                                 FOREIGN KEY (master_id) REFERENCES users(id) ON DELETE CASCADE,
                                 FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
                                 UNIQUE KEY unique_master_service (master_id, service_id)
);

-- Таблица слотов (расписание мастеров)
CREATE TABLE slots (
                       id INT PRIMARY KEY AUTO_INCREMENT,
                       master_id INT NOT NULL,
                       date DATE NOT NULL,
                       start_time TIME NOT NULL,
                       end_time TIME NOT NULL,
                       is_available BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       FOREIGN KEY (master_id) REFERENCES users(id) ON DELETE CASCADE,
                       INDEX idx_master_date (master_id, date)
);

-- Таблица бронирований
CREATE TABLE bookings (
                          id INT PRIMARY KEY AUTO_INCREMENT,
                          client_id INT NOT NULL,
                          master_id INT NOT NULL,
                          service_id INT NOT NULL,
                          slot_id INT NOT NULL,
                          status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
                          price DECIMAL(10, 2) NOT NULL,
                          notes TEXT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
                          FOREIGN KEY (master_id) REFERENCES users(id) ON DELETE CASCADE,
                          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
                          FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
                          INDEX idx_client (client_id),
                          INDEX idx_master (master_id),
                          INDEX idx_status (status)
);

-- Таблица уведомлений
CREATE TABLE notifications (
                               id INT PRIMARY KEY AUTO_INCREMENT,
                               user_id INT NOT NULL,
                               type ENUM('booking_reminder', 'booking_confirmed', 'booking_cancelled') NOT NULL,
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               is_read BOOLEAN DEFAULT FALSE,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                               INDEX idx_user_read (user_id, is_read)
);

-- =====================================================
-- ТЕСТОВЫЕ ДАННЫЕ
-- =====================================================

-- Пароль для всех тестовых пользователей: password123
-- Хеш: $2a$10$YourHashedPasswordHere нужно заменить на реальный хеш

-- Вставка пользователей
INSERT INTO users (email, password, name, phone, role) VALUES
-- Администратор
('admin@example.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Администратор Системы', '+7 (999) 000-00-00', 'admin'),

-- Мастера
('anna.master@example.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Анна Сидорова', '+7 (999) 111-11-11', 'master'),
('maria.master@example.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Мария Петрова', '+7 (999) 222-22-22', 'master'),
('elena.master@example.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Елена Иванова', '+7 (999) 333-33-33', 'master'),
('petr.master@example.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Петр Смирнов', '+7 (999) 444-44-44', 'master'),
('ivan.master@example.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Иван Козлов', '+7 (999) 555-55-55', 'master'),

-- Клиенты
('client1@example.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Ольга Новикова', '+7 (999) 666-66-66', 'client'),
('client2@example.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Дмитрий Волков', '+7 (999) 777-77-77', 'client'),
('client3@example.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Наталья Морозова', '+7 (999) 888-88-88', 'client'),
('test@test.com', '$2a$10$gS9eD6YzG7fEjfZZNbb2ZOGxS5yeoOmVoW2HhbsvR68M3NQm6AzCy', 'Тестовый Клиент', '+7 (999) 999-99-99', 'client');

-- Вставка услуг
INSERT INTO services (name, description, price, duration, image_url) VALUES
                                                                         ('Женская стрижка', 'Профессиональная женская стрижка с укладкой. Консультация по подбору формы и стиля.', 2500, 60, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400'),
                                                                         ('Мужская стрижка', 'Стильная мужская стрижка. Моделирование бороды и усов.', 1500, 45, 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400'),
                                                                         ('Окрашивание волос', 'Профессиональное окрашивание волос. Все виды техник: балаяж, шатуш, омбре.', 4500, 120, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'),
                                                                         ('Маникюр', 'Классический и аппаратный маникюр. Покрытие гель-лаком.', 1800, 90, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400'),
                                                                         ('Педикюр', 'Профессиональный педикюр. Обработка стоп, покрытие.', 2200, 120, 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?w=400'),
                                                                         ('Наращивание ресниц', 'Классическое и объемное наращивание ресниц. 2D, 3D эффекты.', 3000, 120, 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400'),
                                                                         ('Коррекция бровей', 'Моделирование и окрашивание бровей. Долговременная укладка.', 1200, 45, 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400'),
                                                                         ('Массаж лица', 'Классический массаж лица с уходовыми процедурами.', 2500, 60, 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400'),
                                                                         ('Чистка лица', 'Профессиональная чистка лица. Ультразвуковая и механическая.', 3500, 90, 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400'),
                                                                         ('Макияж', 'Дневной, вечерний, свадебный макияж. Консультация по уходу.', 2800, 60, 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400');

-- Связь мастеров с услугами (с персональными ценами для некоторых)
INSERT INTO master_services (master_id, service_id, price) VALUES
-- Анна Сидорова - парикмахер
(2, 1, 2800), -- Женская стрижка (дороже базовой)
(2, 3, 5000), -- Окрашивание
(2, 7, NULL), -- Коррекция бровей (базовая цена)

-- Мария Петрова - мастер маникюра/педикюра
(3, 4, 2000), -- Маникюр
(3, 5, 2500), -- Педикюр

-- Елена Иванова - косметолог
(4, 6, NULL), -- Наращивание ресниц
(4, 7, 1500), -- Коррекция бровей
(4, 8, NULL), -- Массаж лица
(4, 9, 4000), -- Чистка лица
(4, 10, 3200), -- Макияж

-- Петр Смирнов - барбер
(5, 2, 1800), -- Мужская стрижка
(5, 7, 800), -- Коррекция бровей (для мужчин дешевле)

-- Иван Козлов - универсал
(6, 1, NULL), -- Женская стрижка
(6, 2, NULL), -- Мужская стрижка
(6, 3, 4000); -- Окрашивание

-- Генерация слотов для мастеров на следующие 14 дней
DELIMITER $$

CREATE PROCEDURE GenerateSlots()
BEGIN
    DECLARE master_id INT;
    DECLARE date_counter INT DEFAULT 0;
    DECLARE slot_date DATE;
    DECLARE done INT DEFAULT FALSE;
    DECLARE master_cursor CURSOR FOR SELECT id FROM users WHERE role = 'master';
DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

OPEN master_cursor;

master_loop: LOOP
        FETCH master_cursor INTO master_id;
        IF done THEN
            LEAVE master_loop;
END IF;

        SET date_counter = 0;
        WHILE date_counter < 14 DO
            SET slot_date = DATE_ADD(CURDATE(), INTERVAL date_counter DAY);

            -- Пропускаем воскресенья
            IF DAYOFWEEK(slot_date) != 1 THEN
                -- Утренние слоты (9:00 - 13:00)
                INSERT INTO slots (master_id, date, start_time, end_time) VALUES
                (master_id, slot_date, '09:00:00', '10:00:00'),
                (master_id, slot_date, '10:00:00', '11:00:00'),
                (master_id, slot_date, '11:00:00', '12:00:00'),
                (master_id, slot_date, '12:00:00', '13:00:00');

                -- Дневные слоты (14:00 - 19:00)
INSERT INTO slots (master_id, date, start_time, end_time) VALUES
                                                              (master_id, slot_date, '14:00:00', '15:00:00'),
                                                              (master_id, slot_date, '15:00:00', '16:00:00'),
                                                              (master_id, slot_date, '16:00:00', '17:00:00'),
                                                              (master_id, slot_date, '17:00:00', '18:00:00'),
                                                              (master_id, slot_date, '18:00:00', '19:00:00');
END IF;

            SET date_counter = date_counter + 1;
END WHILE;
END LOOP;

CLOSE master_cursor;
END$$

DELIMITER ;

CALL GenerateSlots();
DROP PROCEDURE GenerateSlots;

-- Создание нескольких тестовых бронирований
INSERT INTO bookings (client_id, master_id, service_id, slot_id, status, price, notes)
SELECT
    7, -- client1
    2, -- Анна Сидорова
    1, -- Женская стрижка
    s.id,
    'confirmed',
    2800,
    'Первый визит, нужна консультация по уходу'
FROM slots s
WHERE s.master_id = 2
  AND s.date = DATE_ADD(CURDATE(), INTERVAL 2 DAY)
  AND s.start_time = '10:00:00'
    LIMIT 1;

-- Обновляем слот как занятый
UPDATE slots s
    JOIN bookings b ON s.id = b.slot_id
    SET s.is_available = FALSE
WHERE b.id = LAST_INSERT_ID();

-- Еще несколько бронирований
INSERT INTO bookings (client_id, master_id, service_id, slot_id, status, price, notes)
SELECT
    8, -- client2
    3, -- Мария Петрова
    4, -- Маникюр
    s.id,
    'pending',
    2000,
    'Классический маникюр с укреплением'
FROM slots s
WHERE s.master_id = 3
  AND s.date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
  AND s.start_time = '14:00:00'
    LIMIT 1;

UPDATE slots s
    JOIN bookings b ON s.id = b.slot_id
    SET s.is_available = FALSE
WHERE b.id = LAST_INSERT_ID();

-- Завершенное бронирование для статистики
INSERT INTO bookings (client_id, master_id, service_id, slot_id, status, price, notes)
SELECT
    9, -- client3
    4, -- Елена Иванова
    9, -- Чистка лица
    s.id,
    'completed',
    4000,
    'Процедура прошла отлично'
FROM slots s
WHERE s.master_id = 4
  AND s.date = DATE_SUB(CURDATE(), INTERVAL 3 DAY)
  AND s.start_time = '11:00:00'
    LIMIT 1;

-- Создание уведомлений
INSERT INTO notifications (user_id, type, title, message) VALUES
                                                              (2, 'booking_confirmed', 'Новая запись', 'У вас новая подтвержденная запись на послезавтра в 10:00'),
                                                              (3, 'booking_confirmed', 'Новая запись', 'У вас новая запись на завтра в 14:00, требует подтверждения'),
                                                              (7, 'booking_confirmed', 'Запись подтверждена', 'Ваша запись к мастеру Анна Сидорова подтверждена'),
                                                              (8, 'booking_reminder', 'Напоминание о записи', 'Напоминаем о вашей записи завтра в 14:00');

-- Добавим несколько отмененных записей для полноты картины
INSERT INTO bookings (client_id, master_id, service_id, slot_id, status, price, notes)
SELECT
    10, -- test@test.com
    5, -- Петр Смирнов
    2, -- Мужская стрижка
    s.id,
    'cancelled',
    1800,
    'Клиент отменил запись'
FROM slots s
WHERE s.master_id = 5
  AND s.date = DATE_ADD(CURDATE(), INTERVAL 3 DAY)
  AND s.start_time = '16:00:00'
    LIMIT 1;

-- Вывод информации о созданных тестовых данных
SELECT 'Создано пользователей:' as Info, COUNT(*) as Count FROM users
UNION ALL
SELECT 'Создано услуг:', COUNT(*) FROM services
UNION ALL
SELECT 'Создано слотов:', COUNT(*) FROM slots
UNION ALL
SELECT 'Создано бронирований:', COUNT(*) FROM bookings
UNION ALL
SELECT 'Создано уведомлений:', COUNT(*) FROM notifications;