import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/TasksPage.css';

export default function TasksPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const token = localStorage.getItem('authToken');
  const api = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (err) {
      console.error('Görevler yüklenemedi:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const response = await api.post('/api/tasks', {
        title: title.trim(),
        description: description.trim()
      });
      setTasks([response.data, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Görev eklenirken hata:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      console.error('Görev silinirken hata:', err);
    }
  };

  const updateTaskStatus = async (id, newStatus) => {
    try {
      const response = await api.put(`/api/tasks/${id}/status`, { status: newStatus });
      setTasks(tasks.map(task => task.id === id ? response.data : task));
    } catch (err) {
      console.error('Görev güncellenirken hata:', err);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || '');
  };

  const saveEdit = async (id) => {
    try {
      const response = await api.put(`/api/tasks/${id}`, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      setTasks(tasks.map(task => task.id === id ? response.data : task));
      setEditingId(null);
    } catch (err) {
      console.error('Görev düzenleme hatası:', err);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="tasks-container">
      <header className="tasks-header">
        <div>
          <h1>Task Manager</h1>
          <p>Hoş geldin, {user?.name || user?.email}! 👋</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Çıkış Yap
        </button>
      </header>

      <div className="tasks-content">
        <div className="input-section">
          <h2>Yeni Görev Ekle</h2>
          <form onSubmit={addTask}>
            <input
              type="text"
              placeholder="Görev başlığı"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Açıklama (opsiyonel)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
            />
            <button type="submit">Görev Ekle</button>
          </form>
        </div>

        {loading ? (
          <div className="loading">Görevler yükleniyor...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <p>Henüz görev yok. Yukarıdan yeni bir görev ekle! 📝</p>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className={`task-item ${task.status}`}>
                {editingId === task.id ? (
                  <div className="task-edit">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows="2"
                    />
                    <div className="task-edit-buttons">
                      <button onClick={() => saveEdit(task.id)}>Kaydet</button>
                      <button onClick={() => setEditingId(null)}>İptal</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-content">
                      <h3>{task.title}</h3>
                      {task.description && <p>{task.description}</p>}
                    </div>
                    <div className="task-actions">
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className={`status-select ${task.status}`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">İş Yapılıyor</option>
                        <option value="done">Tamamlandı</option>
                      </select>
                      <button
                        className="edit-btn"
                        onClick={() => startEdit(task)}
                      >
                        Düzenle
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
