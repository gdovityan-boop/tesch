
USE test;

-- СОЗДАНИЕ ТАБЛИЦ ДЛЯ TECHHACKER PLATFORM
-- Импортируйте этот файл в вашу базу данных (MySQL/MariaDB)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('USER', 'ADMIN', 'EDITOR', 'SUPPORT') DEFAULT 'USER',
  `avatar_url` TEXT,
  `telegram_id` VARCHAR(100) DEFAULT NULL,
  `registration_source` ENUM('EMAIL', 'TELEGRAM') DEFAULT 'EMAIL',
  `password_hash` VARCHAR(255) DEFAULT NULL, -- Для Email регистрации
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `preferences` JSON DEFAULT NULL, -- Хранение настроек уведомлений в JSON
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ТАБЛИЦА ТОВАРОВ (PRODUCTS)
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `title_ru` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `description_ru` TEXT,
  `price` DECIMAL(10, 2) DEFAULT 0.00,
  `type` ENUM('PROMPT', 'COURSE', 'SOFTWARE', 'MANUAL') NOT NULL,
  `image` TEXT,
  `download_url` TEXT, -- Секретная ссылка
  `language` ENUM('RU', 'EN') DEFAULT 'EN',
  `features` JSON DEFAULT NULL, -- Массив фич (EN)
  `features_ru` JSON DEFAULT NULL, -- Массив фич (RU)
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_bonus` BOOLEAN DEFAULT FALSE, -- Для бонусных товаров
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. ТАБЛИЦА УСЛУГ (SERVICE OFFERINGS)
CREATE TABLE IF NOT EXISTS `service_offerings` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price_label` VARCHAR(100), -- Текстовое описание цены (напр. "От 10 000 ₽")
  `icon_key` VARCHAR(50), -- Название иконки или URL
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ТАБЛИЦА ЗАКАЗОВ (ORDERS)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `rejection_reason` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_orders_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ТАБЛИЦА ПОЗИЦИЙ ЗАКАЗА (ORDER ITEMS - Связь Many-to-Many)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `price_at_purchase` DECIMAL(10, 2) NOT NULL,
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `fk_oi_orders` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_oi_products` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ТАБЛИЦА ТИКЕТОВ (SUPPORT TICKETS)
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'OPEN',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_tickets_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. СООБЩЕНИЯ В ТИКЕТАХ
CREATE TABLE IF NOT EXISTS `ticket_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` VARCHAR(50) NOT NULL,
  `sender` ENUM('USER', 'ADMIN') NOT NULL,
  `message_text` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `fk_tm_tickets` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ЗАЯВКИ НА УСЛУГИ (SERVICE REQUESTS)
CREATE TABLE IF NOT EXISTS `service_requests` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `service_type` VARCHAR(255) NOT NULL,
  `contact_info` VARCHAR(255) NOT NULL,
  `details` TEXT,
  `status` ENUM('NEW', 'IN_WORK', 'COMPLETED') DEFAULT 'NEW',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `is_reviewed` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_sr_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. ОТЗЫВЫ (REVIEWS)
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) DEFAULT NULL, -- Может быть NULL если отзыв общий
  `product_name` VARCHAR(255) DEFAULT NULL, -- Кешируем имя товара
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `review_text` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_reviews_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. РЕСУРСЫ/ПРОГРАММЫ (RESOURCES)
CREATE TABLE IF NOT EXISTS `resources` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(50) NOT NULL, -- VIDEO_EDITING, PLUGINS etc.
  `image` TEXT,
  `download_url` TEXT NOT NULL,
  `version` VARCHAR(50),
  `date_added` DATE DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
