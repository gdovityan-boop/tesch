
/* 
  TECHHACKER SERVERLESS BACKEND (Vercel Native)
  Moved from server.js to api/index.js for better Vercel support
*/

import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

// Load env vars from root if running locally
dotenv.config({ path: '../.env' });

const app = express();
const { Pool } = pg;

// --- MIDDLEWARE ---
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(morgan('common'));
app.use(cors());
app.use(bodyParser.json({ limit: '4mb' })); 

// --- DATABASE CONNECTION ---
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ CRITICAL: POSTGRES_URL is missing in Environment Variables!');
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- API ROUTES ---

// 1. PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products WHERE is_active = true');
    const products = rows.map(p => ({ ...p, price: parseFloat(p.price) }));
    res.json(products);
  } catch (err) {
    console.error('DB Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const p = req.body;
    await pool.query(
      `INSERT INTO products (id, title, title_ru, description, description_ru, price, type, image, download_url, language, features, features_ru) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [p.id, p.title, p.title_ru || p.title, p.description, p.description_ru || p.description, p.price, p.type, p.image, p.downloadUrl, p.language, JSON.stringify(p.features || []), JSON.stringify(p.features_ru || [])]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const p = req.body;
    await pool.query(
      `UPDATE products SET title=$1, title_ru=$2, description=$3, description_ru=$4, price=$5, type=$6, image=$7, download_url=$8, language=$9, features=$10, features_ru=$11 WHERE id=$12`,
      [p.title, p.title_ru || p.title, p.description, p.description_ru || p.description, p.price, p.type, p.image, p.downloadUrl, p.language, JSON.stringify(p.features || []), JSON.stringify(p.features_ru || []), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. ORDERS
app.get('/api/orders', async (req, res) => {
  try {
    const { rows: orders } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const ordersWithItems = [];
    for (const order of orders) {
        const { rows: items } = await pool.query(`SELECT p.*, oi.price_at_purchase FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`, [order.id]);
        ordersWithItems.push({
            ...order,
            items: items.map(p => ({ ...p, price: parseFloat(p.price) })),
            total: parseFloat(order.total),
            date: new Date(order.created_at).toISOString().split('T')[0]
        });
    }
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:userId/orders', async (req, res) => {
  try {
    const { rows: orders } = await pool.query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
    const ordersWithItems = [];
    for (const order of orders) {
        const { rows: items } = await pool.query(`SELECT p.*, oi.price_at_purchase FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`, [order.id]);
        ordersWithItems.push({
            ...order,
            items: items.map(p => ({ ...p, price: parseFloat(p.price) })),
            total: parseFloat(order.total),
            date: new Date(order.created_at).toISOString().split('T')[0]
        });
    }
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { userId, items, total, paymentMethod } = req.body;
    const orderId = `ord-${Date.now()}`; 
    await client.query('INSERT INTO orders (id, user_id, total, status, payment_method) VALUES ($1, $2, $3, $4, $5)', [orderId, userId, total, 'PENDING', paymentMethod]);
    for (const item of items) {
      await client.query('INSERT INTO order_items (order_id, product_id, price_at_purchase) VALUES ($1, $2, $3)', [orderId, item.id, item.price]);
    }
    await client.query('COMMIT');
    res.json({ success: true, orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        await pool.query('UPDATE orders SET status = $1, rejection_reason = $2 WHERE id = $3', [status, rejectionReason, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. AUTH
app.post('/api/auth/login', async (req, res) => {
  const { email, name, telegramId, avatarUrl, registrationSource, isRegister } = req.body;
  try {
    // Basic validation
    if (!email) throw new Error("Email is required");

    const { rows: existing } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    // STRICT LOGIN LOGIC
    if (!isRegister) {
        // Attempting to login
        if (existing.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден. Пожалуйста, зарегистрируйтесь. / User not found. Please register." });
        }
        return res.json(existing[0]);
    } else {
        // Attempting to register
        if (existing.length > 0) {
             return res.status(409).json({ error: "Пользователь уже существует. Пожалуйста, войдите. / User already exists. Please login." });
        }
        
        const userId = `user-${Date.now()}`;
        await pool.query(
          'INSERT INTO users (id, email, name, role, avatar_url, telegram_id, registration_source) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [userId, email, name, 'USER', avatarUrl, telegramId, registrationSource]
        );
        const { rows: newUser } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        return res.json(newUser[0]);
    }
  } catch (err) {
    console.error("Auth Failed:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM users');
        res.json(rows);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. TICKETS
app.get('/api/tickets', async (req, res) => {
    try {
        const { rows: tickets } = await pool.query('SELECT * FROM tickets ORDER BY created_at DESC');
        const ticketsWithMessages = [];
        for (const t of tickets) {
            const { rows: msgs } = await pool.query('SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC', [t.id]);
            ticketsWithMessages.push({
                ...t,
                date: new Date(t.created_at).toISOString().split('T')[0],
                messages: msgs.map(m => ({ sender: m.sender, text: m.message_text, timestamp: new Date(m.created_at).toLocaleTimeString(), read: !!m.is_read }))
            });
        }
        res.json(ticketsWithMessages);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tickets', async (req, res) => {
  const { userId, subject, message } = req.body;
  const ticketId = `tkt-${Date.now()}`;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('INSERT INTO tickets (id, user_id, subject, status) VALUES ($1, $2, $3, $4)', [ticketId, userId, subject, 'OPEN']);
    await client.query('INSERT INTO ticket_messages (ticket_id, sender, message_text, is_read) VALUES ($1, $2, $3, $4)', [ticketId, 'USER', message, false]);
    await client.query('COMMIT');
    res.json({ success: true, ticketId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.post('/api/tickets/:id/reply', async (req, res) => {
    try {
        const { sender, message } = req.body;
        await pool.query('INSERT INTO ticket_messages (ticket_id, sender, message_text, is_read) VALUES ($1, $2, $3, $4)', [req.params.id, sender, message, false]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tickets/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE tickets SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. SERVICES
app.get('/api/services', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM service_offerings');
    const services = rows.map(s => ({ id: s.id, title: s.title, description: s.description, price: s.price_label, icon: s.icon_key }));
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/service-requests', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM service_requests ORDER BY created_at DESC');
        const requests = rows.map(r => ({ id: r.id, userId: r.user_id, serviceType: r.service_type, contact: r.contact_info, comment: r.details, status: r.status, date: new Date(r.created_at).toISOString().split('T')[0], reviewed: !!r.is_reviewed }));
        res.json(requests);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/service-requests', async (req, res) => {
    try {
        const { userId, serviceType, contact, details } = req.body;
        const id = `srv-${Date.now()}`;
        await pool.query('INSERT INTO service_requests (id, user_id, service_type, contact_info, details) VALUES ($1, $2, $3, $4, $5)', [id, userId, serviceType, contact, details]);
        res.json({ success: true, id });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/service-requests/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE service_requests SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. RESOURCES
app.get('/api/resources', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM resources ORDER BY date_added DESC');
    const resources = rows.map(r => ({ id: r.id, title: r.title, description: r.description, category: r.category, image: r.image, downloadUrl: r.download_url, version: r.version, dateAdded: new Date(r.date_added).toISOString().split('T')[0] }));
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resources', async (req, res) => {
  try {
    const r = req.body;
    const dateAdded = r.dateAdded || new Date().toISOString().split('T')[0];
    await pool.query('INSERT INTO resources (id, title, description, category, image, download_url, version, date_added) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [r.id, r.title, r.description, r.category, r.image, r.downloadUrl, r.version, dateAdded]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/resources/:id', async (req, res) => {
  try {
    const r = req.body;
    await pool.query('UPDATE resources SET title=$1, description=$2, category=$3, image=$4, download_url=$5, version=$6 WHERE id=$7', [r.title, r.description, r.category, r.image, r.downloadUrl, r.version, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/resources/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM resources WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. REVIEWS
app.get('/api/reviews', async (req, res) => {
    try {
        const { rows } = await pool.query(`SELECT r.*, u.name as userName, u.avatar_url as userAvatar FROM reviews r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC`);
        const reviews = rows.map(r => ({ id: r.id, userId: r.user_id, userName: r.username || 'Anonymous', userAvatar: r.useravatar, productId: r.product_id, productName: r.product_name, rating: r.rating, text: r.review_text, date: new Date(r.created_at).toISOString().split('T')[0] }));
        res.json(reviews);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { id, userId, productId, productName, rating, text } = req.body;
        await pool.query('INSERT INTO reviews (id, user_id, product_id, product_name, rating, review_text) VALUES ($1, $2, $3, $4, $5, $6)', [id, userId, productId, productName, rating, text]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), server: 'Vercel Serverless Function' });
});

// Only listen if running locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log('🚀 Local API running on http://localhost:3000/api');
    });
}

export default app;
