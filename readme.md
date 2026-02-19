# Task Manager with React & Authentication

A React-based task management application with user authentication and per-user task isolation.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```
DATABASE_URL=postgresql://user:password@localhost:5432/taskdb
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=3000
```

### 3. Database Setup

1. First, start the Express backend:
```bash
npm start
```

2. Visit `http://localhost:3000/db-setup-ozel` to create tables

3. In another terminal, start the Vite development server:
```bash
npm run dev
```

4. Open `http://localhost:5173` in your browser

## Features

✅ **User Authentication**
- Register new users
- Login with email/password
- JWT token-based auth
- Password hashing with bcrypt

✅ **User-Specific Tasks**
- Tasks are isolated per user
- Create, read, update, delete tasks
- Change task status (To Do, In Progress, Done)
- Edit task titles and descriptions

✅ **Protected Routes**
- Auth page loads first
- Redirect to login if not authenticated
- Auto-redirect to tasks if already logged in

## Project Structure

```
postgre_deneme/
├── index.js              # Express backend
├── src/
│   ├── App.jsx          # Main React component
│   ├── index.jsx        # React entry point
│   ├── App.css
│   ├── index.css
│   ├── pages/
│   │   ├── AuthPage.jsx
│   │   └── TasksPage.jsx
│   └── styles/
│       ├── AuthPage.css
│       └── TasksPage.css
├── public/
│   └── index.html       # HTML template
└── vite.config.js       # Vite configuration
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Production Build

```bash
npm run build
# Then serve with npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Tasks (Require JWT Token)
- `GET /api/tasks` - Get user's tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/status` - Update task status
- `PUT /api/tasks/reorder` - Reorder tasks

## Technologies Used

- **Frontend**: React 18, React Router, Axios
- **Backend**: Express.js, PostgreSQL
- **Auth**: JWT, bcrypt
- **Build**: Vite
- **Styling**: CSS (no frameworks)



---

## ✨ Öne Çıkan Özellikler

| Özellik | Açıklama |
| :--- | :--- |
| 🎨 **Modern UI** | Inter fontu, CSS Grid ve Flexbox ile responsive tasarım. |
| 🛡️ **Güvenlik** | Parameterized Query yapısı ile SQL Injection koruması. |
| ⚡ **Hızlı UX** | Fetch API ve asenkron fonksiyonlarla sayfa yenilemeden işlem. |
| 🌓 **Durum Yönetimi** | Tek tıkla "Yapılacak" ve "Tamamlandı" arası geçiş. |

---

## 🛠️ Teknoloji Yığını

* **Frontend:** HTML5, CSS3 (Custom Variables, Grid), JavaScript (ES6+).
* **Backend:** Node.js & Express (REST API).
* **Veritabanı:** PostgreSQL & `pg` library.
* **Güvenlik:** `dotenv` ile ortam değişkenleri yönetimi.

---

## 📦 Kurulum, Yapılandırma ve Çalıştırma

Aşağıdaki adımları sırasıyla takip ederek projeyi yerel makinenizde ayağa kaldırabilirsiniz:

### 1. Dosyaları Klonlayın ve Bağımlılıkları Yükleyin
```bash
git clone <sizin-repo-linkiniz>
cd task-manager-project
npm install
```
## 2. Veritabanı Şemasını Hazırlayın
PostgreSQL terminalinizde veya pgAdmin üzerinde önce bir veritabanı oluşturun, ardından şu tablo yapısını kurun:

```SQL
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
## Veritabanı Tablo Yapısı Detayları: 
| Kolon | Tip | Özellik | Açıklama | 
| :--- | :--- | :--- | :--- | 
| id | SERIAL | PRIMARY KEY | Benzersiz görev kimliği. | |
 title | VARCHAR(255) | NOT NULL | Görevin başlığı. | 
 | description| TEXT | - | Görevin detaylı açıklaması. | 
 | status | VARCHAR(50) | DEFAULT 'todo' | Durum: todo veya done. |

## 3. Ortam Değişkenlerini Ayarlayın (.env)
Proje kök dizininde bir .env dosyası oluşturun ve veritabanı bilgilerinizi buraya girin:

```
DB_USER=postgres_kullanici_adiniz
DB_NAME=veritabani_adiniz
DB_PASSWORD=sifreniz
DB_HOST=localhost
DB_PORT=5432
```

## 4. Uygulamayı Başlatın
Her şey hazır olduğunda sunucuyu çalıştırın:

```Bash
node server.js
```

Tarayıcınızdan şu adrese giderek uygulamayı kullanmaya başlayabilirsiniz: http://localhost:3000

## 🔒 Güvenlik Yaklaşımı (SQL Injection Koruması)
Bu projede kullanıcı girdileri hiçbir zaman doğrudan SQL sorgularına gömülmez. Veritabanı güvenliği için Parametreli Sorgular (Parameterized Queries) kullanılır.

### Örnek Güvenli Sorgu:

```JavaScript
// $1 ve $2 yer tutucuları kullanılarak veri güvenli bir şekilde işlenir.
const query = 'INSERT INTO tasks (title, description) VALUES ($1, $2)';
const values = [req.body.title, req.body.description];
await pool.query(query, values);
```
### 📝 Lisans ve Geliştirici
Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştiren:
 Tuna Bostanci
 