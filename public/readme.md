# 🎯 Modern Task Manager (Full-Stack)

[![Node.js Version](https://img.shields.io/badge/node-v16%2B-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/database-PostgreSQL-blue.svg)](https://www.postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Kullanıcı dostu, modern arayüzlü ve güvenlik odaklı bir görev yönetim sistemi. Bu proje, temel CRUD operasyonlarını şık bir **Grid Layout** ve güvenli bir **Node.js** backend yapısıyla birleştirir.



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
 