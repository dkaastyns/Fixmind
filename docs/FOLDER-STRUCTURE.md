# ASETKITA Semarang — Structure Directory & Folder Tree

Dokumen ini menyajikan peta struktur pohon direktori proyek **E-Lapor DPRD (ASETKITA Semarang)** untuk memudahkan pengembang memahami letak berkas backend dan frontend.

---

## Root Directory Overview

```text
FixMind/
├── backend/                  # NestJS 11 Server (API, DB Migrations, WebSockets, AI)
├── frontend/                 # React 19 + Vite Client (PWA, Tailwind v4, Components)
├── docs/                     # Berkas Dokumentasi Lengkap Proyek
├── infra/                    # Konfigurasi Infrastruktur & Reverse Proxy (Nginx)
├── .env.example              # File contoh variabel lingkungan root / docker
├── .githooks/                # Pre-commit hook pemindai rahasia & kredensial
├── CONTRIBUTING.md           # Panduan Kontribusi, Branching, & Commit Convention
├── LICENSE                   # Lisensi Proyek (MIT)
├── README.md                 # Dokumentasi Utama & Panduan Memulai
└── docker-compose.yml        # Orchestration Container Docker Produksi
```

---

## Backend Directory Structure (`backend/`)

```text
backend/
├── migrations/               # Berkas Migrasi SQL (Dieksekusi secara berurutan)
│   ├── 0001_init_extensions.sql
│   ├── 0002_create_users_and_sessions.sql
│   ├── 0003_create_facilities.sql
│   ├── 0004_create_reports.sql
│   ├── 0005_create_ai_tables.sql
│   ├── 0006_comments_and_maintenance.sql
│   ├── 0007_add_target_date_reports.sql
│   ├── 0008_update_asset_inventory_columns.sql
│   ├── 0009_drop_ratings.sql
│   ├── 0010_create_asset_transfers.sql
│   ├── 0011_remove_technician_columns.sql
│   ├── 0012_create_maintenance_schedules.sql
│   ├── 0013_add_failed_login_lockout.sql
│   └── 0014_drop_knowledge_chunks.sql
├── scripts/                  # Skrip Bantuan Execution
│   ├── migrate.ts            # Migration runner script (bun run migrate)
│   └── seed.ts               # Database seed script akun awal (bun run seed)
├── src/
│   ├── main.ts               # Entry point NestJS, global pipe, Cors, Helmet
│   ├── app.module.ts         # Root App Module, import seluruh fitur & middleware
│   ├── config/               # Validasi schema environment variable
│   ├── database/             # Provider koneksi postgres.js (sql.ts, database.module.ts)
│   ├── common/               # Resource bersama
│   │   ├── decorators/       # @Roles(), @Public(), @CurrentUser()
│   │   ├── filters/          # AllExceptionsFilter (envelope error terstruktur)
│   │   ├── interceptors/     # TransformInterceptor (envelope response sukses)
│   │   └── types/            # API Response envelope & row database interfaces
│   └── modules/              # Sub-modul Fitur Aplikasi
│       ├── ai/               # LlmProviderService (Gemini & Groq Integration)
│       ├── analytics/        # Endpoint statistik dasbor & performa teknisi
│       ├── asset-transfers/  # Pengajuan & persetujuan pemindahan aset
│       ├── assets/           # Kelola aset inventaris & bulk import Excel
│       ├── auth/             # Login, refresh token rotation, logout, & profile
│       ├── health/           # Endpoint health check status server
│       ├── maintenance/      # Kelola jadwal pemeliharaan rutin & vendor
│       ├── reports/          # Kelola laporan kerusakan, histori audit, & PDF/Excel export
│       ├── rooms/            # Kelola fasilitas ruangan DPRD
│       ├── users/            # Kelola akun pengguna, teknisi, & lockout
│       └── websockets/       # Socket.io Gateway untuk notifikasi real-time
├── .env.example
├── Dockerfile
└── package.json
```

---

## Frontend Directory Structure (`frontend/`)

```text
frontend/
├── public/                   # Asset Statis (PWA icons, JDIH logo, background images)
│   ├── favicon.ico
│   ├── jdih-logo.png
│   ├── new-bg_dprd.jpg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── main.tsx              # Entry point React 19 & Provider Wrappers
│   ├── index.css             # Tailwind CSS v4 design tokens, glass utilities
│   ├── app/                  # Konfigurasi Rute Aplikasi
│   │   ├── router.tsx        # Deklarasi URL Path & Elemen Halaman
│   │   └── router-guards.tsx # Router Guard (ProtectedRoute, AdminRoute, GuestRoute)
│   ├── components/           # Komponen UI Reusable
│   │   ├── layout/           # DashboardLayout & Mobile Sidebar Navigation
│   │   ├── providers/        # OfflineSyncProvider (PWA Sync Handler)
│   │   └── ui/               # Button, Input, GlassCard, FullPageLoading, GlobalSearchModal, FloatingActionButton, dll.
│   ├── features/             # Modul Halaman Berdasarkan Fitur
│   │   ├── analytics/pages/  # Halaman Dasbor Analitik & Grafik Metrik
│   │   ├── asset-transfers/  # Halaman Pengajuan & Persetujuan Transfer Aset
│   │   ├── auth/pages/       # Halaman Login & Signup (Dark Glassmorphism)
│   │   ├── landing/pages/    # Halaman Utama (Landing, Terms, Privacy Policy, Opening Intro)
│   │   ├── maintenance/      # Halaman Agenda Pemeliharaan Rutin & Form Modal
│   │   ├── profile/pages/    # Halaman Pengaturan Profil Pengguna
│   │   ├── reports/pages/    # Halaman Daftar Laporan Masalah & Detail Laporan
│   │   ├── rooms/pages/      # Halaman Kelola Ruangan & Inventaris Aset
│   │   └── users/pages/      # Halaman Manajemen Akun Pengguna & Admin
│   ├── lib/                  # Library & API Wrapper
│   │   ├── api-client.ts     # Wrapper Fetch API terintegrasi Token Refresh
│   │   └── utils.ts          # Helpers `cn()` (clsx + tailwind-merge)
│   ├── stores/               # State Management Lokal & Sesi
│   │   └── auth-store.ts     # Zustand Store (AccessToken memory & Data User)
│   └── types/                # Type Definitions & DTO Interfaces
│       └── api.ts
├── .env.example
├── Dockerfile
├── vite.config.ts            # Konfigurasi Vite & Vite PWA Plugin
└── package.json
```

---

## Docs Directory Structure (`docs/`)

```text
docs/
├── AGENT.md                  # Panduan khusus untuk AI coding agent
├── AI.md                     # Konfigurasi prompt Gemini, priority engine, & RAG roadmap
├── API.md                    # Katalog lengkap REST API endpoints, DTO, & contoh cURL
├── ARCHITECTURE.md           # Arsitektur global & diagram alur siklus laporan
├── BACKEND-ARCHITECTURE.md   # Modul NestJS, middleware security, & kueri postgres.js
├── COMPONENTS.md             # Dokumentasi komponen UI reusable & design system
├── CONTRIBUTION.md           # Panduan kontribusi internal
├── CONVENTIONS.md            # Konvensi penamaan, kode, & pola arsitektur (dokumen ini)
├── DATABASE.md               # ERD, kamus data, indeks, & riwayat migrasi
├── DEPLOYMENT.md             # Panduan deployment produksi via Docker & Nginx
├── Design.md                 # Filosofi & sistem desain UI/UX (warna, tipografi, animasi)
├── ENV.md                    # Penjelasan lengkap semua environment variables
├── FOLDER-STRUCTURE.md       # Struktur pohon folder backend & frontend (dokumen ini)
├── FRONTEND-ARCHITECTURE.md  # Arsitektur React 19, Zustand, router-guards, & design system
├── LOCAL-SETUP-LARAGON.md    # Panduan setup lokal menggunakan Laragon (Windows)
├── LOGGING.md                # Strategi logging backend & penanganan error terstruktur
├── MIGRATIONS.md             # Panduan menulis & menjalankan migrasi database SQL
├── PRD.md                    # Product Requirements Document
├── ROADMAP.md                # Status pengerjaan fitur & fase pengembangan
├── SECURITY.md               # Audit keamanan, JWT rotation, rate limiting, & lockout
├── SEED.md                   # Panduan menjalankan database seeding & data awal
├── SRS.md                    # Software Requirements Specification
├── TESTING.md                # Panduan pengujian unit test & verifikasi TypeScript
└── TROUBLESHOOTING.md        # Solusi masalah umum saat instalasi & penanganan galat
```
