<p align="center">
  <a href="https://github.com/dkaastyns/Fixmind" target="_blank">
    <img src="frontend/public/jdih-logo.png" width="480" style="background: white; padding: 12px; border-radius: 8px;" alt="JDIH Logo" />
  </a>
</p>

<p align="center">
  <strong>E-Lapor DPRD (ASETKITA Semarang)</strong><br>
  Sistem Manajemen Pelaporan & Pemeliharaan Fasilitas Berbasis AI & PWA untuk Sekretariat DPRD Kota Semarang
</p>

<p align="center">
  <a href="https://bun.sh/" target="_blank"><img src="https://img.shields.io/badge/Runtime-Bun%201.3%2B-black?logo=bun" alt="Tech Stack: Bun" /></a>
  <a href="https://nestjs.com/" target="_blank"><img src="https://img.shields.io/badge/Backend-NestJS%2011-e0234e?logo=nestjs" alt="Backend: NestJS 11" /></a>
  <a href="https://react.dev/" target="_blank"><img src="https://img.shields.io/badge/Frontend-React%2019-61dafb?logo=react" alt="Frontend: React 19" /></a>
  <a href="https://www.postgresql.org/" target="_blank"><img src="https://img.shields.io/badge/Database-PostgreSQL%2016-336791?logo=postgresql" alt="Database: PostgreSQL" /></a>
  <a href="https://ai.google.dev/" target="_blank"><img src="https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285f4?logo=google" alt="AI Engine: Gemini 2.5" /></a>
  <a href="https://vite-pwa-org.netlify.app/" target="_blank"><img src="https://img.shields.io/badge/PWA-Vite%20PWA-purple?logo=pwa" alt="PWA Ready" /></a>
</p>

---

**E-Lapor DPRD (ASETKITA Semarang)** adalah sistem manajemen pelaporan kerusakan, pengajuan perpindahan aset, dan penjadwalan pemeliharaan fasilitas modern berbasis *Artificial Intelligence* (AI) dan *Progressive Web App* (PWA) yang dirancang khusus untuk Sekretariat DPRD Kota Semarang.

Sistem ini mempermudah alur pengaduan dan pemeliharaan fasilitas secara digital, terintegrasi, dan transparan. AI (Google Gemini 2.5 Flash & Groq) secara otomatis menganalisis isi laporan, mengkalkulasi skor prioritas, memberikan estimasi durasi pengerjaan, serta memberikan rekomendasi langkah penanganan teknis bagi administrator dan teknisi.

---

## Fitur Utama Sistem

### 1. Pelaporan Kerusakan Cerdas Berbasis AI
- **Analisis Prioritas Otomatis:** AI menganalisis deskripsi masalah dan kategori aset untuk menentukan prioritas (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), estimasi jam pengerjaan, dan saran solusi teknis.
- **Linimasa (Timeline) & Histori Audit:** Pelacakan transparan status tiket laporan dari pembuatan (`PENDING`), penugasan teknisi (`IN_PROGRESS`), hingga penyelesaian (`DONE`) beserta lampiran foto kerusakan dan perbaikan.
- **Komentar & Diskusi Real-time:** Fitur kolom diskusi interaktif pada setiap laporan untuk komunikasi antara pelapor, admin, dan teknisi.

### 2. Jadwal Pemeliharaan Rutin (Maintenance Schedule)
- **Manajemen Agenda Pemeliharaan:** Penjadwalan perawatan preventif gedung dan aset berkala (Mingguan, Bulanan, Triwulan, Tahunan, atau Sekali Saja).
- **Manajemen Vendor Eksternal & Biaya:** Pencatatan nama perusahaan vendor, nama *contact person*, nomor telepon vendor, serta estimasi dan realisasi biaya pemeliharaan.
- **Status Siklus Kerja:** Pelacakan status pengerjaan (*Terjadwal*, *Sedang Dikerjakan*, *Selesai*, *Batal*, *Terlambat/Overdue*).

### 3. Pengajuan Pemindahan Aset (Asset Transfer Workflow)
- **Alur Persetujuan Bertingkat:** Pegawai dapat mengajukan permohonan pemindahan aset antar ruangan beserta alasannya.
- **Verifikasi Administrator:** Admin dapat meninjau (*Approve* / *Reject*) pengajuan transfer. Jika disetujui, lokasi `room_id` aset otomatis diperbarui secara otomatis di database.

### 4. Pencarian Global Terpadu (Global Instant Search)
- **Pencarian Melintas Entitas:** Satu kolom pencarian pintar untuk menemukan Aset, Laporan Kerusakan, Pengajuan Transfer, dan Jadwal Pemeliharaan secara instan dari seluruh sudut aplikasi.

### 5. Dasbor Analitik & Ekspor Laporan
- **Visualisasi Kinerja:** Metrik statistik laporan aktif, performa teknisi, status ruangan, dan grafik distribusi laporan.
- **Ekspor Dokumen:** Mendukung pengunduhan laporan dan agenda pemeliharaan ke format **Excel (.xlsx)** dan **PDF**.

### 6. Progressive Web App (PWA) & Mode Offline
- **Instalasi Tanpa APK:** Dapat langsung di-install pada smartphone Android/iOS maupun desktop melalui peramban web (Chrome, Safari, Edge).
- **Offline Sync:** Mampu menyimpan draf dan aksi saat jaringan terputus, lalu otomatis menyinkronkan data ketika online kembali.

### 7. Notifikasi Real-time & Keamanan Tinggi
- **WebSockets (Socket.io):** Pembaruan status laporan dan pengajuan transfer dipancarkan secara instan ke layar pengguna dan admin tanpa perlu refresh.
- **Proteksi Brute-Force & Lockout:** Penguncian akun otomatis setelah 5x gagal login berturut-turut untuk melindungi akun admin dari serangan peretasan.

---

## Tech Stack

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| **Runtime & PM** | [Bun](https://bun.sh/) 1.3+ | Runtime JavaScript/TypeScript super cepat & package manager |
| **Backend Framework** | NestJS 11 | Framework Node.js/TypeScript enterprise dengan modul terpisah |
| **Frontend Framework** | React 19 + Vite | UI library modern dengan Vite bundler dan React Router 7 |
| **Styling & Motion** | Tailwind CSS v4 + Framer Motion | Desain *Dark Glassmorphism* modern dengan animasi kinetic halus |
| **State Management** | TanStack Query + Zustand | Management server-state dan auth session in-memory |
| **Database** | PostgreSQL 16 + pgvector | Database relasional dengan ekstensi pencarian vektor |
| **Database Access** | `postgres.js` | Kueri *Raw SQL* berkinerja tinggi tanpa ORM overhead |
| **Kecerdasan Buatan (AI)** | Gemini 2.5 Flash & Groq (Llama 3.1) | Mesin analisis prioritas, durasi pengerjaan, dan saran teknis |
| **Real-time Engine** | Socket.io (WebSockets) | Event streaming untuk notifikasi instan |
| **Media Storage** | Cloudinary | Penyimpanan cloud untuk bukti foto kerusakan & perbaikan |

---

## Struktur Repositori & Dokumentasi Terkait

Struktur lengkap proyek dan panduan pengembang tersedia di folder `docs/`:

| File Dokumentasi | Isi & Deskripsi |
|------------------|-----------------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arsitektur global, diagram alur siklus laporan, dan transfer aset |
| [docs/API.md](docs/API.md) | Katalog lengkap REST API endpoints, DTO, contoh cURL & WebSockets |
| [docs/DATABASE.md](docs/DATABASE.md) | ERD, kamus data (Data Dictionary), indeks, dan riwayat migrasi |
| [docs/FRONTEND-ARCHITECTURE.md](docs/FRONTEND-ARCHITECTURE.md) | Arsitektur React 19, Zustand, router-guards, dan design system |
| [docs/BACKEND-ARCHITECTURE.md](docs/BACKEND-ARCHITECTURE.md) | Modul NestJS, middleware security (Helmet/Throttler), dan kueri `postgres.js` |
| [docs/AI.md](docs/AI.md) | Konfigurasi prompt Gemini 2.5 Flash, penentuan prioritas & RAG roadmap |
| [docs/FOLDER-STRUCTURE.md](docs/FOLDER-STRUCTURE.md) | Struktur pohon folder backend & frontend secara menyeluruh |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Daftar status pengerjaan fitur proyek dan fase pengembangan |
| [docs/SECURITY.md](docs/SECURITY.md) | Audit keamanan, JWT token rotation, rate limiting, & account lockout |
| [docs/TESTING.md](docs/TESTING.md) | Panduan pengujian unit test dan verifikasi TypeScript |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Solusi masalah umum saat instalasi dan penanganan galat |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Standar Conventional Commits, git branching, dan PR workflow |

## Port Default Aplikasi & Endpoint

Aplikasi menggunakan konfigurasi port default berikut:
- **Frontend Web Client:** `http://localhost:5173`
- **Backend API Server:** `http://localhost:3000`
- **Backend API Base URL:** `http://localhost:3000/api/v1`
- **Database PostgreSQL:** `postgresql://postgres:postgres@localhost:5432/asetkita-semarang`

---

## Panduan Memulai (Quick Start Guide)

### Prasyarat Sistem
1. Pasang **[Bun](https://bun.sh/) 1.3+** (pengganti Node.js/npm).
   - Windows PowerShell: `powershell -c "irm bun.sh/install.ps1 | iex"`
   - Linux/macOS: `curl -fsSL https://bun.sh/install | bash`
2. Pasang **PostgreSQL 16+** (dengan ekstensi `pgvector`).
3. Buat database baru bernama `asetkita-semarang` di PostgreSQL lokal Anda.

---

### Step 1: Konfigurasi Environment File (.env)

Buat file `.env` di dalam folder `backend` dan `frontend` dengan konfigurasi minimal berikut:

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/asetkita-semarang
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=your-super-long-secret-key-at-least-32-chars
JWT_REFRESH_SECRET=your-other-super-long-secret-key-at-least-32-chars
LLM_PROVIDER=gemini
GEMINI_API_KEY=your-google-gemini-key
GEMINI_MODEL=gemini-2.5-flash
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

### Step 2: Instalasi & Inisialisasi Database

Jalankan perintah berikut di root folder untuk menginstal dependensi seluruh modul dan melakukan migrasi database awal:

```powershell
# Install seluruh dependensi workspace sekaligus
bun install

# Masuk ke backend untuk menjalankan migrasi & seed awal
cd backend
bun run migrate
bun run seed
cd ..
```

---

### Step 3: Jalankan Aplikasi dengan Skrip Helper

Anda dapat menjalankan atau menguji aplikasi secara instan dari root folder menggunakan skrip otomatisasi workspaces Bun berikut:

```powershell
# Jalankan frontend & backend sekaligus secara bersamaan (Sangat direkomendasikan)
bun run dev:all

# Hanya jalankan backend service (NestJS)
bun run start:backend

# Hanya jalankan frontend web (Vite)
bun run start:frontend

# Jalankan seluruh unit testing (backend & frontend)
bun run test:ci
```

---

## Menjalankan dengan Docker Compose (Produksi / Staging)

Seluruh sistem (Nginx, Backend NestJS, PostgreSQL 16) dapat dijalankan menggunakan Docker Compose:

```bash
# Salin contoh file .env root
cp .env.example .env

# Build dan jalankan seluruh container
docker compose up -d --build
```

- **URL Aplikasi Production:** `http://localhost` (melalui Nginx Reverse Proxy di port 80/443).
- **Keamanan Production:** Port internal database (`5432`) dan backend NestJS (`3000`) sengaja disembunyikan dari akses publik demi keamanan *hardening*.

---

## Kredensial Login Default (Development Seed)

Setelah menjalankan `bun run seed` di backend, Anda dapat menggunakan akun berikut untuk menguji aplikasi:

| Peran (Role) | Email Kredensial | Kata Sandi (Password) | Akses |
|--------------|------------------|-----------------------|-------|
| **ADMIN** | `admin@asetkita-semarang.local` | `Admin123!@#` | Akses Penuh (Kelola Ruangan, Aset, User, Maintenance, Transfer Review, Analitik) |
| **USER** | `user@asetkita-semarang.local` | `User123!@#` | Akses Pegawai (Pelaporan Kerusakan, Pengajuan Transfer Aset, Profil) |

---

## Lisensi

Hak Cipta © 2026 Sekretariat DPRD Kota Semarang / Tim Pengembang ASETKITA Semarang. Berlisensi di bawah [MIT License](LICENSE).
