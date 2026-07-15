# FixMind — Backend Service (NestJS)

Layanan backend untuk E-Lapor DPRD (FixMind) menggunakan framework NestJS 11 yang dirancang dengan performa optimal dan arsitektur modular yang aman.

## Fitur Utama Backend
- **Query Raw SQL Berkecepatan Tinggi:** Menggunakan library `postgres.js` untuk interaksi database langsung tanpa ORM berat, menjamin eksekusi query super cepat dan kontrol penuh.
- **Semantic Search & RAG AI:** Terintegrasi dengan ekstensi `pgvector` di PostgreSQL untuk memproses *embedding* teks laporan dan aset guna menyajikan fitur pencarian pintar berbasis AI.
- **Rekomendasi AI Terintegrasi:** Integrasi API Gemini 2.5 Flash dan Groq (Llama 3.1) untuk analisis keparahan laporan, kategori masalah, dan estimasi pengerjaan.
- **Autentikasi Aman & Rotasi Token:** Access token in-memory yang pendek dengan rotasi refresh token otomatis yang disimpan dalam cookie HttpOnly.
- **Rate Limiting & Account Lockout:** Menggunakan Throttler global untuk mencegah brute force dan DoS, serta mengunci akun secara otomatis setelah 5 kali kegagalan login berturut-turut.

---

## Struktur Folder Utama
```
backend/
├── src/
│   ├── app.module.ts       # Module utama (konfigurasi & registrasi APP_GUARD)
│   ├── main.ts             # Entrypoint aplikasi (CORS, trust proxy, Helmet, Pipes)
│   ├── common/             # Interceptor, decorator, exception filter global
│   ├── config/             # Skema validasi variabel lingkungan (.env)
│   ├── database/           # Setup koneksi database, skema, dan migrasi
│   └── modules/            # Modul-modul fitur utama aplikasi
│       ├── ai/             # RAG & LLM Integration (Gemini/Groq)
│       ├── assets/         # Manajemen aset, pemindahan, & import Excel
│       ├── auth/           # Login, Register, Logout, & Session Management
│       ├── maintenance/    # Jadwal pemeliharaan berkala & manajemen vendor
│       ├── reports/        # Pelaporan kerusakan & timeline progres
│       └── users/          # Manajemen data pengguna & RBAC
```

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
   DATABASE_URL=postgresql://postgres:password@localhost:5432/fixmind
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
   - Batasi panjang input teks bebas (seperti obrolan AI) dengan `@MaxLength(...)` untuk menghindari eksploitasi memori.
   - Gunakan regex `@Matches(...)` untuk memverifikasi kekuatan kata sandi pengguna baru.

3. **Batasi Akses Endpoint dengan Guard:**
   - Semua endpoint dilindungi JWT secara default. Endpoint publik wajib didekorasi dengan `@Public()`.
   - Endpoint admin wajib dilindungi menggunakan dekorator `@Roles('ADMIN')`.

4. **Jangan Kirim Token via URL:**
   Selalu kirim access token melalui Header `Authorization: Bearer`. Penggunaan query parameter token (`?token=...`) dilarang keras karena akan bocor ke log jaringan dan history peramban.
