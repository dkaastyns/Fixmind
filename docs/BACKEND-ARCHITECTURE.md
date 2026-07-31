# ASETKITA Semarang — Backend Architecture

Dokumen ini menjelaskan arsitektur teknis server backend NestJS 11 pada sistem **E-Lapor DPRD (ASETKITA Semarang)**.

---

## Tech Stack Backend

| Teknologi | Versi | Peran |
|-----------|-------|-------|
| NestJS | 11 | Framework server TypeScript enterprise |
| Bun | 1.3+ | Runtime & package manager |
| postgres.js | — | Driver SQL murni (Raw SQL, tagged template literals, tanpa ORM) |
| PostgreSQL | 16+ | Database relasional utama |
| pgvector | — | Ekstensi pencarian vektor untuk fitur RAG masa depan |
| JWT (jsonwebtoken) | — | Autentikasi Access Token + Refresh Token Rotation |
| Helmet | — | HTTP security headers |
| class-validator | — | Validasi DTO request body |
| @nestjs/throttler | — | Rate limiting berbasis IP |
| @nestjs/websockets + Socket.io | — | Real-time event gateway |
| Google Gemini API | 2.5 Flash | Mesin analisis prioritas laporan |
| Groq AI (Llama 3.1) | — | Provider AI alternatif |
| Cloudinary SDK | — | Upload & penyimpanan media foto |
| bcrypt | — | Hashing password (cost factor 12) |

---

## Struktur Modul Backend (`backend/src/`)

```text
backend/src/
├── main.ts                 # Bootstrap server, global pipes, CORS, Helmet
├── app.module.ts           # Root module, pendaftaran guard/filter global
├── config/
│   └── env.validation.ts   # Skema validasi variabel lingkungan (.env)
├── database/
│   ├── database.module.ts  # Provider global koneksi database
│   └── sql.ts              # Factory postgres.js & konversi snake_case -> camelCase
├── common/
│   ├── decorators/         # @Roles(), @Public(), @CurrentUser()
│   ├── filters/            # AllExceptionsFilter (envelope error standar)
│   ├── interceptors/       # TransformInterceptor (envelope respon sukses standar)
│   └── types/              # DTO interface, API response, & row database types
└── modules/
    ├── ai/                 # LlmProviderService & Priority Engine
    ├── analytics/          # Controller & Service statistik dasbor admin
    ├── asset-transfers/    # Controller, Service, & Repo pengajuan transfer aset
    ├── assets/             # Controller, Service, Repo aset & bulk import Excel
    ├── auth/               # Controller, Service, & Session Repo (login, refresh, logout)
    ├── health/             # Controller health check status server
    ├── maintenance/        # Controller, Service, & Repo agenda pemeliharaan & vendor
    ├── reports/            # Controller, Service, & Repo laporan kerusakan & PDF/Excel export
    ├── rooms/              # Controller, Service, & Repo ruangan DPRD
    ├── users/              # Controller, Service, & Repo manajemen akun & lockout
    └── websockets/         # Gateway Socket.io pemancar notifikasi real-time
```

---

## Pola Struktur Setiap Modul (Per-Module Architecture)

Setiap modul di `backend/src/modules/` menerapkan pemisahan tanggung jawab yang jelas (*Clean Layered Architecture*):

```text
modules/<nama-modul>/
├── <nama-modul>.controller.ts    # Hanya menangani routing HTTP & parsing request
├── <nama-modul>.module.ts        # Pendaftaran dependency injection NestJS
├── dto/                          # DTO validasi class-validator untuk Request Body
├── services/                     # Logika bisnis & aturan aplikasi
└── repositories/                 # Kueri Raw SQL murni via postgres.js (Query Layer)
```

Aturan tanggung jawab per lapisan:

| Lapisan | Tanggung Jawab | Batasan |
|---------|----------------|---------|
| Controller | Routing HTTP, parse request, panggil service | Tidak boleh mengandung logika bisnis atau kueri database |
| Service | Logika bisnis, validasi tambahan, orkestrasi | Tidak boleh langsung menulis kueri SQL |
| Repository | Kueri Raw SQL murni via `postgres.js` | Tidak boleh mengandung logika bisnis |

---

## Lapisan Keamanan (Security Hardening)

| Mekanisme | Implementasi | Keterangan |
|-----------|--------------|------------|
| HTTP Security Headers | `helmet` | Mencegah XSS, Clickjacking, MIME sniffing |
| Input Validation | `ValidationPipe` + `class-validator` | Whitelist ketat — field tidak terdaftar di DTO ditolak dan dibuang |
| Role-Based Access Control | Guard `@Roles('ADMIN')` | Memeriksa peran dari JWT payload di setiap endpoint terproteksi |
| Rate Limiting | `@nestjs/throttler` | Maks. 100 req/menit per IP (dapat dikonfigurasi via `THROTTLE_TTL` & `THROTTLE_LIMIT`) |
| Account Lockout | `failed_login_count` + `locked_until` | Kunci akun 15 menit setelah 5x gagal login berturut-turut |
| Password Hashing | `bcrypt` (cost 12) | Password tidak pernah disimpan dalam bentuk teks polos |
| Refresh Token Rotation | Hash SHA-256 di database + HttpOnly Cookie | Token lama otomatis tidak valid saat token baru diterbitkan |

---

## Arsitektur Kecerdasan Buatan (AI Engine)

```text
Laporan Baru Dibuat (POST /reports)
  -> Simpan Laporan ke Database (Status: PENDING)
  -> Pemicu Asinkron LlmProviderService
  -> Request ke Google Gemini 2.5 Flash / Groq AI
  -> Parse Respon JSON: priority, score, recommendation, estimatedHours
  -> Update Kolom ai_* di Tabel reports
  -> Pancarkan Event Real-time WebSockets ke Admin
```

Jika terjadi gangguan koneksi ke API Gemini, pembuatan laporan pengguna tetap **berhasil**, dan kolom `ai_analysis_status` di-set menjadi `FAILED` tanpa membatalkan transaksi. Admin dapat memicu ulang analisis AI secara manual.

---

## Format Response Envelope API

Semua respons dari backend mengikuti format envelope standar yang konsisten (diterapkan oleh `TransformInterceptor` dan `AllExceptionsFilter`):

**Sukses:**
```json
{
  "success": true,
  "message": "Deskripsi hasil operasi",
  "data": { }
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Deskripsi error"
}
```

---

## Koneksi Database & Konversi Nama Kolom

Backend menggunakan `postgres.js` dengan konfigurasi `transform` di `backend/src/database/sql.ts` yang secara otomatis mengkonversi nama kolom dari format `snake_case` (PostgreSQL) ke `camelCase` (TypeScript/JavaScript). Proses ini transparan — developer tidak perlu melakukan mapping manual saat membaca hasil kueri.
