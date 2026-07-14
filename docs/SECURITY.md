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

- **helmet** — XSS, clickjacking headers
- **CORS** — explicit origin from env, credentials enabled
- **Rate limiting** — 100 req/min default (configurable)

## Secrets Management

| Secret | Storage |
|--------|---------|
| JWT_ACCESS_SECRET | env |
| JWT_REFRESH_SECRET | env |
| GEMINI_API_KEY | env |
| DATABASE_URL | env |
| Cloudinary keys | env |

Minimum 32 characters for JWT secrets in production.

## Session Management

- Refresh token rotation on `/auth/refresh`
- Revoke on logout
- `revoked_at` timestamp; expired sessions ignored

## Data Protection

- Soft delete preserves audit trail
- `report_histories` immutable log
- No PII in seed data

## Threat Model (MVP)

| Threat | Mitigation |
|--------|------------|
| SQL injection | Parameterized queries |
| XSS | React escaping + helmet CSP (tighten in prod) |
| CSRF | SameSite cookies + API-only refresh path |
| Brute force login | Rate limiting (add account lockout in v1.1) |
| Token theft | Short-lived access token, httpOnly refresh |

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

