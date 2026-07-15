# FixMind — Security Documentation

## Authentication

| Mechanism | Detail |
|-----------|--------|
| Access token | JWT, 15 minutes, Bearer header |
| Refresh token | Random 96-byte hex, SHA-256 stored in DB |
| Cookie | httpOnly, path `/api/v1/auth`, secure in production |
| Password | bcrypt, cost factor 12 |

## Authorization (RBAC)

Roles: `ADMIN`, `TECHNICIAN`, `USER`

Enforced via:
- `@Roles('ADMIN')` decorator
- Global `RolesGuard`
- Endpoints without `@Public()` require authentication

Business rules (e.g. "user can only view own reports") belong in **services**, not guards.

## Input Validation

- Global `ValidationPipe`: whitelist, forbidNonWhitelisted, transform
- DTOs with class-validator on every endpoint
- SQL: parameterized queries only via postgres.js tagged templates

## HTTP Security

- **helmet** — Mengamankan HTTP Headers dengan Content Security Policy (CSP) ketat secara terperinci. CSP membatasi eksekusi skrip hanya dari asal (`'self'`), melarang iframe, dan membatasi sumber gambar eksternal hanya dari Cloudinary.
- **CORS** — Validasi asal request melalui variabel lingkungan `CORS_ORIGIN`, dengan opsi `credentials: true`.
- **Rate limiting** — Rate limit global (100 req/menit default) yang dikonfigurasi melalui modul Throttler. Endpoint sensitif di-override untuk proteksi brute force:
  - Register: maksimal 5 request/menit.
  - Login: maksimal 10 request/menit.
  - Token Refresh (`/auth/refresh`): maksimal 10 request/menit.

## Secrets & Validation Hardening

- **Validasi Startup**: Variabel lingkungan `JWT_ACCESS_SECRET` dan `JWT_REFRESH_SECRET` divalidasi saat aplikasi dimulai. Kedua secret tersebut wajib berukuran **minimal 32 karakter** untuk memastikan keamanan enkripsi tanda tangan JWT.
- **Validasi Input & DTO**: 
  - **Kekuatan Kata Sandi**: Pendaftaran (`RegisterDto` dan `CreateUserDto`) memvalidasi kekuatan kata sandi menggunakan regex untuk mewajibkan minimal 1 huruf besar dan 1 angka.
  - **Prompt AI**: Masukan obrolan AI (`AiChatDto`) dibatasi maksimal 2000 karakter (`@MaxLength(2000)`) untuk mencegah serangan Denial of Service (DoS) pada API LLM.
  - **Pemisahan Hak Akses Profil**: Pembaruan profil user (`UpdateUserDto`) tidak mengizinkan pengubahan `avatarUrl` secara langsung melalui request body. Pembaruan avatar wajib melalui endpoint upload file resmi.
  - **Validasi Berkas Excel**: Endpoint import data aset (`/assets/import`) menggunakan `ParseFilePipe` untuk memvalidasi ukuran file (maksimal 10MB) dan memverifikasi MIME type berkas agar hanya menerima file spreadsheet (.xlsx/.xls).

## Session & Token Management

- **Refresh Token Rotation**: Token refresh baru diterbitkan setiap kali `/auth/refresh` digunakan, sedangkan token lama langsung direvoke.
- **Token In-Memory**: Access Token disimpan di memori frontend (Zustand store), bukan di `localStorage` atau `sessionStorage`, guna meminimalisir risiko pencurian token melalui serangan Cross-Site Scripting (XSS).
- **Pengiriman Token Aman**: Access token dikirim melalui HTTP Header `Authorization: Bearer`. Pengiriman JWT token melalui URL query string (`?token=...`) telah **dihapus** sepenuhnya untuk mencegah kebocoran token pada log server atau riwayat peramban web.
- **HttpOnly Cookies**: Refresh token dikirimkan melalui cookie HttpOnly, dengan atribut `sameSite: 'strict'` dan `secure: true` (pada lingkungan produksi).

## Infrastructure Protection

- **Reverse Proxy trust proxy**: Konfigurasi `trust proxy` diaktifkan pada aplikasi NestJS sehingga IP asli klien dapat diteruskan secara akurat oleh Nginx ke server backend. Ini memastikan log audit dan lockout IP brute force bekerja dengan benar.
- **Isolasi Database & Backend**: Pada file `docker-compose.yml`, port database Postgres (`5432`) dan port API backend (`3000`) ditutup dan tidak diekspos ke host luar. Akses antar service hanya terjadi di dalam jaringan Docker internal.
- **Nginx Security Headers**: Server web Nginx menyajikan header keamanan tambahan secara konsisten:
  - `X-Frame-Options: DENY` (anti-clickjacking)
  - `X-Content-Type-Options: nosniff` (anti-sniffing)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (menonaktifkan sensor/perangkat yang tidak dipakai)
- **Nginx Upload Limit**: Ditambahkan `client_max_body_size 15M` untuk mencegah kegagalan upload file besar.

## Data Protection

- **Soft Delete**: Penghapusan data menggunakan status logis (`softDelete`) untuk menjaga integritas data audit dan riwayat pelaporan.
- **report_histories**: Pencatatan riwayat penanganan laporan yang bersifat immutable.

## Threat Model & Mitigations

| Threat | Mitigation | Status |
|--------|------------|--------|
| SQL injection | Parameterized queries via postgres.js tagged templates | Terlindungi |
| XSS | React JSX auto-escaping + Helmet CSP (Content Security Policy) | Terlindungi |
| CSRF | SameSite strict cookies + API-only refresh path | Terlindungi |
| Brute force login | Rate limiting per endpoint + Account lockout (5 kali gagal login) | Aktif |
| Token theft | Short-lived access token + httpOnly refresh | Terlindungi |
| LLM API Abuse | Validasi batas prompt maksimal 2000 karakter di backend | Aktif |
| Arbitrary File Upload | Validasi ParseFilePipe (max size & MIME check) di backend | Aktif |
| Network Sniffing | HTTP Nginx HTTPS template TLSv1.2 & TLSv1.3 | Siap diaktifkan |

## Security Checklist Before Production

Pembagian tanggung jawab untuk memastikan keamanan sistem sebelum dideploy ke lingkungan produksi:

### Developer (Dev)
- [ ] **Review RBAC:** Verifikasi setiap endpoint baru memiliki decorator `@Roles()` yang sesuai dan validasi DTO lengkap.
- [ ] **Secure File Uploads:** Aktifkan Cloudinary signed uploads untuk memastikan hanya gambar yang sah yang diunggah ke storage.
- [ ] **Sanitize Input:** Pastikan tidak ada interpolasi string manual pada query SQL (gunakan tagged template literals `sql``).

### DevOps / Sysadmin (Ops)
- [ ] **Rotate Secrets:** Ganti semua kredensial default (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL`, password admin default, API key, dll).
- [ ] **Set NODE_ENV:** Pastikan variabel lingkungan `NODE_ENV` bernilai `production`.
- [ ] **Enable HTTPS & HSTS:** Konfigurasi TLS/SSL dan header Strict-Transport-Security (HSTS) di Nginx/Reverse Proxy.
- [ ] **Restrict Database Access:** Batasi akses port Postgres (5432) hanya dari host internal/backend (jangan dibuka ke publik).

---

## Automated Security Checks (Audit Otomatis)

Untuk mencegah celah keamanan pada dependensi pihak ketiga, lakukan audit otomatis secara berkala:

### 1. Audit Dependensi Proyek
Jalankan audit keamanan paket dari direktori proyek (`backend/` dan `frontend/`):
```bash
bun pm audit
```
*Gunakan perintah di atas sebagai bagian dari langkah build di pipeline CI/CD.*

### 2. Static Application Security Testing (SAST)
Rekomendasi integrasi di masa depan:
- Integrasikan **SonarQube** atau **Snyk** pada repositori GitHub untuk mendeteksi kerentanan kode secara otomatis setiap kali ada Pull Request.

---

## Local Secret Scanning (Pre-commit Hook)

Untuk mencegah *secrets* (seperti API Key, password, private key) tidak sengaja terkirim ke repositori Git, proyek ini menyediakan skrip pre-commit hook lokal.

### Cara Aktivasi Hook
Jalankan perintah berikut di root folder proyek Anda setelah pertama kali melakukan clone:
```powershell
git config core.hooksPath .githooks
```

### Cara Kerja Hook
Setiap kali Anda menjalankan perintah `git commit`, skrip [.githooks/pre-commit](file:///d:/FixMind/.githooks/pre-commit) akan otomatis:
1. Memindai semua baris kode baru (*staged changes*).
2. Memeriksa keberadaan file kunci rahasia (*private key*).
3. Mendeteksi jika ada variabel sensitif seperti `GEMINI_API_KEY`, `DATABASE_URL`, atau token rahasia lainnya yang berisi nilai riil (bukan *placeholder* seperti `your-key`).
4. Jika ditemukan rahasia yang terhardcode, commit akan dibatalkan otomatis sehingga Anda dapat memindahkannya ke file `.env` sebelum mencoba commit kembali.

