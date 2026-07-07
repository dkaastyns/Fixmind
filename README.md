# E-Lapor DPRD (FixMind)

E-Lapor DPRD (dengan nama kode FixMind) adalah sebuah sistem manajemen pelaporan dan pemeliharaan fasilitas modern berbasis _Artificial Intelligence_ (AI) yang dirancang khusus untuk mengelola, melacak, dan menyelesaikan berbagai kerusakan atau kendala fasilitas di lingkungan gedung dewan maupun perkantoran.

Sistem ini membantu mempermudah pelaporan, di mana AI (menggunakan Gemini 2.5 Flash) secara otomatis menganalisis masalah, menentukan prioritas, memberikan estimasi waktu, serta menyajikan rekomendasi perbaikan sebelum diteruskan kepada teknisi yang relevan.

## Fitur Utama
- **Pelaporan Pintar dengan AI:** Identifikasi prioritas, kategori masalah, dan estimasi pengerjaan otomatis.
- **Linimasa (Timeline) Pelaporan:** Lacak status tiket dari mulai dibuat, ditugaskan, hingga selesai dikerjakan.
- **Ekspor Data & Laporan (Analytics):** Analisis kinerja pemeliharaan fasilitas dalam bentuk metrik visual dan ekspor (CSV, Excel, PDF) dengan rentang waktu.
- **Notifikasi Real-time:** Memberikan pembaruan instan (*WebSockets*) kepada admin, teknisi, maupun pelapor jika status laporan berubah.
- **Manajemen Pengguna Terpusat:** Admin dapat mengelola peran _User_, _Technician_, dan _Admin_ dengan kontrol akses spesifik.

---

## Tech Stack (Tumpukan Teknologi)

Proyek ini menggunakan arsitektur _Clean Architecture_ dan dipisahkan menjadi dua bagian utama (Frontend & Backend), tanpa menggunakan ORM berat untuk menjaga performa optimal.

| Komponen | Teknologi yang Digunakan |
|----------|---------------------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, TanStack Query, Zustand, Framer Motion |
| **Backend** | NestJS 11, JWT (Otentikasi), WebSockets (Socket.io), class-validator |
| **Database** | PostgreSQL + Ekstensi `pgvector` (untuk Semantic Search / RAG AI) |
| **Kueri DB** | _Raw SQL_ melalui `postgres.js` (performa dan kontrol penuh) |
| **Kecerdasan Buatan (AI)** | Gemini 2.5 Flash (Google Generative AI) & Groq AI (Llama 3.1 sebagai Fallback) |
| **Runtime & Package** | Bun & Node.js (npm) |

---

## Panduan Menjalankan Proyek (Quick Start)

### Persyaratan Sistem
- [Node.js](https://nodejs.org/) & [Bun](https://bun.sh/) 1.3+
- PostgreSQL 16+ dengan ekstensi **pgvector** sudah terpasang.
- Buat sebuah database kosong di PostgreSQL bernama `fixmind`.

### 1. Konfigurasi Environment (Variabel Lingkungan)
Untuk **Backend**:
```powershell
cd backend
copy .env.example .env
# Edit file .env: Sesuaikan DATABASE_URL dengan kredensial PostgreSQL Anda
# Pastikan juga GEMINI_API_KEY Anda sudah terisi
# Opsional: Isi GROQ_API_KEY sebagai mesin AI cadangan (fallback) jika Gemini bermasalah
```

Untuk **Frontend**:
```powershell
cd frontend
copy .env.example .env
```

### 2. Migrasi Database dan Data Awal (Seeding)
Siapkan struktur database dan isi data awal untuk ujicoba.
```powershell
cd backend
npm run migrate
npm run seed
```
> **Catatan:** Akun admin default setelah seeding adalah: `admin@fixmind.local` / `Admin123!@#`

### 3. Menjalankan Server Pengembangan
Anda perlu menjalankan Backend dan Frontend di terminal yang terpisah.

**Terminal 1 (Backend):**
```powershell
cd backend
npm run start:dev
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

- **Akses Aplikasi (Frontend):** `http://localhost:5173`
- **Akses API (Backend):** `http://localhost:3000/api/v1`
- **Pengecekan Status Server:** `http://localhost:3000/api/v1/health`

---

## Panduan Pengujian (Testing) Backend API

### 1. Pengujian Manual API (Endpoint GET, POST, dll)
Untuk menguji dan berinteraksi langsung dengan API (seperti mengambil data atau mengirim data), Anda dapat menggunakan aplikasi *REST Client* seperti **Postman**, **Insomnia**, atau **Thunder Client** di VSCode. Anda juga dapat menggunakan perintah `cURL` dari terminal.

**URL Dasar API:** `http://localhost:3000/api/v1`

**A. Langkah 1: Login & Dapatkan Token Autentikasi (POST)**
Karena sebagian besar *endpoint* membutuhkan autentikasi, Anda harus *login* terlebih dahulu untuk mendapatkan `accessToken`.
- **Endpoint:** `POST /auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "admin@fixmind.local",
    "password": "Admin123!@#"
  }
  ```
- **Contoh Response:**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC...",
      "user": { "role": "ADMIN", ... }
    }
  }
  ```

**B. Langkah 2: Menggunakan Token untuk Request Selanjutnya (GET, POST, dll)**
Salin `accessToken` dari hasil *login* di atas, lalu masukkan ke dalam **Headers** (*Authorization: Bearer <token>*) pada setiap *request* yang membutuhkan izin.

*Contoh 1: Mengambil Data Laporan (GET)*
- **Endpoint:** `GET /reports`
- **Headers:** `Authorization: Bearer eyJhb...`
- **Hasil:** Mengembalikan daftar laporan masalah fasilitas.

*Contoh 2: Membuat Laporan Baru (POST)*
- **Endpoint:** `POST /reports`
- **Headers:** `Authorization: Bearer eyJhb...`
- **Body (JSON):**
  ```json
  {
    "title": "AC Ruangan Rapat Mati",
    "description": "AC tidak dingin sama sekali",
    "roomId": "123-uuid-ruangan"
  }
  ```

*Contoh Menggunakan cURL (Terminal):*
```bash
curl -X GET "http://localhost:3000/api/v1/reports" \
     -H "Authorization: Bearer MASUKKAN_TOKEN_ANDA_DISINI"
```
> **Catatan:** Untuk melihat daftar lengkap seluruh *endpoint* yang tersedia (termasuk *routes* untuk _Users_, _Rooms_, _Analytics_, dll), silakan merujuk pada file [docs/API.md](docs/API.md).

---

### 2. Pengujian Otomatis (Unit Test & E2E)
Selain pengujian manual, proyek backend juga dilengkapi dengan kode pengujian otomatis menggunakan framework **Jest**.
Pastikan Anda berada di dalam direktori `backend` (`cd backend`), lalu jalankan:

- `npm run test` : Menjalankan semua *unit test* standar.
- `npm run test:watch` : Menjalankan *unit test* dengan mode pantau (*watch mode*) saat proses pengembangan.
- `npm run test:cov` : Melihat cakupan kode (*Test Coverage*).
- `npm run test:e2e` : Menjalankan pengujian *End-to-End* (keseluruhan alur).

---

## Dokumentasi Tambahan

Detail mengenai arsitektur dan kebutuhan sistem lainnya dapat dibaca pada folder `docs/`:

| File | Deskripsi |
|------|-----------|
| [docs/PRD.md](docs/PRD.md) | Kebutuhan Produk (Product Requirements) |
| [docs/DATABASE.md](docs/DATABASE.md) | ERD, Skema, dan Indeks Database |
| [docs/API.md](docs/API.md) | Referensi Endpoints API |
| [docs/Design.md](docs/Design.md) | Sistem Desain & UI/UX |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Fase-fase Pengembangan Proyek |
