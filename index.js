require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.json());

// Serve React build files
app.use(express.static(path.join(__dirname, 'dist')));

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token yok' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Geçersiz token' });
    req.user = user;
    next();
  });
};

// Setup Database Tables
app.get('/db-setup-ozel', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo',
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    res.send("<h1>Başarılı!</h1><p>Veritabanı tabloları oluşturuldu.</p>");
  } catch (err) {
    console.error("Kurulum hatası:", err);
    res.status(500).send("Hata: " + err.message);
  }
});

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.status(201).json({ token, user });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(400).json({ error: 'Bu email zaten kayıtlı.' });
    }
    res.status(500).json({ error: 'Kayıt hatası.' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email veya şifre yanlış.' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email veya şifre yanlış.' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Giriş hatası.' });
  }
});


// GET TASKS FOR CURRENT USER
app.get('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_id = $1 ORDER BY position ASC, id DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Veri çekme hatası:", err.code, err.message);
    res.status(500).json({ error: 'Görevler yüklenemedi.' });
  }
});

// ADD TASK
app.post('/api/tasks', authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  try {
    const query = 'INSERT INTO tasks (user_id, title, description, status) VALUES ($1, $2, $3, $4) RETURNING *';
    const values = [req.user.id, title, description, 'todo'];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Ekleme hatası:", err.message);
    res.status(500).json({ error: 'Görev eklenirken bir hata oluştu.' });
  }
});

// REORDER TASKS
app.put('/api/tasks/reorder', authenticateToken, async (req, res) => {
  const { order } = req.body;
  const client = await pool.connect(); 
  try {
    await client.query('BEGIN');
    for (const item of order) {
      await client.query(
        'UPDATE tasks SET position = $1 WHERE id = $2 AND user_id = $3',
        [item.position, parseInt(item.id), req.user.id]
      );
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Sıralama hatası:", err.message);
    res.status(500).json({ error: 'Sıralama güncellenemedi.' });
  } finally {
    client.release();
  }
});

// DELETE TASK
app.delete('/api/tasks/:id', authenticateToken, async (req, res) => {
  const taskId = req.params.id;
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *',
      [taskId, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Görev bulunamadı.' });
    res.json({ message: 'Başarıyla silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası.' });
  }
});

// UPDATE TASK STATUS
app.put('/api/tasks/:id/status', authenticateToken, async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tasks SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
      [status, req.params.id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Görev bulunamadı.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası.' });
  }
});

// EDIT TASK
app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params; 

  try {
    const result = await pool.query(
      'UPDATE tasks SET title = $1, description = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [title, description, id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Görev bulunamadı.' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Güncelleme hatası.' });
  }
});

// Serve the React app for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda hazır.`);
});