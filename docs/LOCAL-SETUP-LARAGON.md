# Local Development Rules — Laragon (FixMind)

Laragon dipakai sebagai environment lokal sementara sebelum deploy ke cloud (Vercel/Railway/dsb). Karena Laragon secara default fokus ke stack PHP + MySQL + Apache/Nginx, sedangkan FixMind pakai Node.js + PostgreSQL, ada beberapa penyesuaian wajib.

## 1. Komponen yang dipakai dari Laragon
- **Nginx/Apache**: opsional, hanya kalau butuh reverse proxy lokal (mis. akses via `fixmind.test`). Untuk dev sehari-hari, frontend & backend cukup jalan langsung via `bun run dev` di port masing-masing.
- **Git Bash / Terminal bawaan Laragon**: dipakai untuk semua command git & npm.
- **Auto Virtual Host**: bisa dipakai untuk mapping `fixmind.test` → `localhost:5173` (frontend) kalau mau URL rapi.

## 2. Komponen yang TIDAK disediakan default oleh Laragon (harus ditambahkan manual)
- **PostgreSQL** — Laragon default menyediakan MySQL, bukan Postgres. Opsi:
  1. Install PostgreSQL terpisah (postgresql.org installer for Windows), lalu tetap pakai Laragon hanya untuk web server & tools.
  2. Aktifkan module PostgreSQL lewat Laragon "Menu → Preferences → Services & Ports" jika versi Laragon yang dipakai sudah menyediakan opsi ini (cek versi terbaru).
- **pgvector extension** — dibutuhkan untuk RAG chatbot support. Setelah PostgreSQL terinstall:
  ```sql
  -- dijalankan sekali di database fixmind_dev
  CREATE EXTENSION IF NOT EXISTS vector;
  ```
  Kalau extension belum tersedia di instalasi Postgres Windows-mu, install lewat [pgvector releases untuk Windows](https://github.com/pgvector/pgvector) atau pakai Postgres versi yang sudah bundle pgvector (mis. lewat Docker image `pgvector/pgvector` kalau nanti pindah ke Docker).
- **Redis** (kalau nanti dipakai untuk queue/cache) — jalankan via WSL2 (`sudo apt install redis-server`) atau Docker Desktop, karena Laragon tidak bundle Redis secara native.
- **pgAdmin / DBeaver** — untuk GUI database Postgres, karena HeidiSQL bawaan Laragon dioptimalkan untuk MySQL.

## 3. Struktur Folder Project di Laragon
Taruh project di luar folder `www` bawaan Laragon supaya tidak tercampur dengan aturan auto-vhost PHP:
```
C:\laragon\www\fixmind\
├── frontend/     # React + Vite
├── backend/      # NestJS
└── docs/         # PRD & dokumentasi (folder ini)
```

## 4. Environment Variables
Buat `.env` terpisah untuk tiap service, JANGAN commit ke git:

`backend/.env`
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/fixmind_dev"
JWT_ACCESS_SECRET=changeme
JWT_REFRESH_SECRET=changeme
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=3000

# AI Layer - internal AiModule (bukan service terpisah), langsung panggil LLM provider
LLM_PROVIDER=gemini
GEMINI_API_KEY=changeme
```

`frontend/.env`
```
VITE_API_BASE_URL=http://localhost:3000
```

## 5. Port Convention (biar tidak bentrok)
| Service | Port |
|---|---|
| Frontend (Vite) | 5173 |
| Backend (NestJS, termasuk AiModule internal) | 3000 |
| PostgreSQL | 5432 |
| Redis (kalau dipakai) | 6379 |

> Tidak ada port terpisah untuk AI service — `AiModule` jalan di dalam proses NestJS yang sama (port 3000).

## 6. Install Bun di Windows (untuk dipakai bareng Laragon)
Laragon tidak bundle Bun secara default, install manual lewat PowerShell:
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```
Setelah itu pastikan `bun --version` bisa dipanggil dari terminal Laragon (restart terminal kalau belum kebaca PATH-nya).

## 7. Perintah Standar (dokumentasikan di README, bukan cuma di kepala)
```bash
# Backend
cd backend
bun install
bun run migrate      # jalankan migration .sql, bukan prisma migrate
bun run start:dev

# Frontend
cd frontend
bun install
bun run dev
```

> Catatan: tidak ada `prisma generate`/`prisma migrate` di project ini — semua akses DB pakai raw SQL (`postgres.js`), migration cukup file `.sql` polos di folder `migrations/`.

## 8. Aturan Migrasi Nanti ke Cloud
- Karena Laragon cuma dipakai lokal, **jangan hardcode path/URL Windows** (mis. `C:\laragon\...`) di kode aplikasi — semua konfigurasi lewat `.env` supaya tinggal ganti value saat pindah ke Vercel/Railway/VPS.
- `DATABASE_URL` format harus tetap connection-string standar Postgres, supaya provider cloud manapun (Supabase, Railway, Neon) tinggal plug-in tanpa ubah kode.
