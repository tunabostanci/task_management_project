require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// GÖREVLERİ LİSTELE (Sadece tek bir GET rotası bırakıldı)
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY position ASC, id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error("Veri çekme hatası:", err.code, err.message);
    res.status(500).json({ error: 'Görevler yüklenemedi.' });
  }
});
//dummy database for testing
app.get('/kur-veritabani', async (req, res) => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'todo',
        position INTEGER DEFAULT 0
      );
    `);
    res.send("<h1>Başarılı!</h1><p>Tablo oluşturuldu veya zaten var.</p>");
  } catch (err) {
    res.status(500).send("<h1>Hata Oluştu!</h1><p>" + err.message + "</p>");
  }
});

// GÖREV EKLE
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;
  try {
    const query = 'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *';
    const values = [title, description, 'todo'];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Ekleme hatası:", err.message);
    res.status(500).json({ error: 'Görev eklenirken bir hata oluştu.' });
  }
});

// SIRALAMAYI GÜNCELLE (Daha güvenli yöntem)
app.put('/api/tasks/reorder', async (req, res) => {
  const { order } = req.body;
  const client = await pool.connect(); // Transaction için client kullanıyoruz
  try {
    await client.query('BEGIN');
    for (const item of order) {
      await client.query('UPDATE tasks SET position = $1 WHERE id = $2', [item.position, item.id]);
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

// GÖREV SİL (ID ile)
app.delete('/api/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [taskId]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Görev bulunamadı.' });
    res.json({ message: 'Başarıyla silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Silme hatası.' });
  }
});

// DURUM GÜNCELLE
app.put('/api/tasks/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query('UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *', [status, req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Görev bulunamadı.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Güncelleme hatası.' });
  }
});

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda hazır.`);
});