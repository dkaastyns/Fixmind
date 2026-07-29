# ASETKITA Semarang — Dokumentasi Deployment & Penggelapan Sistem

Dokumen ini menjelaskan strategi dan langkah-langkah *deployment* aplikasi **E-Lapor DPRD (ASETKITA Semarang)** untuk lingkungan pengembangan lokal, pengujian (staging), maupun produksi (*production*).

---

## 1. Pengembangan Lokal (Windows + Laragon)

Panduan detail dapat dibaca pada [LOCAL-SETUP-LARAGON.md](./LOCAL-SETUP-LARAGON.md).

Langkah cepat setelah database PostgreSQL siap:

```powershell
# Terminal 1: Backend API
cd backend
copy .env.example .env   # Sesuaikan DATABASE_URL + JWT_ACCESS_SECRET
bun install
bun run migrate
bun run seed
bun run start:dev

# Terminal 2: Frontend Web
cd frontend
copy .env.example .env
bun install
bun run dev
```

---

## 2. Deployment Docker Compose (Lingkungan Produksi / Staging)

Seluruh kontainer dikonfigurasi menggunakan Docker Compose:

```bash
# 1. Salin file variabel lingkungan
cp .env.example .env

# 2. Build dan jalankan seluruh service di latar belakang
docker compose up -d --build
```

### Rincian Service Docker:

| Service | Port | Peran Service | Aksesibilitas Publik |
|---------|------|---------------|----------------------|
| **nginx** | 80, 443 | Reverse Proxy & Web Server | Publik (Di-expose ke mesin host) |
| **backend** | 3000 | NestJS API Gateway | Internal Docker Network (Tertutup dari luar) |
| **frontend** | 80 | React PWA Static Build | Internal Docker Network (Tertutup dari luar) |
| **postgres** | 5432 | Database `asetkita-semarang` + pgvector | Internal Docker Network (Tertutup dari luar) |

> **Catatan Pengetatan Keamanan (Port Hardening):** Demi keamanan tinggi, port PostgreSQL (`5432`) dan NestJS API (`3000`) sengaja tidak di-expose ke publik. Nginx bertindak sebagai satu-satunya pintu masuk aplikasi. Jika Anda memerlukan akses database langsung untuk pengujian lokal dari luar Docker, buka berkas [docker-compose.yml](../docker-compose.yml) lalu uncomment baris `ports` pada service `db` atau `backend` secara sementara.

---

## 3. Konfigurasi Nginx Reverse Proxy

- **Lokasi file:** `infra/nginx/conf.d/asetkita-semarang.conf`
- **Aturan Routing:** Rute `/api/` diarahkan ke backend NestJS, sedangkan rute `/` diarahkan ke build frontend React.
- **Dukungan SSL/HTTPS:** Disediakan blok HTTPS opsional yang dapat diaktifkan setelah meletakkan sertifikat SSL di `infra/nginx/certs/`.

---

## 4. Strategi Variabel Lingkungan (.env) & Pengelolaan Rahasia (Secrets)

| Lingkungan | DATABASE_URL | CORS_ORIGIN | Konfigurasi Cookie Refresh |
|------------|--------------|-------------|----------------------------|
| **Local** | `localhost:5432/asetkita-semarang` | `http://localhost:5173` | `secure=false` |
| **Staging** | Managed PostgreSQL Staging | URL Staging | `secure=true` |
| **Production** | Managed PostgreSQL Production | URL Production | `secure=true, sameSite=strict` |

> [!WARNING]
> **Dilarang keras meng-commit berkas `.env` yang berisi kredensial asli ke Git.** Berkas `.gitignore` telah diatur untuk mengecualikan berkas `.env` di seluruh folder.

### A. Pengelolaan Secrets di Env Manager

Untuk deployment ke staging atau produksi, kredensial sensitif tidak boleh ditulis langsung ke dalam file `.env` di server. Gunakan manajer rahasia berikut:

1. **GitHub Secrets (untuk CI/CD)**:
   - Simpan kredensial pengujian atau deployment di **Settings > Secrets and variables > Actions** di repositori GitHub Anda.
   - Panggil rahasia tersebut di dalam berkas workflow YAML menggunakan sintaks `${{ secrets.NAMA_SECRET }}`.
2. **Environment Variables bawaan Platform (PaaS / Serverless)**:
   - Jika menggunakan layanan PaaS (seperti DigitalOcean App Platform, Render, AWS Elastic Beanstalk), masukkan variabel lingkungan secara langsung melalui dasbor platform mereka di bagian **Environment / Variables**. Kontainer NestJS/Vite akan membacanya secara otomatis dari memori saat runtime.
3. **Vault Server (Enterprise)**:
   - Untuk infrastruktur mandiri (VM/VPS), gunakan **HashiCorp Vault** atau AWS/GCP Secrets Manager untuk menyimpan, memutar, dan mengambil rahasia secara aman saat container di-deploy.

### B. Konfigurasi `.env` Minimal untuk Deployment

Berikut adalah variabel minimal yang **wajib** dikonfigurasi saat deploy:

**Backend (`backend/.env`):**
```env
# Koneksi Database
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Port & Node Env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://app.dprd.semarangkota.go.id

# JWT Security Secrets (Gunakan string acak minimal 32 karakter)
JWT_ACCESS_SECRET=kunci-rahasia-jwt-access-token-produksi-anda
JWT_REFRESH_SECRET=kunci-rahasia-jwt-refresh-token-produksi-anda

# Provider AI & Media Uploads
LLM_PROVIDER=gemini
GEMINI_API_KEY=kunci-api-gemini-produksi-anda
CLOUDINARY_CLOUD_NAME=nama-cloudinary-anda
CLOUDINARY_API_KEY=key-cloudinary-anda
CLOUDINARY_API_SECRET=secret-cloudinary-anda
```

**Frontend (`frontend/.env`):**
```env
VITE_API_BASE_URL=https://app.dprd.semarangkota.go.id/api/v1
```

### C. Mencegah Kebocoran Rahasia (Secret Scanning)

1. **Lokal (Pre-commit Hook)**:
   - Direkomendasikan untuk memasang perkakas **Gitleaks** secara lokal untuk memindai commit sebelum dikirim ke remote.
   - Pasang lewat Homebrew (`brew install gitleaks`) atau Scoop (`scoop install gitleaks`) lalu jalankan `gitleaks detect --verbose` untuk memindai repositori Anda secara berkasional.
2. **Otomatis di CI Pipeline**:
   - Pipeline CI kita dilengkapi dengan job **Secret Scanning** otomatis menggunakan **TruffleHog OSS**. Setiap push atau Pull Request akan dipindai dari potensi kebocoran API Key (Gemini, Cloudinary, AWS) maupun JWT secrets. Jika terdeteksi kunci sensitif asli, sistem akan segera memberikan peringatan di log Actions.

---

## 5. Strategi Cadangan Data (Backup Strategy)

### Database PostgreSQL:
- Lakukan `pg_dump` otomatis setiap hari untuk database `asetkita-semarang`.
- Simpan cadangan 7 harian + 4 mingguan.
- Uji proses pemulihan (*restore*) secara berkala setiap bulan.

```bash
pg_dump -U postgres -d asetkita-semarang -F c -f asetkita_semarang_$(date +%Y%m%d).dump
```

### Media Cloudinary:
Manfaatkan fitur otomatis *backup & versioning* pada layanan Cloudinary untuk media gambar kerusakan dan perbaikan yang diunggah pengguna.

---

## 6. Strategi Pemantauan & Log (Logging Strategy)

| Lapisan Sistem | Perkakas Log |
|----------------|--------------|
| **NestJS Backend** | Standard Logger NestJS $\rightarrow$ stdout |
| **Nginx Web Server** | `/var/log/nginx/access.log` & `error.log` |
| **Production Server** | Pengiriman log terpusat (contoh: DigitalOcean Monitoring, Azure Log Analytics) |

---

## 7. Alur Otomatisasi CI/CD (Rekomendasi)

1. Jalankan linter (`bun run lint`) dan unit test (`bun run test`) pada setiap Pull Request.
2. Lakukan build image Docker otomatis saat ada penggabungan ke branch `main`.
3. Jalankan migrasi database (`bun run migrate`) secara otomatis sebelum peralihan *traffic* produksi.
