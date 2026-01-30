
-- ==========================================
-- SQL DUMP ДЛЯ TIMEWEB (Импорт через phpMyAdmin)
-- ==========================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- УДАЛЕНИЕ СТАРЫХ ТАБЛИЦ (Если нужно перезаписать)
DROP TABLE IF EXISTS `ticket_messages`;
DROP TABLE IF EXISTS `tickets`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `service_requests`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `service_offerings`;
DROP TABLE IF EXISTS `resources`;

-- 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('USER', 'ADMIN', 'EDITOR', 'SUPPORT') DEFAULT 'USER',
  `avatar_url` TEXT,
  `telegram_id` VARCHAR(100) DEFAULT NULL,
  `registration_source` ENUM('EMAIL', 'TELEGRAM') DEFAULT 'EMAIL',
  `preferences` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ТАБЛИЦА ТОВАРОВ
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `title_ru` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `description_ru` TEXT,
  `price` DECIMAL(10, 2) DEFAULT 0.00,
  `type` ENUM('PROMPT', 'COURSE', 'SOFTWARE', 'MANUAL') NOT NULL,
  `image` TEXT,
  `download_url` TEXT,
  `language` ENUM('RU', 'EN') DEFAULT 'EN',
  `features` JSON DEFAULT NULL,
  `features_ru` JSON DEFAULT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_bonus` BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. ТАБЛИЦА УСЛУГ
CREATE TABLE IF NOT EXISTS `service_offerings` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price_label` VARCHAR(100),
  `icon_key` VARCHAR(50),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. ТАБЛИЦА ЗАКАЗОВ
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `total` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
  `payment_method` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `rejection_reason` TEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. ТАБЛИЦА ПОЗИЦИЙ ЗАКАЗА
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `price_at_purchase` DECIMAL(10, 2) NOT NULL,
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. ТАБЛИЦА ТИКЕТОВ
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'OPEN',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. ТАБЛИЦА СООБЩЕНИЙ
CREATE TABLE IF NOT EXISTS `ticket_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_id` VARCHAR(50) NOT NULL,
  `sender` ENUM('USER', 'ADMIN') NOT NULL,
  `message_text` TEXT NOT NULL,
  `is_read` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  KEY `ticket_id` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ТАБЛИЦА ЗАЯВОК
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
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. ТАБЛИЦА ОТЗЫВОВ
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` VARCHAR(50) NOT NULL,
  `user_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) DEFAULT NULL,
  `product_name` VARCHAR(255) DEFAULT NULL,
  `rating` INT NOT NULL,
  `review_text` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. ТАБЛИЦА РЕСУРСОВ
CREATE TABLE IF NOT EXISTS `resources` (
  `id` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(50) NOT NULL,
  `image` TEXT,
  `download_url` TEXT NOT NULL,
  `version` VARCHAR(50),
  `date_added` DATE DEFAULT (CURRENT_DATE),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- СТАРТОВЫЕ ДАННЫЕ (АДМИН + ТОВАРЫ)
INSERT INTO users (id, email, name, role, registration_source) VALUES
('admin-1', 'admin@techhacker.io', 'System Admin', 'ADMIN', 'EMAIL');

INSERT INTO products (id, title, title_ru, description, description_ru, price, type, image, download_url, language, features, features_ru) VALUES
('1', 'Ultimate Midjourney Prompts v5', 'Сборник Промптов Midjourney v5', 'A collection of 500+ high-quality prompts.', 'Коллекция из 500+ высококачественных промптов.', 2990.00, 'PROMPT', 'https://picsum.photos/400/300?random=1', 'https://example.com/files/midjourney-v5.pdf', 'EN', '["PDF", "500+ Prompts", "Instant Access"]', '["PDF", "500+ Промптов", "Моментальный доступ"]'),
('2', 'Python AI Automation Masterclass', 'Мастер-класс: AI Автоматизация на Python', 'Learn how to build AI agents using Python.', 'Научитесь создавать AI-агентов на Python.', 19990.00, 'COURSE', 'https://picsum.photos/400/300?random=2', 'https://example.com/files/python-course.zip', 'RU', '["MP4", "Source Code", "Certificate"]', '["MP4", "Исходный код", "Сертификат"]'),
('3', 'Telegram Bot Template', 'Шаблон Telegram Бота (Pro)', 'Production-ready boilerplate for scalable bots.', 'Готовый к продакшену шаблон бота.', 4990.00, 'SOFTWARE', 'https://picsum.photos/400/300?random=3', 'https://github.com/example/bot-template', 'EN', '["ZIP", "Node.js", "PostgreSQL"]', '["ZIP", "Node.js", "PostgreSQL"]'),
('4', 'ChatGPT Business Guide', 'Гайд: ChatGPT для Бизнеса', 'How to implement ChatGPT in daily business.', 'Как внедрить ChatGPT в бизнес.', 1490.00, 'MANUAL', 'https://picsum.photos/400/300?random=4', 'https://example.com/files/chatgpt-guide.pdf', 'RU', '["PDF", "Checklists", "Guide"]', '["PDF", "Чек-листы", "Гайд"]');

INSERT INTO service_offerings (id, title, description, price_label, icon_key) VALUES
('bot-dev', 'Telegram Bot Development', 'Development of turnkey bots of any complexity.', 'От 10 000 ₽', 'Bot'),
('ai-integration', 'AI Integration', 'Implementation of ChatGPT & Midjourney.', 'От 20 000 ₽', 'Shield'),
('scripting', 'Automation Scripts', 'Python/JS scripts for automation.', 'От 5 000 ₽', 'Code');

SET FOREIGN_KEY_CHECKS = 1;
