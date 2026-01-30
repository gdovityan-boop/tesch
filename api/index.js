
/* 
  TECHHACKER SERVERLESS BACKEND (Vercel Native)
  v2.8.8 - Robust DB Connection Handling & Auto-Setup
*/

import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';
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

// --- DATABASE CONNECTION SAFETY ---
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
let pool = null;

if (!connectionString) {
  console.error('❌ CRITICAL: POSTGRES_URL is missing in Environment Variables!');
} else {
  try {
      // Configuration for connection pool
      const config = {
        connectionString: connectionString,
        ssl: {
          rejectUnauthorized: false
        },
        connectionTimeoutMillis: 5000, // Fail fast if DB is down (5s)
      };
      
      pool = new Pool(config);
      
      // Error listener to prevent crash on idle client errors
      pool.on('error', (err, client) => {
        console.error('Unexpected error on idle client', err);
      });

      console.log('✅ DB Pool Configured');
  } catch (e) {
      console.error('❌ DB Config Failed:', e);
  }
}

// Middleware to check DB status
const checkDb = (req, res, next) => {
    if (!pool) {
        return res.status(503).json({ error: '⛔ DATABASE_MISSING: Environment variable POSTGRES_URL is not set.' });
    }
    next();
};

// Helper: Map Postgres Snake_Case to CamelCase for Frontend
const toUserEntity = (row) => {
    if (!row) return null;
    return {
        ...row,
        avatarUrl: row.avatar_url,
        telegramId: row.telegram_id,
        registrationSource: row.registration_source
    };
};

// Global Error Handler for DB Operations
const safeQuery = async (query, params = []) => {
    if (!pool) throw new Error('DB_NOT_INIT');
    try {
        return await pool.query(query, params);
    } catch (err) {
        console.error("SQL Error:", err.message);
        if (err.message.includes('ECONNREFUSED')) {
            throw new Error('DB_CONNECTION_REFUSED: Check Vercel Storage settings. Do not use localhost in production.');
        }
        throw err;
    }
}

// --- API ROUTES ---

// 0. AUTO SETUP ENDPOINT (RUN ONCE)
app.get('/api/setup', checkDb, async (req, res) => {
    try {
        console.log('🛠️ Starting Database Initialization...');
        
        // PostgreSQL Schema creation
        const schema = `
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                role TEXT DEFAULT 'USER',
                avatar_url TEXT,
                telegram_id TEXT,
                registration_source TEXT DEFAULT 'EMAIL',
                preferences JSONB DEFAULT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                title_ru TEXT,
                description TEXT,
                description_ru TEXT,
                price DECIMAL(10, 2) DEFAULT 0.00,
                type TEXT NOT NULL,
                image TEXT,
                download_url TEXT,
                language TEXT DEFAULT 'EN',
                features JSONB DEFAULT '[]',
                features_ru JSONB DEFAULT '[]',
                is_active BOOLEAN DEFAULT TRUE,
                is_bonus BOOLEAN DEFAULT FALSE
            );

            CREATE TABLE IF NOT EXISTS service_offerings (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                price_label TEXT,
                icon_key TEXT
            );

            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                total DECIMAL(10, 2) NOT NULL,
                status TEXT DEFAULT 'PENDING',
                payment_method TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                rejection_reason TEXT
            );

            CREATE TABLE IF NOT EXISTS order_items (
                id SERIAL PRIMARY KEY,
                order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
                product_id TEXT REFERENCES products(id) ON DELETE CASCADE,
                price_at_purchase DECIMAL(10, 2) NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tickets (
                id TEXT PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                subject TEXT NOT NULL,
                status TEXT DEFAULT 'OPEN',
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ticket_messages (
                id SERIAL PRIMARY KEY,
                ticket_id TEXT REFERENCES tickets(id) ON DELETE CASCADE,
                sender TEXT NOT NULL,
                message_text TEXT NOT NULL,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS service_requests (
                id TEXT PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                service_type TEXT NOT NULL,
                contact_info TEXT NOT NULL,
                details TEXT,
                status TEXT DEFAULT 'NEW',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                is_reviewed BOOLEAN DEFAULT FALSE
            );

            CREATE TABLE IF NOT EXISTS reviews (
                id TEXT PRIMARY KEY,
                user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
                product_id TEXT,
                product_name TEXT,
                rating INTEGER,
                review_text TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS resources (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                category TEXT NOT NULL,
                image TEXT,
                download_url TEXT NOT NULL,
                version TEXT,
                date_added DATE DEFAULT CURRENT_DATE
            );
        `;

        await safeQuery(schema);

        // Seed Admin if not exists
        await safeQuery(`
            INSERT INTO users (id, email, name, role, registration_source) 
            VALUES ('admin-1', 'admin@techhacker.io', 'System Admin', 'ADMIN', 'EMAIL')
            ON CONFLICT (id) DO NOTHING;
        `);

        // Seed Services
        await safeQuery(`
            INSERT INTO service_offerings (id, title, description, price_label, icon_key) VALUES
            ('bot-dev', 'Telegram Bot Development', 'Development of turnkey bots of any complexity.', 'От 10 000 ₽', 'Bot'),
            ('ai-integration', 'AI Integration', 'Implementation of ChatGPT & Midjourney.', 'От 20 000 ₽', 'Shield'),
            ('scripting', 'Automation Scripts', 'Python/JS scripts for automation.', 'От 5 000 ₽', 'Code')
            ON CONFLICT (id) DO NOTHING;
        `);

        res.json({ success: true, message: "Database initialized successfully (Tables created & Admin seeded)" });
    } catch (err) {
        console.error("Setup Error:", err);
        res.status(500).json({ error: err.message, stack: err.stack });
    }
});

// 1. PRODUCTS
app.get('/api/products', checkDb, async (req, res) => {
  try {
    const { rows } = await safeQuery('SELECT * FROM products WHERE is_active = true');
    const products = rows.map(p => ({ ...p, price: parseFloat(p.price) }));
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', checkDb, async (req, res) => {
  try {
    const p = req.body;
    await safeQuery(
      `INSERT INTO products (id, title, title_ru, description, description_ru, price, type, image, download_url, language, features, features_ru) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [p.id, p.title, p.title_ru || p.title, p.description, p.description_ru || p.description, p.price, p.type, p.image, p.downloadUrl, p.language, JSON.stringify(p.features || []), JSON.stringify(p.features_ru || [])]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', checkDb, async (req, res) => {
  try {
    const p = req.body;
    await safeQuery(
      `UPDATE products SET title=$1, title_ru=$2, description=$3, description_ru=$4, price=$5, type=$6, image=$7, download_url=$8, language=$9, features=$10, features_ru=$11 WHERE id=$12`,
      [p.title, p.title_ru || p.title, p.description, p.description_ru || p.description, p.price, p.type, p.image, p.downloadUrl, p.language, JSON.stringify(p.features || []), JSON.stringify(p.features_ru || []), req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', checkDb, async (req, res) => {
  try {
    await safeQuery('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. ORDERS
app.get('/api/orders', checkDb, async (req, res) => {
  try {
    const { rows: orders } = await safeQuery('SELECT * FROM orders ORDER BY created_at DESC');
    const ordersWithItems = [];
    for (const order of orders) {
        const { rows: items } = await safeQuery(`SELECT p.*, oi.price_at_purchase FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`, [order.id]);
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

app.get('/api/users/:userId/orders', checkDb, async (req, res) => {
  try {
    const { rows: orders } = await safeQuery('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.params.userId]);
    const ordersWithItems = [];
    for (const order of orders) {
        const { rows: items } = await safeQuery(`SELECT p.*, oi.price_at_purchase FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1`, [order.id]);
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

app.post('/api/orders', checkDb, async (req, res) => {
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

app.put('/api/orders/:id', checkDb, async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        await safeQuery('UPDATE orders SET status = $1, rejection_reason = $2 WHERE id = $3', [status, rejectionReason, req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. AUTH (FIXED MAPPING)
app.post('/api/auth/login', checkDb, async (req, res) => {
  const body = req.body || {};
  const { email, name, telegramId, avatarUrl, registrationSource } = body;
  const isRegister = body.isRegister === true || body.isRegister === 'true';

  try {
    if (!email) throw new Error("Email is required");

    const { rows: existing } = await safeQuery('SELECT * FROM users WHERE email = $1', [email]);
    
    // TELEGRAM: Seamless logic
    if (registrationSource === 'TELEGRAM') {
        if (existing.length > 0) {
             return res.json(toUserEntity(existing[0]));
        } else {
             const userId = `user-${Date.now()}`;
             await safeQuery(
                'INSERT INTO users (id, email, name, role, avatar_url, telegram_id, registration_source) VALUES ($1, $2, $3, $4, $5, $6, $7)',
                [userId, email, name, 'USER', avatarUrl, telegramId, registrationSource]
             );
             const { rows: newUser } = await safeQuery('SELECT * FROM users WHERE id = $1', [userId]);
             return res.json(toUserEntity(newUser[0]));
        }
    }

    // EMAIL: Strict separation
    if (!isRegister) {
        if (existing.length === 0) {
            return res.status(404).json({ error: "Аккаунт не найден. Проверьте Email или зарегистрируйтесь." });
        }
        return res.json(toUserEntity(existing[0]));
    } else {
        if (existing.length > 0) {
             return res.status(409).json({ error: "Email уже зарегистрирован. Пожалуйста, войдите." });
        }
        
        const userId = `user-${Date.now()}`;
        await safeQuery(
          'INSERT INTO users (id, email, name, role, avatar_url, telegram_id, registration_source) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [userId, email, name, 'USER', avatarUrl, telegramId, registrationSource]
        );
        const { rows: newUser } = await safeQuery('SELECT * FROM users WHERE id = $1', [userId]);
        return res.json(toUserEntity(newUser[0]));
    }
  } catch (err) {
    console.error("Auth Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users', checkDb, async (req, res) => {
    try {
        const { rows } = await safeQuery('SELECT * FROM users');
        res.json(rows.map(toUserEntity));
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. TICKETS
app.get('/api/tickets', checkDb, async (req, res) => {
    try {
        const { rows: tickets } = await safeQuery('SELECT * FROM tickets ORDER BY created_at DESC');
        const ticketsWithMessages = [];
        for (const t of tickets) {
            const { rows: msgs } = await safeQuery('SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC', [t.id]);
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

app.post('/api/tickets', checkDb, async (req, res) => {
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

app.post('/api/tickets/:id/reply', checkDb, async (req, res) => {
    try {
        const { sender, message } = req.body;
        await safeQuery('INSERT INTO ticket_messages (ticket_id, sender, message_text, is_read) VALUES ($1, $2, $3, $4)', [req.params.id, sender, message, false]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tickets/:id/status', checkDb, async (req, res) => {
    try {
        const { status } = req.body;
        await safeQuery('UPDATE tickets SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. SERVICES
app.get('/api/services', checkDb, async (req, res) => {
  try {
    const { rows } = await safeQuery('SELECT * FROM service_offerings');
    const services = rows.map(s => ({ id: s.id, title: s.title, description: s.description, price: s.price_label, icon: s.icon_key }));
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/service-requests', checkDb, async (req, res) => {
    try {
        const { rows } = await safeQuery('SELECT * FROM service_requests ORDER BY created_at DESC');
        const requests = rows.map(r => ({ id: r.id, userId: r.user_id, serviceType: r.service_type, contact: r.contact_info, comment: r.details, status: r.status, date: new Date(r.created_at).toISOString().split('T')[0], reviewed: !!r.is_reviewed }));
        res.json(requests);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/service-requests', checkDb, async (req, res) => {
    try {
        const { userId, serviceType, contact, details } = req.body;
        const id = `srv-${Date.now()}`;
        await safeQuery('INSERT INTO service_requests (id, user_id, service_type, contact_info, details) VALUES ($1, $2, $3, $4, $5)', [id, userId, serviceType, contact, details]);
        res.json({ success: true, id });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/service-requests/:id/status', checkDb, async (req, res) => {
    try {
        const { status } = req.body;
        await safeQuery('UPDATE service_requests SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. RESOURCES
app.get('/api/resources', checkDb, async (req, res) => {
  try {
    const { rows } = await safeQuery('SELECT * FROM resources ORDER BY date_added DESC');
    const resources = rows.map(r => ({ id: r.id, title: r.title, description: r.description, category: r.category, image: r.image, downloadUrl: r.download_url, version: r.version, dateAdded: new Date(r.date_added).toISOString().split('T')[0] }));
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/resources', checkDb, async (req, res) => {
  try {
    const r = req.body;
    const dateAdded = r.dateAdded || new Date().toISOString().split('T')[0];
    await safeQuery('INSERT INTO resources (id, title, description, category, image, download_url, version, date_added) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [r.id, r.title, r.description, r.category, r.image, r.downloadUrl, r.version, dateAdded]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/resources/:id', checkDb, async (req, res) => {
  try {
    const r = req.body;
    await safeQuery('UPDATE resources SET title=$1, description=$2, category=$3, image=$4, download_url=$5, version=$6 WHERE id=$7', [r.title, r.description, r.category, r.image, r.downloadUrl, r.version, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/resources/:id', checkDb, async (req, res) => {
  try {
    await safeQuery('DELETE FROM resources WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. REVIEWS
app.get('/api/reviews', checkDb, async (req, res) => {
    try {
        const { rows } = await safeQuery(`SELECT r.*, u.name as userName, u.avatar_url as userAvatar FROM reviews r JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC`);
        const reviews = rows.map(r => ({ id: r.id, userId: r.user_id, userName: r.username || 'Anonymous', userAvatar: r.useravatar, productId: r.product_id, productName: r.product_name, rating: r.rating, text: r.review_text, date: new Date(r.created_at).toISOString().split('T')[0] }));
        res.json(reviews);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reviews', checkDb, async (req, res) => {
    try {
        const { id, userId, productId, productName, rating, text } = req.body;
        await safeQuery('INSERT INTO reviews (id, user_id, product_id, product_name, rating, review_text) VALUES ($1, $2, $3, $4, $5, $6)', [id, userId, productId, productName, rating, text]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/reviews/:id', checkDb, async (req, res) => {
    try {
        await safeQuery('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// HEALTH CHECK WITH REAL DB QUERY
app.get('/api/health', async (req, res) => {
    let dbStatus = 'missing_config';
    let latency = -1;

    if (pool) {
        try {
            const start = Date.now();
            await pool.query('SELECT 1');
            latency = Date.now() - start;
            dbStatus = 'connected';
        } catch (e) {
            dbStatus = 'disconnected';
            console.error('Health Check Failed:', e.message);
        }
    }

    res.json({ 
        status: dbStatus === 'connected' ? 'ok' : 'error', 
        db: dbStatus,
        latency,
        version: 'v2.8.8',
        timestamp: new Date() 
    });
});

// Only listen if running locally
if (process.env.NODE_ENV !== 'production') {
    app.listen(3000, () => {
        console.log('🚀 Local API running on http://localhost:3000/api');
    });
}

export default app;
