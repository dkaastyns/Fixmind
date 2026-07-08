# E-Lapor DPRD (FixMind)

E-Lapor DPRD (dengan nama kode FixMind) adalah sebuah sistem manajemen pelaporan dan pemeliharaan fasilitas modern berbasis _Artificial Intelligence_ (AI) yang dirancang khusus untuk mengelola, melacak, dan menyelesaikan berbagai kerusakan atau kendala fasilitas di lingkungan gedung dewan maupun perkantoran.

Sistem ini membantu mempermudah pelaporan, di mana AI (menggunakan Gemini 2.5 Flash) secara otomatis menganalisis masalah, menentukan prioritas, memberikan estimasi waktu, serta menyajikan rekomendasi perbaikan untuk dipantau oleh admin dan pengguna.

## Fitur Utama
- **Pelaporan Pintar dengan AI:** Identifikasi prioritas, kategori masalah, dan estimasi pengerjaan otomatis.
- **Linimasa (Timeline) Pelaporan:** Lacak status tiket dari mulai dibuat, ditugaskan, hingga selesai dikerjakan.
- **Pengajuan Pemindahan Aset:** User dapat mengajukan perpindahan aset antar ruangan, lalu admin meninjau dan menyetujuinya sebelum lokasi aset otomatis diubah di database.
- **Ekspor Data & Laporan (Analytics):** Analisis kinerja pelaporan fasilitas dalam bentuk metrik visual dan ekspor (CSV, Excel, PDF) dengan rentang waktu.
- **Notifikasi Real-time:** Memberikan pembaruan instan (*WebSockets*) kepada admin maupun pelapor jika status laporan berubah.
- **Manajemen Pengguna Terpusat:** Admin dapat mengelola dua jenis akun saja, yaitu _Admin_ dan _User_.
- **Import Aset dari Excel:** Admin dapat mengimpor data aset inventaris Pemda secara massal dari file `.xlsx`/`.xls` langsung ke database, dilengkapi dengan template yang bisa diunduh.

---

## Fitur Pengajuan Pemindahan Aset

Fitur ini memperluas alur aplikasi dari sekadar pengaduan masalah menjadi juga pengelolaan perpindahan aset antar ruangan.

### Alur Penggunaan

1. **User** membuka menu **Pengajuan Transfer** di dashboard.
2. User memilih **ruangan asal**, **aset**, **ruangan tujuan**, lalu menuliskan **alasan pemindahan**.
3. Pengajuan tersimpan dengan status **PENDING**.
4. **Admin** membuka menu **Approval Transfer** di dashboard.
5. Admin meninjau detail pengajuan lalu memilih **Setuju** atau **Tolak**.
6. Jika **disetujui**, sistem otomatis mengubah `room_id` aset ke ruangan tujuan di database.
7. Status pengajuan berubah menjadi **APPROVED** atau **REJECTED** dan riwayatnya tetap bisa dilihat.

### Endpoint API Baru

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/assets/transfers` | Daftar pengajuan transfer (user melihat miliknya sendiri, admin melihat semua) |
| `GET` | `/assets/transfers/:id` | Detail satu pengajuan transfer |
| `POST` | `/assets/transfers` | Membuat pengajuan transfer aset baru |
| `PATCH` | `/assets/transfers/:id` | Review transfer oleh admin (`APPROVED` / `REJECTED`) |

---

## Fitur Import Aset (Excel)

Fitur ini memungkinkan admin mengimpor data aset inventaris dari **file Excel (.xlsx/.xls)** ke dalam database secara massal â€” tanpa perlu menginput satu per satu.

### Cara Penggunaan

1. **Buka halaman** `Fasilitas & Ruangan` di dashboard admin.
2. Klik tombol **â¬‡ Template** di pojok kanan atas untuk mengunduh file template Excel yang sudah terformat.
3. Isi data aset di file template sesuai kolom yang tersedia.
4. Klik tombol **ðŸ“Š Import Excel** di pojok kanan atas (di samping "Tambah Ruangan").
5. Pilih file `.xlsx` / `.xls` yang sudah diisi.
   - Jika ruangan sudah dipilih sebelumnya â†’ data langsung diimport ke ruangan tersebut.
   - Jika belum memilih ruangan â†’ modal otomatis muncul untuk memilih ruangan tujuan.
6. Klik **Import** dan tunggu notifikasi sukses.

### Format Kolom Excel

| Nama Kolom | Keterangan | Contoh |
|------------|------------|--------|
| `idpemda` | ID Pemda / kode aset dari Pemkot | `1.3.2.01.10.001` |
| `kode_barang` | Kode barang singkat (unik) | `KMP-001` |
| `nomor_register` | Nomor register barang | `REG-2024-001` |
| `nama_barang` | Nama lengkap barang | `Kursi Pimpinan` |
| `merk_type` | Merk dan type / spesifikasi | `Chitose / Type-A` |

> **Catatan:**
> - Nama kolom harus **persis** seperti di atas (header baris pertama).
> - Jika `kode_barang` sudah ada di database, data akan **diperbarui** (upsert).
> - Baris kosong di tengah data akan diabaikan.
> - Sistem juga mendukung alias kolom seperti `id_pemda`, `no_register`, `nama_brg`, `merk`, dll.

### Endpoint API Import

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/assets/import/template` | Download template Excel |
| `POST` | `/assets/import?roomId=<uuid>` | Upload file Excel untuk import |

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
| **Runtime & Package Manager** | [Bun](https://bun.sh/) 1.3+ (digunakan sebagai runtime **dan** package manager utama) |
| **Infrastruktur (Produksi)** | Docker & Docker Compose, GZIP Compression, Rate Limiting (Throttler), Strict Cookies |

---

## Panduan Menjalankan Proyek (Quick Start)

### Persyaratan Sistem
- [Bun](https://bun.sh/) **1.3+** â€” digunakan sebagai runtime **dan** package manager (pengganti Node.js/npm).
- PostgreSQL 16+ dengan ekstensi **pgvector** sudah terpasang.
- Buat sebuah database kosong di PostgreSQL bernama `fixmind`.

> **âš ï¸ Penting:** Proyek ini menggunakan **Bun**, bukan `npm` atau `yarn`. Pastikan Bun sudah terinstal sebelum menjalankan perintah apapun. Install Bun: `powershell -c "irm bun.sh/install.ps1 | iex"`

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

### 2. Instalasi Dependensi
Instal semua dependensi untuk backend dan frontend.
```powershell
# Backend
cd backend
bun install

# Frontend (buka terminal baru)
cd frontend
bun install
```

### 3. Migrasi Database dan Data Awal (Seeding)
Siapkan struktur database dan isi data awal untuk ujicoba.
```powershell
cd backend
bun run migrate
bun run seed
```
> **Catatan:** Akun default setelah seeding adalah:
> - Admin: `admin@fixmind.local` / `Admin123!@#`
> - User: `user@fixmind.local` / `User123!@#`

### 4. Menjalankan Server Pengembangan
Anda perlu menjalankan Backend dan Frontend di terminal yang terpisah.

**Terminal 1 (Backend):**
```powershell
cd backend
bun run start:dev
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
bun run dev
```

- **Akses Aplikasi (Frontend):** `http://localhost:5173`
- **Akses API (Backend):** `http://localhost:3000/api/v1`
- **Pengecekan Status Server:** `http://localhost:3000/api/v1/health`

### 5. Menjalankan Mode Produksi (Dengan Docker)
Aplikasi ini sudah _production-ready_ dan dilengkapi dengan Docker. Untuk menjalankan di server produksi:

```powershell
docker-compose up -d --build
```
Aplikasi secara otomatis akan mengatur:
- **Database PostgreSQL** berjalan pada port `5432`
- **Backend NestJS** berjalan pada port `3000`
- **Frontend Vite SPA (Nginx)** berjalan pada port `80`

Anda dapat langsung mengakses aplikasi melalui `http://localhost`.

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
      "user": { "role": "ADMIN", "isAdmin": true, ... }
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

- `bun run test` : Menjalankan semua *unit test* standar.
- `bun run test:watch` : Menjalankan *unit test* dengan mode pantau (*watch mode*) saat proses pengembangan.
- `bun run test:cov` : Melihat cakupan kode (*Test Coverage*).
- `bun run test:e2e` : Menjalankan pengujian *End-to-End* (keseluruhan alur).

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
