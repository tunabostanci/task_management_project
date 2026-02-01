require('dotenv').config(); // .env dosyanı okur
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

// Veritabanı bağlantı havuzu
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Render/Bulut veritabanları için bu satır zorunludur
  }
});

app.use(cors());

// HTML dosyalarını koyacağın klasörü tanıtıyoruz
app.use(express.static('public'));
app.use(express.json());
// JSON verilerini tarayıcıda görmek için endpoint
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
    res.json(result.rows); 
  } catch (err) {
    console.error("Hata:", err.message);
    res.status(500).json({ error: 'Veritabanı bağlantısı kurulamadı.' });
  }
});
app.post('/api/tasks', async (req, res) => {
  const { title, description } = req.body;
  try {
    const query = 'INSERT INTO tasks (title, description, status) VALUES ($1, $2, $3) RETURNING *';
    const values = [title, description, 'todo'];
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Görev eklenirken bir hata oluştu.' });
  }
});
app.delete('/api/tasks', async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks');
    res.json({ message: 'Tüm görevler başarıyla silindi.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Görevler silinirken bir hata oluştu.' });
  }
});
app.delete('/api/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
    const query = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
    const values = [taskId];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Görev bulunamadı.' });

    }
    res.json({ message: 'Görev başarıyla silindi.', task: result.rows[0] });
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Görev silinirken bir hata oluştu.' });
  }
});

// Log registered routes for debugging
if (app._router && app._router.stack) {
  const routes = app._router.stack
    .filter(r => r.route)
    .map(r => {
      const methods = Object.keys(r.route.methods).join(',').toUpperCase();
      return `${methods} ${r.route.path}`;
    });
  console.log('Registered routes:\n' + routes.join('\n'));
}

// Test rotası
app.all('/api/tasks/3/status', (req, res) => {
    res.send("Rota çalışıyor, metod: " + req.method);
});
// Update task status
app.put('/api/tasks/:id/status', async (req, res) => {
  console.log("Backend: İstek ulaştı! ID:", req.params.id);
  const taskId = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status alanı gerekli.' });
  try {
    const query = 'UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *';
    const values = [status, taskId];
    const result = await pool.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Görev bulunamadı.' });
    }
    res.json({ message: 'Görev durumu başarıyla güncellendi.', task: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Görev durumu güncellenirken bir hata oluştu.' });
  }
});
app.put('/api/tasks/reorder', async (req, res) => {
    const { order } = req.body; // [{id: 1, position: 0}, {id: 2, position: 1}, ...]
    try {
        // Tüm sıralamaları güncelle (Transaction kullanmak daha sağlıklıdır)
        const promises = order.map(item => 
            pool.query('UPDATE tasks SET position = $1 WHERE id = $2', [item.position, item.id])
        );
        await Promise.all(promises);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Sıralama güncellenemedi.' });
    }
});

// Listeleme rotanı da pozisyona göre sıralanacak şekilde güncelle:
app.get('/api/tasks', async (req, res) => {
    const result = await pool.query('SELECT * FROM tasks ORDER BY position ASC, id DESC');
    res.json(result.rows);
});


app.listen(port, () => {
  console.log(`Sunucu ${port} adresinde çalışıyor`);
});