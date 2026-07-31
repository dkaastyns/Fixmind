# ASETKITA Semarang — Konfigurasi Environment Variables

Dokumen ini menjelaskan seluruh variabel lingkungan (*environment variables*) yang digunakan oleh proyek ASETKITA Semarang, mencakup backend NestJS, frontend Vite, dan konfigurasi Docker Compose.

---

## Lokasi File Konfigurasi

| File | Digunakan Oleh | Keterangan |
|------|----------------|------------|
| `backend/.env` | Server NestJS (runtime) | Wajib ada. Berisi rahasia aplikasi dan koneksi database. |
| `frontend/.env` | Client Vite (build-time) | Berisi URL API backend. Dibaca saat proses `build` atau `dev`. |
| `.env` (root) | Docker Compose | Digunakan oleh `docker-compose.yml` untuk konfigurasi container produksi. |
| `backend/.env.example` | Referensi developer | Template kosong untuk disalin menjadi `backend/.env`. |
| `.env.example` (root) | Referensi developer | Template kosong untuk disalin menjadi `.env` (root, Docker). |

**Penting:** Jangan pernah menyimpan nilai rahasia (`*_SECRET`, `*_KEY`, `*_PASSWORD`) ke dalam repositori Git. Semua file `.env` sudah terdaftar di `.gitignore`.

---

## Backend (`backend/.env`)

### Koneksi Database

| Variable | Wajib | Default (Contoh) | Deskripsi |
|----------|-------|-------------------|-----------|
| `DATABASE_URL` | Ya | `postgresql://postgres:postgres@localhost:5432/asetkita-semarang` | Connection string PostgreSQL penuh. Format: `postgresql://<user>:<password>@<host>:<port>/<database>`. Mendukung URL pooler Supabase untuk produksi. |

### Konfigurasi Server

| Variable | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `PORT` | Tidak | `3000` | Port tempat server NestJS dijalankan. |
| `NODE_ENV` | Ya | `development` | Mode runtime aplikasi. Nilai yang valid: `development`, `production`, `test`. |
| `CORS_ORIGIN` | Ya | `http://localhost:5173` | URL asal (*origin*) frontend yang diizinkan oleh CORS. Untuk produksi Docker, isi dengan URL domain publik (contoh: `https://asetkita.semarang.go.id`). Beberapa asal dapat dipisahkan dengan koma. |

### Autentikasi JWT

| Variable | Wajib | Default (Contoh) | Deskripsi |
|----------|-------|-------------------|-----------|
| `JWT_ACCESS_SECRET` | Ya | — | Kunci rahasia untuk menandatangani Access Token. Minimal 32 karakter acak. Gunakan generator seperti `openssl rand -hex 32`. |
| `JWT_REFRESH_SECRET` | Ya | — | Kunci rahasia untuk menandatangani Refresh Token. Harus berbeda dari `JWT_ACCESS_SECRET`. Minimal 32 karakter acak. |
| `JWT_ACCESS_EXPIRES` | Tidak | `15m` | Durasi masa berlaku Access Token. Format: `<angka><satuan>` (contoh: `15m`, `1h`, `2h`). |
| `JWT_REFRESH_EXPIRES` | Tidak | `7d` | Durasi masa berlaku Refresh Token yang disimpan di database dan cookie. Format: `<angka><satuan>` (contoh: `7d`, `30d`). |

### Kecerdasan Buatan (AI Engine)

| Variable | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `LLM_PROVIDER` | Ya | `gemini` | Penyedia model AI yang aktif. Nilai yang valid: `gemini` (Google Gemini), `groq` (Groq Llama). Memilih `groq` mengharuskan variabel `GROQ_API_KEY` juga diisi. |
| `GEMINI_API_KEY` | Ya* | — | API key dari Google AI Studio ([aistudio.google.com](https://aistudio.google.com)). *Wajib jika `LLM_PROVIDER=gemini`. |
| `GEMINI_MODEL` | Tidak | `gemini-2.5-flash` | Nama model Gemini yang digunakan. Contoh lain: `gemini-1.5-pro`, `gemini-2.0-flash`. |
| `GROQ_API_KEY` | Ya* | — | API key dari Groq Console ([console.groq.com](https://console.groq.com)). *Wajib jika `LLM_PROVIDER=groq`. |

### Penyimpanan Media (Cloudinary)

| Variable | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `CLOUDINARY_CLOUD_NAME` | Ya* | — | Nama cloud Cloudinary Anda. Tersedia di dashboard Cloudinary > Settings > Account. *Wajib jika fitur unggah foto diaktifkan. |
| `CLOUDINARY_API_KEY` | Ya* | — | API key Cloudinary. |
| `CLOUDINARY_API_SECRET` | Ya* | — | API secret Cloudinary. Jangan pernah ekspos ke frontend. |

### Rate Limiting

| Variable | Wajib | Default | Deskripsi |
|----------|-------|---------|-----------|
| `THROTTLE_TTL` | Tidak | `60000` | Jendela waktu (dalam milidetik) untuk rate limiting. Default: `60000` (60 detik). |
| `THROTTLE_LIMIT` | Tidak | `100` | Jumlah maksimum request yang diizinkan dalam jendela `THROTTLE_TTL` per IP. |

---

## Frontend (`frontend/.env`)

Variabel frontend yang menggunakan Vite **harus diawali dengan `VITE_`** agar tersedia di sisi klien saat runtime.

| Variable | Wajib | Default (Dev) | Deskripsi |
|----------|-------|---------------|-----------|
| `VITE_API_BASE_URL` | Ya | `http://localhost:3000/api/v1` | URL dasar (*base URL*) API backend. Semua pemanggilan API di frontend menggunakan URL ini sebagai awalan. Untuk produksi Docker (via Nginx), ubah menjadi `/api/v1` (relatif). |

---

## Docker Compose (`.env` root)

File `.env` di root digunakan oleh `docker-compose.yml` untuk melakukan interpolasi variabel ke dalam definisi service container.

| Variable | Wajib | Default (Contoh) | Deskripsi |
|----------|-------|-------------------|-----------|
| `POSTGRES_PASSWORD` | Ya | `changeme` | Password untuk user `postgres` di container PostgreSQL. Gunakan nilai yang kuat dan acak untuk lingkungan produksi. |
| `JWT_ACCESS_SECRET` | Ya | — | Sama dengan variabel backend. Diteruskan ke container backend sebagai environment variable. |
| `JWT_REFRESH_SECRET` | Ya | — | Sama dengan variabel backend. |
| `GEMINI_API_KEY` | Ya | — | API key Gemini yang diteruskan ke container backend. |
| `CORS_ORIGIN` | Ya | `http://localhost` | Origin CORS untuk produksi. Isi dengan URL domain publik Nginx (contoh: `https://asetkita.semarang.go.id`). |
| `VITE_API_BASE_URL` | Ya | `/api/v1` | Diteruskan ke container frontend saat build. Untuk produksi via Nginx, gunakan path relatif `/api/v1`. |

---

## Cara Menyiapkan File .env (Langkah Cepat)

### Untuk Development Lokal

```bash
# 1. Salin template ke file .env backend
cp backend/.env.example backend/.env

# 2. Edit backend/.env dan isi nilai sesuai kebutuhan lokal
# (Minimal: DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY)

# 3. Buat frontend/.env
echo "VITE_API_BASE_URL=http://localhost:3000/api/v1" > frontend/.env
```

### Untuk Docker Compose (Produksi/Staging)

```bash
# 1. Salin template root
cp .env.example .env

# 2. Edit .env dan isi semua nilai wajib
# Pastikan POSTGRES_PASSWORD, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, GEMINI_API_KEY terisi

# 3. Jalankan Docker Compose
docker compose up -d --build
```

---

## Validasi Environment Variable (Backend)

Backend NestJS memvalidasi semua variabel lingkungan pada waktu startup menggunakan skema validasi di `backend/src/config/env.validation.ts`. Jika ada variabel wajib yang tidak diisi atau formatnya salah, server akan **gagal dijalankan** dan mencetak pesan error deskriptif ke konsol.

Ini memastikan bahwa server tidak pernah berjalan dalam kondisi konfigurasi yang tidak lengkap.
