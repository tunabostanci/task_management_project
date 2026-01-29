require('dotenv').config(); // Varsayılan olarak artık .env dosyasını okur
const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 3000;

// Veritabanı bağlantı havuzu yapılandırması
const pool = new Pool({
  user: process.env.DB_USER,
  host: 'localhost',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Statik dosyalar için (ileride HTML/CSS eklediğinde gerekecek)
app.use(express.static('public'));

// Tüm görevleri listeleyen API endpoint'i
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.tasks ORDER BY id ASC');
    res.json(result.rows); 
  } catch (err) {
    console.error("Veritabanı hatası:", err.message);
    res.status(500).json({ error: 'Veritabanı bağlantısında bir sorun oluştu.' });
  }
});

app.listen(port, () => {
  console.log(`Sunucu aktif: http://localhost:${port}`);
  console.log(`API test adresi: http://localhost:${port}/api/tasks`);
});