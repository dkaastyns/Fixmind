# FixMind — Backend Architecture

Dokumen ini menjelaskan arsitektur teknis server backend NestJS 11 pada sistem **E-Lapor DPRD (FixMind)**.

---

## 🛠️ Tech Stack Backend

- **NestJS 11** pada runtime **Bun 1.3+**
- **postgres.js** — Driver SQL murni dengan *tagged template literals* tanpa ORM
- **PostgreSQL 16** + **pgvector** — Database relasional dengan indeks vektor
- **Otentikasi Hybrida JWT**: Access Token (JSON) + HTTP-Only Cookie Refresh Token Rotation
- **Security Middleware**: `helmet`, `class-validator`, & `@nestjs/throttler` (Rate Limiting)
- **Real-Time Gateway**: `@nestjs/websockets` + **Socket.io**
- **Mesin AI**: Google Gemini 2.5 Flash API & Groq AI (Llama 3.1)

---

## 📂 Struktur Modul Backend (`backend/src/`)

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

## 🔄 Pola Struktur Setiap Modul (Per-Module Architecture)

Setiap modul di `backend/src/modules/` menerapkan pemisahan tanggung jawab yang jelas (*Clean Layered Architecture*):

```text
modules/<nama-modul>/
├── <nama-modul>.controller.ts    # Hanya menangani routing HTTP & parsing request
├── <nama-modul>.module.ts        # Pendaftaran dependency injection NestJS
├── dto/                          # DTO validasi class-validator untuk Request Body
├── services/                     # Logika bisnis & aturan aplikasi
└── repositories/                 # Kueri Raw SQL murni via postgres.js (Query Layer)
```

---

## 🔒 Lapisan Keamanan (Security Hardening)

1. **Helmet HTTP Headers**: Mengamankan header HTTP terhadap serangan XSS, Clickjacking, dan MIME sniffing.
2. **ValidationPipe Strict Whitelist**: Menolak dan membuang bidang (*fields*) ilegal yang tidak terdaftar di DTO request.
3. **Role-Based Access Control (RBAC)**: Guard `@Roles('ADMIN')` memverifikasi peran pengguna secara ketat di setiap endpoint terproteksi.
4. **Rate Limiting (Throttler)**: Membatasi maksimal 100 request/menit per IP untuk mencegah serangan DoS/brute force.
5. **Account Lockout Protection**: Akun otomatis dikunci selama 15 menit jika 5 kali berturut-turut gagal memasukkan kata sandi.
6. **Password Hashing**: Menggunakan `bcrypt` dengan faktor *salt cost* 12.
7. **Refresh Token Rotation**: Refresh token disimpan di database sebagai hash SHA-256 dan dikirim melalui cookie HTTP-Only.

---

## 🤖 Arsitektur Kecerdasan Buatan (AI Engine)

```text
Laporan Baru Dibuat (POST /reports)
  → Simpan Laporan ke Database (Status: PENDING)
  → Pemicu Asinkron LlmProviderService
  → Request ke Google Gemini 2.5 Flash / Groq AI
  → Parse Respon JSON: priority, score, recommendation, estimatedHours
  → Update Kolom ai_* di Tabel reports
  → Pancarkan Event Real-time WebSockets ke Admin
```

Jika terjadi gangguan koneksi ke API Gemini, pembuatan laporan pengguna tetap **berhasil**, dan kolom `ai_analysis_status` di-set menjadi `FAILED` tanpa membatalkan transaksi.
