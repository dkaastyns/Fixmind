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

## From Zero to Running (Quick Start)

Pilih salah satu metode di bawah ini untuk menjalankan aplikasi:

### Metode A: Full Stack dengan Docker Compose (Satu Langkah)

Metode ini menjalankan seluruh ekosistem (Frontend, Backend NestJS, Database PostgreSQL 16, dan Nginx Reverse Proxy) secara otomatis.

1. Salin template file environment:
   ```bash
   cp .env.example .env
   ```

2. Jalankan seluruh container:
   ```bash
   docker compose up -d --build
   ```

3. Buka aplikasi di peramban:
   - **Web Application:** `http://localhost`
   - **Health Check API:** `http://localhost/api/v1/health`

---

### Metode B: Lokal Manual tanpa Docker (Development Mode)

Metode ini digunakan untuk pengembangan aktif frontend dan backend di lingkungan lokal.

#### 1. Prasyarat Sistem
- **Bun 1.3+** (Runtime resmi proyek) atau **Node.js 20+**
- **PostgreSQL 16+** (dengan ekstensi `pgvector`) yang berjalan di port `5432`

#### 2. Konfigurasi Environment Variables
Salin contoh file environment ke masing-masing direktori modul:

```bash
# Salin konfigurasi backend
cp backend/.env.example backend/.env

# Salin konfigurasi frontend
cp frontend/.env.example frontend/.env
```

Pastikan variabel `DATABASE_URL` pada `backend/.env` sesuai dengan kredensial PostgreSQL lokal Anda.

#### 3. Instalasi Dependensi Workspace
Jalankan instalasi dependensi dari root direktori:

```bash
bun install
```

#### 4. Migrasi & Seeding Database
Jalankan script migrasi skema tabel dan data awal (seed akun admin & user, data ruangan, data aset):

```bash
cd backend
bun run migrate
bun run seed
cd ..
```

#### 5. Menjalankan Aplikasi
Jalankan frontend dan backend secara bersamaan dari root direktori:

```bash
bun run dev:all
```

Aplikasi siap diakses:
- **Frontend Client:** `http://localhost:5173`
- **Backend API:** `http://localhost:3000/api/v1`

---

## Daftar Minimal Environment Variables yang Wajib

Berikut adalah rincian environment variables utama yang wajib dikonfigurasi sebelum menjalankan aplikasi:

### Backend (`backend/.env`)

| Variabel | Status | Nilai Default / Contoh | Deskripsi |
|---|---|---|---|
| `DATABASE_URL` | Wajib | `postgresql://postgres:postgres@localhost:5432/asetkita-semarang` | URL koneksi ke PostgreSQL instance |
| `PORT` | Wajib | `3000` | Port listening HTTP server backend |
| `NODE_ENV` | Wajib | `development` | Mode runtime (`development`, `production`, `test`) |
| `CORS_ORIGIN` | Wajib | `http://localhost:5173` | Domain/origin frontend yang diizinkan |
| `JWT_ACCESS_SECRET` | Wajib | `minimum-32-characters-random-secret-key` | Kunci rahasia signing JWT Access Token |
| `JWT_REFRESH_SECRET` | Wajib | `minimum-32-characters-random-refresh-key` | Kunci rahasia signing JWT Refresh Token |
| `LLM_PROVIDER` | Wajib | `gemini` | Provider AI (`gemini` atau `groq`) |
| `GEMINI_API_KEY` | Opsional (Wajib jika AI aktif) | `AIzaSy...` | API key Google AI Studio untuk Gemini |
| `CLOUDINARY_CLOUD_NAME` | Opsional | `your-cloud-name` | Penyimpanan upload foto kerusakan |
| `CLOUDINARY_API_KEY` | Opsional | `your-api-key` | API key Cloudinary |
| `CLOUDINARY_API_SECRET` | Opsional | `your-api-secret` | API secret Cloudinary |

### Frontend (`frontend/.env`)

| Variabel | Status | Nilai Default / Contoh | Deskripsi |
|---|---|---|---|
| `VITE_API_BASE_URL` | Wajib | `http://localhost:3000/api/v1` | URL endpoint backend yang dituju client |

### Docker Compose (`.env`)

| Variabel | Status | Nilai Default / Contoh | Deskripsi |
|---|---|---|---|
| `POSTGRES_PASSWORD` | Wajib | `changeme` | Password user postgres internal container |
| `JWT_ACCESS_SECRET` | Wajib | `change-me-access-secret-min-32-chars` | Rahasia JWT Access Token container backend |
| `JWT_REFRESH_SECRET` | Wajib | `change-me-refresh-secret-min-32-chars` | Rahasia JWT Refresh Token container backend |
| `GEMINI_API_KEY` | Opsional | `your-gemini-key` | Kunci API Gemini untuk analisis laporan |
| `CORS_ORIGIN` | Wajib | `http://localhost` | Origin domain produksi Nginx |
| `VITE_API_BASE_URL` | Wajib | `/api/v1` | Reverse proxy path API backend di Nginx |

---

## Keputusan Runtime & Package Manager (Bun vs npm/pnpm)

### Keputusan Resmi: Menggunakan Bun (v1.3+)

Proyek **FixMind (ASETKITA Semarang)** secara resmi menetapkan **[Bun](https://bun.sh/) 1.3+** sebagai runtime JavaScript/TypeScript dan package manager monorepo workspace standar.

**Alasan Pemilihan Bun:**
1. **Kecepatan Tinggi:** Proses instalasi dependensi, eksekusi task, dan build berjalan 3x hingga 10x lebih cepat dibanding package manager tradisional.
2. **Native TypeScript Execution:** Bun dapat langsung mengeksekusi file TypeScript (seperti `scripts/migrate.ts` dan `scripts/seed.ts`) tanpa membutuhkan konfigurasi compiler eksternal (`ts-node` / `tsx`).
3. **Workspace Support Terintegrasi:** Fitur `bun --filter` memudahkan orkestrasi skrip antar modul `backend` dan `frontend` dalam satu perintah di root folder.

### Status File Lock (`bun.lock`)
File `bun.lock` di root, `backend/bun.lock`, dan `frontend/bun.lock` adalah file lock resmi proyek. File ini wajib diikutsertakan dalam version control (git) untuk menjamin konsistensi versi dependensi seluruh tim pengembang dan pipeline CI.

### Padanan Perintah (Jika Menggunakan npm atau pnpm)

Jika Bun belum terpasang pada lingkungan Anda, perintah berikut dapat digunakan sebagai padanan:

| Tindakan | Perintah Bun (Rekomendasi) | Padanan npm | Padanan pnpm |
|---|---|---|---|
| Install Dependensi | `bun install` | `npm install` | `pnpm install` |
| Jalankan Full Stack Dev | `bun run dev:all` | `npm run dev:all` | `pnpm run dev:all` |
| Jalankan Backend Dev | `bun run start:backend` | `npm run --prefix backend start:dev` | `pnpm --filter backend start:dev` |
| Jalankan Frontend Dev | `bun run start:frontend` | `npm run --prefix frontend dev` | `pnpm --filter frontend dev` |
| Migrasi Database | `cd backend && bun run migrate` | `cd backend && npx ts-node scripts/migrate.ts` | `cd backend && pnpm exec ts-node scripts/migrate.ts` |
| Seed Database | `cd backend && bun run seed` | `cd backend && npx ts-node scripts/seed.ts` | `cd backend && pnpm exec ts-node scripts/seed.ts` |
| Jalankan Seluruh Test | `bun run test:ci` | `npm run --prefix backend test && npm run --prefix frontend test` | `pnpm --recursive test` |

---

## CI & Quality Gates

Proyek ini menerapkan quality gate otomatis melalui GitHub Actions (`.github/workflows/ci.yml`) pada setiap `push` dan `pull request` ke branch `main`:

1. **Secret Scanning (TruffleHog OSS):**
   Memindai seluruh riwayat commit dan pull request untuk mendeteksi potensi kebocoran API Key, kata sandi, token JWT, atau kredensial sensitif lainnya sebelum masuk ke repository utama.

2. **Linting & Code Formatting:**
   Menjalankan ESLint dan Prettier pada kode frontend dan backend untuk memastikan standar gaya kode dan konsistensi arsitektur tetap terjaga.

3. **Type Safety & Build Verification:**
   Memverifikasi bahwa TypeScript compiler (`tsc -b`) berhasil mengompilasi seluruh modul tanpa error tipe data, serta memverifikasi bahwa proses production build (Vite & NestJS CLI) berjalan lancar.

4. **Automated Unit Testing & Coverage:**
   Menjalankan rangkaian pengujian otomatis unit testing (Jest pada Backend dan Vitest pada Frontend) untuk memastikan fungsi kalkulasi, service, middleware, dan komponen UI bekerja sesuai spesifikasi.

---

## Fitur Utama Sistem

### 1. Pelaporan Kerusakan Cerdas Berbasis AI
- **Analisis Prioritas Otomatis:** AI menganalisis deskripsi masalah dan kategori aset untuk menentukan prioritas (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), estimasi jam pengerjaan, dan saran solusi teknis.
- **Linimasa (Timeline) & Histori Audit:** Pelacakan transparan status tiket laporan dari pembuatan (`PENDING`), penugasan teknisi (`IN_PROGRESS`), hingga penyelesaian (`DONE`) beserta lampiran foto kerusakan dan perbaikan.
- **Komentar & Diskusi Real-time:** Fitur kolom diskusi interaktif pada setiap laporan untuk komunikasi antara pelapor, admin, dan teknisi.

### 2. Jadwal Pemeliharaan Rutin (Maintenance Schedule)
- **Manajemen Agenda Pemeliharaan:** Penjadwalan perawatan preventif gedung dan aset berkala (Mingguan, Bulanan, Triwulan, Tahunan, atau Sekali Saja).
- **Manajemen Vendor Eksternal & Biaya:** Pencatatan nama perusahaan vendor, nama contact person, nomor telepon vendor, serta estimasi dan realisasi biaya pemeliharaan.
- **Status Siklus Kerja:** Pelacakan status pengerjaan (Terjadwal, Sedang Dikerjakan, Selesai, Batal, Terlambat/Overdue).

### 3. Pengajuan Pemindahan Aset (Asset Transfer Workflow)
- **Alur Persetujuan Bertingkat:** Pegawai dapat mengajukan permohonan pemindahan aset antar ruangan beserta alasannya.
- **Verifikasi Administrator:** Admin dapat meninjau (Approve / Reject) pengajuan transfer. Jika disetujui, lokasi `room_id` aset otomatis diperbarui di database.

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
|---|---|---|
| **Runtime & PM** | [Bun](https://bun.sh/) 1.3+ | Runtime JavaScript/TypeScript super cepat & package manager |
| **Backend Framework** | NestJS 11 | Framework Node.js/TypeScript enterprise dengan modul terpisah |
| **Frontend Framework** | React 19 + Vite | UI library modern dengan Vite bundler dan React Router 7 |
| **Styling & Motion** | Tailwind CSS v4 + Framer Motion | Desain Dark Glassmorphism modern dengan animasi kinetic halus |
| **State Management** | TanStack Query + Zustand | Management server-state dan auth session in-memory |
| **Database** | PostgreSQL 16 + pgvector | Database relasional dengan ekstensi pencarian vektor |
| **Database Access** | `postgres.js` | Kueri Raw SQL berkinerja tinggi tanpa ORM overhead |
| **Kecerdasan Buatan (AI)** | Gemini 2.5 Flash & Groq (Llama 3.1) | Mesin analisis prioritas, durasi pengerjaan, dan saran teknis |
| **Real-time Engine** | Socket.io (WebSockets) | Event streaming untuk notifikasi instan |
| **Media Storage** | Cloudinary | Penyimpanan cloud untuk bukti foto kerusakan & perbaikan |

---

## Struktur Repositori & Dokumentasi Terkait

Struktur lengkap proyek dan panduan pengembang tersedia di folder `docs/`:

| File Dokumentasi | Isi & Deskripsi |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arsitektur global, diagram alur siklus laporan, dan transfer aset |
| [docs/API.md](docs/API.md) | Katalog lengkap REST API endpoints, DTO, contoh cURL & WebSockets |
| [docs/DATABASE.md](docs/DATABASE.md) | ERD, kamus data (Data Dictionary), indeks, dan riwayat migrasi |
| [docs/ENV.md](docs/ENV.md) | Penjelasan lengkap seluruh environment variables backend, frontend, & Docker |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md) | Konvensi penamaan, pola kode, struktur modul, & standar penulisan untuk developer baru |
| [docs/FRONTEND-ARCHITECTURE.md](docs/FRONTEND-ARCHITECTURE.md) | Arsitektur React 19, Zustand, router-guards, dan design system |
| [docs/BACKEND-ARCHITECTURE.md](docs/BACKEND-ARCHITECTURE.md) | Modul NestJS, middleware security (Helmet/Throttler), dan kueri `postgres.js` |
| [docs/AI.md](docs/AI.md) | Konfigurasi prompt Gemini 2.5 Flash, penentuan prioritas & RAG roadmap |
| [docs/FOLDER-STRUCTURE.md](docs/FOLDER-STRUCTURE.md) | Struktur pohon folder backend & frontend secara menyeluruh |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Daftar status pengerjaan fitur proyek dan fase pengembangan |
| [docs/SECURITY.md](docs/SECURITY.md) | Audit keamanan, JWT token rotation, rate limiting, & account lockout |
| [docs/TESTING.md](docs/TESTING.md) | Panduan pengujian unit test dan verifikasi TypeScript |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Panduan deployment produksi via Docker Compose & Nginx |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Solusi masalah umum saat instalasi dan penanganan galat |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Standar Conventional Commits, git branching, dan PR workflow |

---

## Port Default Aplikasi & Endpoint

Aplikasi menggunakan konfigurasi port default berikut:
- **Frontend Web Client:** `http://localhost:5173`
- **Backend API Server:** `http://localhost:3000`
- **Backend API Base URL:** `http://localhost:3000/api/v1`
- **Database PostgreSQL:** `postgresql://postgres:postgres@localhost:5432/asetkita-semarang`

---

## Kredensial Login Default (Development Seed)

Setelah menjalankan `bun run seed` di backend, Anda dapat menggunakan akun berikut untuk menguji aplikasi:

| Peran (Role) | Email Kredensial | Kata Sandi (Password) | Akses |
|---|---|---|---|
| **ADMIN** | `admin@asetkita-semarang.local` | `Admin123!@#` | Akses Penuh (Kelola Ruangan, Aset, User, Maintenance, Transfer Review, Analitik) |
| **USER** | `user@asetkita-semarang.local` | `User123!@#` | Akses Pegawai (Pelaporan Kerusakan, Pengajuan Transfer Aset, Profil) |

---

## Lisensi

Hak Cipta (c) 2026 Sekretariat DPRD Kota Semarang / Tim Pengembang ASETKITA Semarang. Berlisensi di bawah [MIT License](LICENSE).
