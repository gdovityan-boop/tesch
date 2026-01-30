
-- INITIAL DATA FOR TECHHACKER PLATFORM
-- Run this in TiDB SQL Editor to fill your empty tables

USE test;

-- 1. Insert Products
INSERT INTO products (id, title, title_ru, description, description_ru, price, type, image, download_url, language, features, features_ru) VALUES
('1', 'Ultimate Midjourney Prompts v5', 'Сборник Промптов Midjourney v5', 'A collection of 500+ high-quality prompts.', 'Коллекция из 500+ высококачественных промптов.', 2990.00, 'PROMPT', 'https://picsum.photos/400/300?random=1', 'https://example.com/files/midjourney-v5.pdf', 'EN', '["PDF", "500+ Prompts", "Instant Access"]', '["PDF", "500+ Промптов", "Моментальный доступ"]'),
('2', 'Python AI Automation Masterclass', 'Мастер-класс: AI Автоматизация на Python', 'Learn how to build AI agents using Python.', 'Научитесь создавать AI-агентов на Python.', 19990.00, 'COURSE', 'https://picsum.photos/400/300?random=2', 'https://example.com/files/python-course.zip', 'RU', '["MP4", "Source Code", "Certificate"]', '["MP4", "Исходный код", "Сертификат"]'),
('3', 'Telegram Bot Template', 'Шаблон Telegram Бота (Pro)', 'Production-ready boilerplate for scalable bots.', 'Готовый к продакшену шаблон бота.', 4990.00, 'SOFTWARE', 'https://picsum.photos/400/300?random=3', 'https://github.com/example/bot-template', 'EN', '["ZIP", "Node.js", "PostgreSQL"]', '["ZIP", "Node.js", "PostgreSQL"]'),
('4', 'ChatGPT Business Guide', 'Гайд: ChatGPT для Бизнеса', 'How to implement ChatGPT in daily business.', 'Как внедрить ChatGPT в бизнес.', 1490.00, 'MANUAL', 'https://picsum.photos/400/300?random=4', 'https://example.com/files/chatgpt-guide.pdf', 'RU', '["PDF", "Checklists", "Guide"]', '["PDF", "Чек-листы", "Гайд"]');

-- 2. Insert Initial User (Admin)
-- You can login with this email
INSERT INTO users (id, email, name, role, registration_source) VALUES
('admin-1', 'admin@techhacker.io', 'System Admin', 'ADMIN', 'EMAIL');

-- 3. Insert Service Offerings
INSERT INTO service_offerings (id, title, description, price_label, icon_key) VALUES
('bot-dev', 'Telegram Bot Development', 'Development of turnkey bots of any complexity.', 'От 10 000 ₽', 'Bot'),
('ai-integration', 'AI Integration', 'Implementation of ChatGPT & Midjourney.', 'От 20 000 ₽', 'Shield'),
('scripting', 'Automation Scripts', 'Python/JS scripts for automation.', 'От 5 000 ₽', 'Code');
