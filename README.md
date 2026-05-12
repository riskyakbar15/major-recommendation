# 🎓 Sistem Pakar Rekomendasi Jurusan

Aplikasi web untuk membantu calon mahasiswa mendapatkan rekomendasi jurusan kuliah berdasarkan jawaban konsultasi minat dan bakat. Sistem menggunakan pendekatan **Forward Chaining** untuk pencocokan aturan dan **Certainty Factor** untuk menghitung tingkat keyakinan hasil rekomendasi.

## 📋 Ringkasan Proyek

Proyek ini terdiri dari dua aplikasi terpisah:

- **🔧 Backend**: REST API berbasis Go dan Gin untuk autentikasi, konsultasi, manajemen data, dan statistik.
- **🎨 Frontend**: Antarmuka web berbasis Next.js, React, Tailwind CSS, dan TypeScript untuk pengalaman pengguna dan dashboard admin.

## ✨ Fitur Utama

- 🎯 Rekomendasi jurusan berdasarkan jawaban konsultasi.
- 📊 Perhitungan hasil dengan metode Certainty Factor.
- 🔗 Proses inferensi berbasis Forward Chaining.
- 👨‍💼 Dashboard admin untuk mengelola jurusan, pertanyaan, dan rules.
- 🔐 Autentikasi JWT dengan access token dan refresh token.
- 📈 Halaman statistik dan riwayat konsultasi.
- 📱 Tampilan responsif untuk desktop dan perangkat mobile.

## 🛠️ Teknologi yang Digunakan

### 🔧 Tech Backend

- 🐹 Go 1.21
- 🍸 Gin
- 🗄️ MySQL
- 🔑 JWT (`github.com/golang-jwt/jwt/v5`)
- ⚙️ `godotenv`

### 🎨 Tech Frontend

- ⚛️ Next.js 16.2.6
- ⚛️ React 19.2.6
- 📘 TypeScript
- 🎨 Tailwind CSS 3.4.1
- 📡 Axios
- 🎯 Lucide React
- 📊 Recharts

## 📁 Struktur Proyek

```text
major-recommendation/
├── backend/
│   ├── internal/
│   │   ├── auth/          # utilitas autentikasi JWT
│   │   ├── config/        # konfigurasi aplikasi
│   │   ├── database/      # koneksi MySQL
│   │   ├── expert/        # Forward Chaining dan Certainty Factor
│   │   ├── handlers/      # HTTP handler
│   │   ├── middleware/     # middleware autentikasi
│   │   ├── models/        # struktur data
│   │   ├── repository/    # akses data ke database
│   │   └── services/      # business logic
│   ├── migrations/        # schema dan seed data SQL
│   ├── go.mod
│   └── main.go
├── frontend/
│   ├── app/               # halaman Next.js
│   ├── hooks/             # custom React hooks
│   ├── lib/               # API client
│   ├── types/             # tipe TypeScript
│   ├── package.json
│   └── next.config.js
└── README.md
```

## ✅ Prasyarat

Pastikan environment berikut sudah tersedia:

| Komponen        | Versi minimum |
| --------------- | ------------- |
| Go              | 1.21          |
| Node.js         | 18            |
| npm             | 9             |
| MySQL / MariaDB | 8             |

## ⚙️ Konfigurasi Environment

### 🔧 Backend

Buat file `backend/.env` dengan isi seperti berikut:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=sistem_pakar

JWT_SECRET=your-super-secret-key
JWT_ACCESS_EXPIRE=24h
JWT_REFRESH_EXPIRE=168h

SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 🎨 Frontend

Buat file `frontend/.env.local` dengan isi berikut:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 🚀 Instalasi dan Menjalankan Aplikasi

### 1️⃣ Siapkan database

```bash
mysql -u root -p -e "CREATE DATABASE sistem_pakar;"
mysql -u root -p sistem_pakar < backend/migrations/001_schema.sql
mysql -u root -p sistem_pakar < backend/migrations/002_seed_data.sql
```

### 2️⃣ Jalankan backend

```bash
cd backend
go mod download
go run main.go
```

Backend berjalan di `http://localhost:8080`.

### 3️⃣ Jalankan frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

## 📡 Endpoint API

### 🔓 Public

| Method | Endpoint                       | Keterangan                                        |
| ------ | ------------------------------ | ------------------------------------------------- |
| GET    | `/api/questions`               | Mengambil daftar pertanyaan konsultasi            |
| POST   | `/api/consultation`            | Mengirim jawaban konsultasi                       |
| GET    | `/api/consultation/:sessionId` | Mengambil hasil konsultasi berdasarkan session ID |

### 🔐 Admin

| Method | Endpoint                   | Keterangan             |
| ------ | -------------------------- | ---------------------- |
| POST   | `/api/admin/login`         | Login admin            |
| POST   | `/api/admin/refresh`       | Refresh access token   |
| POST   | `/api/admin/logout`        | Logout admin           |
| GET    | `/api/admin/me`            | Ambil data admin aktif |
| GET    | `/api/admin/jurusan`       | Daftar jurusan         |
| GET    | `/api/admin/pertanyaan`    | Daftar pertanyaan      |
| GET    | `/api/admin/rules`         | Daftar rules           |
| GET    | `/api/admin/consultations` | Riwayat konsultasi     |
| GET    | `/api/admin/statistics`    | Statistik konsultasi   |

## 🔄 Alur Konsultasi

1. Pengguna membuka halaman konsultasi dan menjawab daftar pertanyaan.
2. Frontend mengirim jawaban ke backend.
3. Backend menyimpan konsultasi, jawaban, dan hasil rekomendasi.
4. Mesin pakar menghitung rekomendasi jurusan menggunakan Forward Chaining dan Certainty Factor.
5. Hasil ditampilkan di halaman hasil konsultasi.

## 🧠 Metode Sistem Pakar

### 🔗 Forward Chaining

Metode ini memulai dari fakta yang diberikan pengguna, lalu mencocokkannya dengan aturan yang aktif untuk menghasilkan kandidat jurusan yang sesuai.

### 📊 Certainty Factor

Metode ini digunakan untuk menghitung tingkat keyakinan setiap kandidat jurusan berdasarkan kombinasi nilai jawaban dan bobot aturan.

Formula dasar yang digunakan:

- `CF(H, E) = CF(E) x CF(Rule)`
- `CF kombinasi = CF1 + CF2 x (1 - CF1)`

## 💻 Pengembangan Lokal

Beberapa perintah yang sering dipakai saat pengembangan:

```bash
# Backend
cd backend
go build
go test ./...

# Frontend
cd frontend
npm run build
npm run lint
```

## 📝 Catatan Implementasi

- Backend menggunakan arsitektur berlapis: handler, service, repository.
- Konsultasi disimpan secara atomik dengan transaction untuk menjaga integritas data.
- Frontend menggunakan App Router Next.js dan hook terpisah untuk state konsultasi.
- File `.gitignore` sudah disesuaikan untuk artefak umum Go dan Next.js.

---

Made With ❤️ By [riskyakbar15](https://github.com/riskyakbar15) For Education.
