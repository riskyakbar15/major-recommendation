# 🎓 Sistem Pakar Jurusan

[![Go](https://img.shields.io/badge/Go-1.20+-00ADD8?style=flat-square&logo=go&logoColor=white)](https://golang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> Aplikasi sistem pakar untuk rekomendasi jurusan kuliah berbasis minat dan bakat menggunakan metode **Certainty Factor** dan **Forward Chaining**.

---

## ✨ Fitur Utama

- 🧠 **Sistem Pakar** — Rekomendasi jurusan berdasarkan analisis minat dan bakat
- 📊 **Dashboard Admin** — Kelola jurusan, pertanyaan, dan rules
- 📈 **Statistik** — Visualisasi data konsultasi
- 🔐 **Autentikasi JWT** — Keamanan dengan access & refresh token
- 📱 **Responsive Design** — Tampilan optimal di semua perangkat

---

## 📁 Struktur Proyek

```Struktur Proyek
sistem-pakar-jurusan/
├── backend/                 # API Server (Go + Gin)
│   ├── internal/
│   │   ├── auth/            # JWT authentication
│   │   ├── config/          # Konfigurasi aplikasi
│   │   ├── database/        # Koneksi database
│   │   ├── expert/          # Certainty Factor & Forward Chaining
│   │   ├── handlers/        # HTTP handlers
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/          # Data models
│   │   ├── repository/      # Database queries
│   │   └── services/        # Business logic
│   └── migrations/          # SQL schema & seed data
│
└── frontend/                # Web UI (Next.js + Tailwind CSS)
    └── src/
        ├── app/             # Pages & layouts
        ├── hooks/           # Custom React hooks
        ├── lib/             # API client
        └── types/           # TypeScript definitions
```

---

## 🛠️ Prasyarat

| Software      | Versi Minimum |
| ------------- | ------------- |
| Go            | 1.20+         |
| Node.js       | 18+           |
| npm           | 9+            |
| MySQL/MariaDB | 8.0+          |

---

## ⚙️ Konfigurasi Environment

### Backend (`backend/.env`)

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sistem_pakar

# JWT
JWT_SECRET=your-super-secret-key
JWT_ACCESS_EXPIRE=24h
JWT_REFRESH_EXPIRE=168h

# Server
SERVER_PORT=8080
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

---

## 🚀 Cara Menjalankan

### 1. Setup Database

```bash
# Buat database
mysql -u root -p -e "CREATE DATABASE sistem_pakar;"

# Jalankan migrasi
mysql -u root -p sistem_pakar < backend/migrations/001_schema.sql
mysql -u root -p sistem_pakar < backend/migrations/002_seed_data.sql
```

### 2. Jalankan Backend

```bash
cd backend
go mod download
go run main.go
```

Server berjalan di `http://localhost:8080`

### 3. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`

---

## 📚 API Endpoints

### Public

| Method | Endpoint                | Deskripsi                    |
| ------ | ----------------------- | ---------------------------- |
| GET    | `/api/questions`        | Daftar pertanyaan konsultasi |
| POST   | `/api/consultation`     | Submit jawaban konsultasi    |
| GET    | `/api/consultation/:id` | Hasil konsultasi             |

### Admin (🔒 Protected)

| Method | Endpoint                | Deskripsi            |
| ------ | ----------------------- | -------------------- |
| POST   | `/api/admin/login`      | Login admin          |
| GET    | `/api/admin/jurusan`    | CRUD Jurusan         |
| GET    | `/api/admin/pertanyaan` | CRUD Pertanyaan      |
| GET    | `/api/admin/rules`      | CRUD Rules           |
| GET    | `/api/admin/statistics` | Statistik konsultasi |

---

## 🧪 Metode Sistem Pakar

### Certainty Factor (CF)

Formula kombinasi CF:

- **CF(H,E) = CF(E) × CF(Rule)**
- **CF Kombinasi = CF1 + CF2 × (1 - CF1)**

### Forward Chaining

Proses inferensi:

1. Kumpulkan fakta (jawaban user)
2. Evaluasi rules yang sesuai
3. Hitung CF untuk setiap jurusan
4. Ranking berdasarkan CF tertinggi

---

## 📝 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

Made with ❤️ for education
