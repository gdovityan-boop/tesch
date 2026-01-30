# 🚀 TechHacker Platform Deployment Guide

Это руководство поможет вам развернуть вашу платформу на реальном сервере (VPS) под управлением Ubuntu.

## 1. Подготовка сервера

Арендуйте VPS (например, на Aeza, Timeweb, DigitalOcean).
ОС: **Ubuntu 22.04 LTS**.

Зайдите на сервер через SSH:
```bash
ssh root@ваш_ip_адрес
```

## 2. Установка необходимого ПО

Выполните команды по очереди, чтобы установить Node.js, MySQL и Nginx.

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Curl
sudo apt install curl -y

# Устанавливаем Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Устанавливаем MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation
# (Следуйте инструкциям, задайте пароль для root mysql)

# Устанавливаем Process Manager (PM2) для запуска сайта
sudo npm install -g pm2
```

## 3. Настройка Базы Данных

Зайдите в консоль MySQL:
```bash
sudo mysql -u root -p
```

Внутри MySQL выполните команды (замените `password` на свой надежный пароль):

```sql
CREATE DATABASE techhacker;
CREATE USER 'hacker'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON techhacker.* TO 'hacker'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Теперь импортируйте структуру базы данных. Вы можете скопировать содержимое файла `db_setup.sql` из вашего проекта и выполнить его в базе.

## 4. Загрузка кода на сервер

Самый простой способ — использовать Git (GitHub/GitLab).

1. Загрузите ваш локальный код в репозиторий GitHub.
2. На сервере клонируйте его:
```bash
cd /var/www
git clone https://github.com/ваш-логин/ваш-репозиторий.git techhacker
cd techhacker
```

## 5. Настройка переменных окружения

Создайте файл `.env` на сервере:

```bash
nano .env
```

Вставьте туда конфигурацию (замените данные на реальные):

```env
PORT=3001
DB_HOST=localhost
DB_USER=hacker
DB_PASSWORD=password
DB_NAME=techhacker
DB_PORT=3306
```

Нажмите `Ctrl+X`, затем `Y` и `Enter`, чтобы сохранить.

## 6. Запуск приложения

```bash
# Устанавливаем зависимости
npm install

# Собираем фронтенд
npm run build

# Запускаем сервер через PM2 (чтобы он работал вечно)
pm2 start server.js --name "techhacker"
pm2 save
pm2 startup
```

Теперь ваш сайт работает на порту 3001! Но нам нужно привязать домен.

## 7. Настройка Домена и Nginx

Установите Nginx (веб-сервер):
```bash
sudo apt install nginx -y
```

Создайте конфиг для сайта:
```bash
sudo nano /etc/nginx/sites-available/techhacker
```

Вставьте этот код (замените `yourdomain.com` на ваш домен):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Включите сайт и перезагрузите Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/techhacker /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 8. SSL Сертификат (HTTPS)

Чтобы сайт был безопасным и работал в Telegram, нужен HTTPS.

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
```

Следуйте инструкциям на экране.

## 🎉 Готово!

Ваш сайт доступен по адресу `https://yourdomain.com`.
```