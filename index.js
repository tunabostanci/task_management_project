require('dotenv').config(); // .env dosyanı okur
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Veritabanı bağlantı havuzu
const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// HTML dosyalarını koyacağın klasörü tanıtıyoruz
app.use(express.static('public'));
app.use(express.json());
// JSON verilerini tarayıcıda görmek için endpoint
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.tasks ORDER BY id ASC');
    res.json(result.rows); 
  } catch (err) {
    console.error("Hata:", err.message);
    res.status(500).json({ error: 'Veritabanı bağlantısı kurulamadı.' });
  }
});
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;
  try {
    const query = 'INSERT INTO public.tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *';
    const values = [title, description, 'todo'];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Görev eklenirken bir hata oluştu.' });
  }
});

app.listen(port, () => {
  console.log(`Sunucu http://localhost:${port} adresinde çalışıyor`);
});