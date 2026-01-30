
/* 
  TECHHACKER BACKEND (Vercel & Production Ready)
*/

import dotenv from 'dotenv';
import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Helper for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(bodyParser.json());

// --- SERVE STATIC FILES ---

// 1. Assets (JS, CSS, Images inside /assets) - Cache for 1 year
app.use('/assets', express.static(path.join(__dirname, 'dist', 'assets'), {
  maxAge: '1y',
  immutable: true
}));

// 2. All other static files (favicon, manifest, etc.)
app.use(express.static(path.join(__dirname, 'dist')));

// Request Logger (Only in Dev or non-static requests)
app.use((req, res, next) => {
  if (!req.url.includes('.') && !req.url.startsWith('/assets')) {
      // console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Database Connection
let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      ssl: { rejectUnauthorized: false }, // Required for most cloud DBs (Aiven, PlanetScale)
      waitForConnections: true,
      connectionLimit: 5, // Lower limit for Serverless environments to avoid exhaustion
      queueLimit: 0,
      connectTimeout: 10000 
    });
  }
  return pool;
}

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const db = getPool();
    await db.query('SELECT 1');
    res.json({ status: 'Online', db: 'Connected', timestamp: new Date(), env: process.env.VERCEL ? 'Vercel' : 'VPS/Local' });
  } catch (e) {
    console.error('Health Check Failed:', e.message);
    res.status(503).json({ status: 'Error', db: 'Disconnected', details: e.message });
  }
});

// --- API ROUTES ---

// 1. PRODUCTS
app.get('/api/products', async (req, res) => {
  try {
    const db = getPool();
    const [rows] = await db.query('SELECT * FROM products WHERE is_active = 1');
    const products = rows.map(p => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
      features_ru: typeof p.features_ru === 'string' ? JSON.parse(p.features_ru) : p.features_ru,
      price: parseFloat(p.price)
    }));
    res.json(products);
  } catch (err) {
    console.error("GET /products error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const p = req.body;
    const db = getPool();
    await db.query(
      `INSERT INTO products (id, title, title_ru, description, description_ru, price, type, image, download_url, language, features, features_ru) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        p.id, p.title, p.title_ru || p.title, p.description, p.description_ru || p.description, 
        p.price, p.type, p.image, p.downloadUrl, p.language, 
        JSON.stringify(p.features || []), JSON.stringify(p.features_ru || [])
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const p = req.body;
    const db = getPool();
    await db.query(
      `UPDATE products SET title=?, title_ru=?, description=?, description_ru=?, price=?, type=?, image=?, download_url=?, language=?, features=?, features_ru=? WHERE id=?`,
      [
        p.title, p.title_ru || p.title, p.description, p.description_ru || p.description, 
        p.price, p.type, p.image, p.downloadUrl, p.language, 
        JSON.stringify(p.features || []), JSON.stringify(p.features_ru || []),
        req.params.id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const db = getPool();
    await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. ORDERS
app.get('/api/orders', async (req, res) => {
  try {
    const db = getPool();
    const [orders] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    
    const ordersWithItems = [];
    for (const order of orders) {
        const [items] = await db.query(`
            SELECT p.*, oi.price_at_purchase 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [order.id]);
        
        const parsedItems = items.map(p => ({
             ...p,
             features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
             features_ru: typeof p.features_ru === 'string' ? JSON.parse(p.features_ru) : p.features_ru,
             price: parseFloat(p.price)
        }));

        ordersWithItems.push({
            ...order,
            items: parsedItems,
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
    const db = getPool();
    const [orders] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.params.userId]);
    
    const ordersWithItems = [];
    for (const order of orders) {
        const [items] = await db.query(`
            SELECT p.*, oi.price_at_purchase 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        `, [order.id]);
        
        const parsedItems = items.map(p => ({
             ...p,
             features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
             features_ru: typeof p.features_ru === 'string' ? JSON.parse(p.features_ru) : p.features_ru,
             price: parseFloat(p.price)
        }));

        ordersWithItems.push({
            ...order,
            items: parsedItems,
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
  const db = getPool();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { userId, items, total, paymentMethod } = req.body;
    const orderId = `ord-${Date.now()}`; 

    await connection.query(
      'INSERT INTO orders (id, user_id, total, status, payment_method) VALUES (?, ?, ?, ?, ?)',
      [orderId, userId, total, 'PENDING', paymentMethod]
    );

    for (const item of items) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, price_at_purchase) VALUES (?, ?, ?)',
        [orderId, item.id, item.price]
      );
    }

    await connection.commit();
    res.json({ success: true, orderId });

  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.put('/api/orders/:id', async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const db = getPool();
        await db.query('UPDATE orders SET status = ?, rejection_reason = ? WHERE id = ?', [status, rejectionReason, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. AUTH & USERS
app.post('/api/auth/login', async (req, res) => {
  const { email, name, telegramId, avatarUrl, registrationSource } = req.body;
  const db = getPool();
  try {
    const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.json(existing[0]);

    const userId = `user-${Date.now()}`;
    await db.query(
      'INSERT INTO users (id, email, name, role, avatar_url, telegram_id, registration_source) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, email, name, 'USER', avatarUrl, telegramId, registrationSource]
    );
    const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
    res.json(newUser[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', async (req, res) => {
    try {
        const db = getPool();
        const [users] = await db.query('SELECT * FROM users');
        res.json(users);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. TICKETS
app.get('/api/tickets', async (req, res) => {
    try {
        const db = getPool();
        const [tickets] = await db.query('SELECT * FROM tickets ORDER BY created_at DESC');
        
        const ticketsWithMessages = [];
        for (const t of tickets) {
            const [msgs] = await db.query('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC', [t.id]);
            ticketsWithMessages.push({
                ...t,
                date: new Date(t.created_at).toISOString().split('T')[0],
                messages: msgs.map(m => ({
                    sender: m.sender,
                    text: m.message_text,
                    timestamp: new Date(m.created_at).toLocaleTimeString(),
                    read: !!m.is_read
                }))
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
  const db = getPool();
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('INSERT INTO tickets (id, user_id, subject, status) VALUES (?, ?, ?, ?)', [ticketId, userId, subject, 'OPEN']);
    await connection.query('INSERT INTO ticket_messages (ticket_id, sender, message_text, is_read) VALUES (?, ?, ?, ?)', [ticketId, 'USER', message, false]);
    await connection.commit();
    res.json({ success: true, ticketId });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

app.post('/api/tickets/:id/reply', async (req, res) => {
    try {
        const { sender, message } = req.body;
        const db = getPool();
        await db.query('INSERT INTO ticket_messages (ticket_id, sender, message_text, is_read) VALUES (?, ?, ?, ?)', 
            [req.params.id, sender, message, false]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tickets/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const db = getPool();
        await db.query('UPDATE tickets SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. SERVICES
app.get('/api/services', async (req, res) => {
  try {
    const db = getPool();
    const [rows] = await db.query('SELECT * FROM service_offerings');
    const services = rows.map(s => ({
      id: s.id,
      title: s.title,
      description: s.description,
      price: s.price_label, 
      icon: s.icon_key      
    }));
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/service-requests', async (req, res) => {
    try {
        const db = getPool();
        const [rows] = await db.query('SELECT * FROM service_requests ORDER BY created_at DESC');
        const requests = rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            serviceType: r.service_type,
            contact: r.contact_info,
            comment: r.details,
            status: r.status,
            date: new Date(r.created_at).toISOString().split('T')[0],
            reviewed: !!r.is_reviewed
        }));
        res.json(requests);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/service-requests', async (req, res) => {
    try {
        const { userId, serviceType, contact, details } = req.body;
        const id = `srv-${Date.now()}`;
        const db = getPool();
        await db.query('INSERT INTO service_requests (id, user_id, service_type, contact_info, details) VALUES (?, ?, ?, ?, ?)',
            [id, userId, serviceType, contact, details]);
        res.json({ success: true, id });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/service-requests/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const db = getPool();
        await db.query('UPDATE service_requests SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. RESOURCES
app.get('/api/resources', async (req, res) => {
  try {
    const db = getPool();
    const [rows] = await db.query('SELECT * FROM resources');
    const resources = rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        category: r.category,
        image: r.image,
        downloadUrl: r.download_url,
        version: r.version,
        dateAdded: new Date(r.date_added).toISOString().split('T')[0]
    }));
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. REVIEWS
app.get('/api/reviews', async (req, res) => {
    try {
        const db = getPool();
        const [rows] = await db.query(`
            SELECT r.*, u.name as userName, u.avatar_url as userAvatar 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
        `);
        const reviews = rows.map(r => ({
            id: r.id,
            userId: r.user_id,
            userName: r.userName || 'Anonymous',
            userAvatar: r.userAvatar,
            productId: r.product_id,
            productName: r.product_name,
            rating: r.rating,
            text: r.review_text,
            date: new Date(r.created_at).toISOString().split('T')[0]
        }));
        res.json(reviews);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reviews', async (req, res) => {
    try {
        const { id, userId, productId, productName, rating, text } = req.body;
        const db = getPool();
        await db.query('INSERT INTO reviews (id, user_id, product_id, product_name, rating, review_text) VALUES (?, ?, ?, ?, ?, ?)',
            [id, userId, productId, productName, rating, text]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    try {
        const db = getPool();
        await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// CATCH-ALL ROUTE (For SPA React Router)
// Only serve index.html if request is not starting with /api
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    } else {
        res.status(404).json({ error: 'API route not found' });
    }
});

// VERCEL CONFIGURATION
// Only run app.listen if NOT in Vercel environment.
// Vercel serverless functions export the app instead.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 TECHHACKER SERVER STARTED (Local/VPS)`);
    console.log(`📡 Port: ${PORT}`);
    if (process.env.DB_HOST) {
      console.log(`🗄️ Database Configured: ${process.env.DB_HOST}`);
    } else {
      console.log(`⚠️ Database config missing in .env`);
    }
  });
}

// Export for Vercel
export default app;
