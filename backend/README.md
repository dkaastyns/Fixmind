# ASETKITA Semarang - Backend Service (NestJS)

Layanan backend untuk E-Lapor DPRD (ASETKITA Semarang) menggunakan framework NestJS 11 yang dirancang dengan performa optimal, tipe data ketat (TypeScript strict mode), dan arsitektur modular yang aman.

---

## Fitur Utama Backend

- **Query Raw SQL Berkecepatan Tinggi:** Menggunakan library `postgres.js` untuk interaksi database langsung tanpa ORM berat, menjamin eksekusi query super cepat dan kontrol penuh.
- **Semantic Search & RAG AI:** Terintegrasi dengan ekstensi `pgvector` di PostgreSQL untuk memproses *embedding* teks laporan dan aset guna menyajikan fitur pencarian pintar berbasis AI.
- **Rekomendasi AI Terintegrasi:** Integrasi API Gemini 2.5 Flash dan Groq (Llama 3.1) untuk analisis keparahan laporan, kategori masalah, penentuan prioritas otomatis, dan estimasi pengerjaan.
- **Autentikasi Aman & Rotasi Token:** Access token in-memory yang pendek dengan rotasi refresh token otomatis yang disimpan dalam cookie HttpOnly.
- **Rate Limiting & Account Lockout:** Menggunakan Throttler global untuk mencegah brute force dan DoS, serta mengunci akun secara otomatis setelah 5 kali kegagalan login berturut-turut.
- **Type Safety Ketat:** Dikonfigurasi dengan TypeScript strict mode pada `tsconfig.json` untuk mendeteksi potensi bug saat kompilasi.

---

## Struktur Folder & Rincian Modul Utama

```
backend/
├── src/
│   ├── app.module.ts       # Module utama (konfigurasi & registrasi APP_GUARD)
│   ├── main.ts             # Entrypoint aplikasi (CORS, trust proxy, Helmet, Pipes)
│   ├── common/             # Interceptor, decorator, exception filter global
│   ├── config/             # Skema validasi variabel lingkungan (.env)
│   ├── database/           # Setup koneksi database, skema, dan migrasi
│   └── modules/            # Modul-modul fitur utama aplikasi
```

Berikut adalah rincian tanggung jawab, controller, service, dan repository untuk setiap modul di `src/modules/`:

### 1. Modul AI (`src/modules/ai`)
- **Tanggung Jawab:** Menyediakan abstraksi multi-provider AI (Google Gemini 2.5 Flash & Groq Llama 3.1) untuk analisis teks laporan kerusakan, penentuan skor prioritas otomatis (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), kalkulasi estimasi jam pengerjaan, dan pembuatan saran rekomendasi tindakan perbaikan.
- **Key Services:**
  - `LlmProviderService`: Mengelola koneksi dan inferensi ke provider LLM (Gemini / Groq).
  - `PriorityEngineService`: Mesin kalkulasi aturan bisnis penentuan prioritas laporan.

### 2. Modul Analytics (`src/modules/analytics`)
- **Tanggung Jawab:** Menyajikan data statistik dan metrik performa operasional fasilitas untuk dasbor admin dan pimpinan.
- **Key Controller:** `AnalyticsController` (Endpoint: `/analytics/dashboard`, `/analytics/summary`).
- **Key Service:** `AnalyticsService`: Agregasi metrik total laporan, rasio penyelesaian, distribusi kerusakan per ruangan, dan tren bulanan.

### 3. Modul Assets (`src/modules/assets`)
- **Tanggung Jawab:** Manajemen siklus hidup aset inventaris daerah (CRUD), pengelolaan alur pengajuan dan verifikasi pemindahan aset (mutasi) antar ruangan, ekspor data inventaris ke format Excel (.xlsx) dan PDF, serta impor data aset massal.
- **Key Controller:** `AssetsController` (Endpoint: `/assets`, `/assets/transfers`, `/assets/export`, `/assets/import`).
- **Key Service & Repository:**
  - `AssetsService`: Logika bisnis inventaris aset dan validasi mutasi ruangan.
  - `AssetsRepository`: Eksekusi kueri parameterized `postgres.js` untuk data aset dan transfer.

### 4. Modul Auth (`src/modules/auth`)
- **Tanggung Jawab:** Autentikasi dan otorisasi pengguna (login, registrasi, logout), penerbitan JWT Access Token dan rotasi Refresh Token via HttpOnly cookie, reset kata sandi, dan proteksi penguncian akun setelah 5x kegagalan berturut-turut.
- **Key Controller:** `AuthController` (Endpoint: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`, `/auth/reset-password`).
- **Key Service & Repository:**
  - `AuthService`: Validasi kredensial (bcrypt), pembuatan token JWT, dan manajemen sesi.
  - `AuthRepository`: Pengelolaan token sesi, pencatatan percobaan login gagal, dan status lockout.
  - `JwtStrategy`: Passport strategy untuk validasi access token pada setiap request terlindungi.

### 5. Modul Cloudinary (`src/modules/cloudinary`)
- **Tanggung Jawab:** Integrasi cloud media storage untuk mengunggah, menyimpan, dan mengoptimasi bukti foto kerusakan fasilitas serta foto hasil perbaikan teknisi.
- **Key Service:** `CloudinaryService`: Upload stream multipart/form-data dan penghapusan berkas media.

### 6. Modul Health (`src/modules/health`)
- **Tanggung Jawab:** Endpoint pemantauan kesehatan aplikasi (liveness probe & readiness probe) untuk monitoring operasional backend dan konektivitas database PostgreSQL.
- **Key Controller:** `HealthController` (Endpoint: `/health`).

### 7. Modul Maintenance (`src/modules/maintenance`)
- **Tanggung Jawab:** Pengelolaan agenda pemeliharaan preventif fasilitas gedung (jadwal berkala mingguan, bulanan, triwulan, tahunan), manajemen data vendor rekanan eksternal, pencatatan estimasi vs realisasi biaya, dan pemantauan siklus pengerjaan.
- **Key Controller:** `MaintenanceController` (Endpoint: `/maintenance`, `/maintenance/vendors`).
- **Key Service & Repository:**
  - `MaintenanceService`: Logika bisnis penjadwalan pemeliharaan dan kalkulasi biaya.
  - `MaintenanceRepository`: Pengelolaan query database jadwal pemeliharaan dan vendor.

### 8. Modul Notifications (`src/modules/notifications`)
- **Tanggung Jawab:** Penyiaran event notifikasi real-time ke antarmuka web klien melalui WebSockets (Socket.io) saat terjadi perubahan status tiket laporan, persetujuan transfer aset, atau agenda pemeliharaan baru.
- **Key Gateway & Service:**
  - `NotificationsGateway`: Socket.io gateway untuk koneksi room klien, autentikasi handshake, dan event broadcasting.
  - `NotificationsService`: Helper pengiriman event terstruktur ke gateway.

### 9. Modul Reports (`src/modules/reports`)
- **Tanggung Jawab:** Inti alur kerja pelaporan kerusakan fasilitas, perubahan status tiket (`PENDING` -> `IN_PROGRESS` -> `DONE` -> `CANCELLED`), pencatatan riwayat audit linimasa, serta forum diskusi dan komentar per tiket laporan.
- **Key Controller:** `ReportsController` (Endpoint: `/reports`, `/reports/:id/status`, `/reports/:id/comments`, `/reports/:id/timeline`).
- **Key Service & Repository:**
  - `ReportsService`: Alur verifikasi laporan, trigger notifikasi, dan integrasi analisis AI.
  - `ReportsRepository`: Pengelolaan kueri database laporan, komentar, dan riwayat status.

### 10. Modul Rooms (`src/modules/rooms`)
- **Tanggung Jawab:** Pengelolaan data master ruangan dan gedung di lingkungan Sekretariat DPRD Kota Semarang, klasifikasi lantai, kapasitas, deskripsi, serta relasi daftar aset yang terdaftar pada ruangan tersebut.
- **Key Controller:** `RoomsController` (Endpoint: `/rooms`).
- **Key Service & Repository:**
  - `RoomsService`: Logika pengelompokan ruangan dan kalkulasi jumlah aset terdaftar.
  - `RoomsRepository`: Pengelolaan data tabel ruangan.

### 11. Modul Users (`src/modules/users`)
- **Tanggung Jawab:** Manajemen akun pengguna, profil pegawai, manajemen peran berbasis peran (Role-Based Access Control: `ADMIN` dan `USER`), reset kata sandi oleh admin, dan aktivasi akun.
- **Key Controller:** `UsersController` (Endpoint: `/users`, `/users/profile`).
- **Key Service & Repository:**
  - `UsersService`: Logika bisnis akun, otorisasi peran, dan hashing kata sandi.
  - `UsersRepository`: Operasi database untuk master pengguna.

---

## Panduan Instalasi & Development Lokal

### Persyaratan Utama
- [Bun](https://bun.sh/) 1.3+
- PostgreSQL 16+ dengan ekstensi **pgvector**

### Langkah Awal Setup
1. **Instal dependensi:**
   ```bash
   bun install
   ```

2. **Setup File `.env`:**
   Salin `.env.example` ke `.env` dan lengkapi variabel berikut:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/asetkita-semarang
   JWT_ACCESS_SECRET=your-super-long-secret-key-at-least-32-chars
   JWT_REFRESH_SECRET=your-other-super-long-secret-key-at-least-32-chars
   GEMINI_API_KEY=your-google-gemini-key
   ```

3. **Jalankan Migrasi Database:**
   ```bash
   bun run migrate
   ```

4. **Jalankan Seeder (Data Awal):**
   ```bash
   bun run seed
   ```

### Perintah Pemrosesan
```bash
# Menjalankan server dalam mode development (watch mode)
bun run start:dev

# Menjalankan test unit
bun run test

# Melakukan kompilasi/build backend
bun run build
```

---

## Standar Keamanan & Hardening API

Jika Anda ingin melanjutkan atau menambahkan endpoint baru, pastikan mematuhi aturan keamanan berikut:

1. **Gunakan Parameterized Query:**
   Selalu gunakan template literal bawaan `sql` untuk mengeksekusi query database. Jangan pernah menggunakan interpolasi string manual demi mencegah SQL Injection:
   ```typescript
   // BENAR (Aman)
   await sql`SELECT * FROM users WHERE id = ${id}`;

   // SALAH (Celah SQL Injection)
   await sql`SELECT * FROM users WHERE id = '${id}'`; 
   ```

2. **Validasi Input dengan DTO:**
   Setiap request body wajib memiliki class DTO yang divalidasi oleh `class-validator` (misal `@IsString()`, `@IsEmail()`).
   - Batasi panjang input teks bebas dengan `@MaxLength(...)` untuk menghindari eksploitasi memori.
   - Gunakan regex `@Matches(...)` untuk memverifikasi kekuatan kata sandi pengguna baru.

3. **Batasi Akses Endpoint dengan Guard:**
   - Semua endpoint dilindungi JWT secara default. Endpoint publik wajib didekorasi dengan `@Public()`.
   - Endpoint admin wajib dilindungi menggunakan dekorator `@Roles('ADMIN')`.

4. **Jangan Kirim Token via URL:**
   Selalu kirim access token melalui Header `Authorization: Bearer`. Penggunaan query parameter token (`?token=...`) dilarang keras karena akan bocor ke log jaringan dan history peramban.

---

## Lisensi

Hak Cipta (c) 2026 Sekretariat DPRD Kota Semarang / Tim Pengembang ASETKITA Semarang. Berlisensi di bawah [MIT License](../LICENSE).
