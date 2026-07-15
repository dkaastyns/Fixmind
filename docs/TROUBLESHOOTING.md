# FixMind — Panduan Pemecahan Masalah (Troubleshooting)

Dokumen ini berisi panduan penyelesaian untuk masalah-masalah umum yang mungkin Anda temui saat mengonfigurasi, menjalankan, atau mengembangkan aplikasi FixMind.

---

## 1. Masalah Database & Koneksi

### Koneksi Database Gagal atau Error `DATABASE_URL`
* **Gejala:** Backend crash saat startup dengan pesan `DATABASE_URL is required` atau `Connection refused`.
* **Solusi:**
  1. Pastikan Anda telah menduplikat `.env.example` menjadi `.env` di folder `backend/`.
  2. Buka `.env` dan pastikan format `DATABASE_URL` sudah benar:
     ```env
     DATABASE_URL=postgres://username:password@localhost:5432/fixmind
     ```
  3. Pastikan server PostgreSQL lokal Anda sudah berjalan (baik melalui instalasi lokal, Docker, maupun Laragon).
  4. Coba lakukan ping ke database port `5432`.

### Error Ekstensi `pgvector` Saat Migrasi
* **Gejala:** Migrasi `0001_init_extensions.sql` gagal karena `vector` extension tidak ditemukan.
* **Solusi:**
  - Proyek ini membutuhkan PostgreSQL yang terpasang dengan ekstensi **pgvector**.
  - **Jika menggunakan Docker:** Gunakan image resmi pgvector: `pgvector/pgvector:pg16` atau versi di atasnya.
  - **Jika menggunakan PostgreSQL lokal Windows/Laragon:** Anda harus mengunduh dan memasang binari pgvector secara terpisah ke dalam folder PostgreSQL Anda. Baca panduan instalasi resmi [pgvector di Windows](https://github.com/pgvector/pgvector#windows).

---

## 2. Masalah Port Konflik (Port Conflict)

### Port 3000 (Backend) atau Port 5173 (Frontend) Sudah Terpakai
* **Gejala:** Menjalankan `bun run start:dev` atau `bun run dev` memunculkan pesan error `EADDRINUSE` atau server menggunakan port acak lainnya.
* **Solusi:**
  - **Windows (PowerShell):** Cari ID proses (PID) yang menduduki port tersebut:
    ```powershell
    netstat -ano | findstr 3000
    ```
    Hentikan proses tersebut dengan PID yang ditemukan:
    ```powershell
    stop-process -Id <PID_PROSES> -Force
    ```
  - **Ubah Port Backend:** Anda dapat mengubah port backend di `.env` backend dengan mengubah variabel `PORT=3001` lalu sesuaikan `VITE_API_URL` di frontend `.env`.

---

## 3. Masalah Integrasi AI (Gemini API)

### Analisis AI Laporan Selalu Menghasilkan Status `FAILED`
* **Gejala:** Kolom AI priority di halaman admin kosong atau status analisis laporan menunjukkan status gagal.
* **Solusi:**
  1. Periksa apakah `GEMINI_API_KEY` sudah terisi dengan kunci API Google AI Studio yang valid di backend `.env`.
  2. Pastikan kuota API gratis Anda tidak habis.
  3. Periksa koneksi internet server backend Anda.
  4. Periksa log terminal backend untuk melihat detail pesan kesalahan dari library Google Gen AI.

---

## 4. Masalah Real-time (WebSockets)

### Frontend Mengalami Error Sambungan WebSocket (CORS)
* **Gejala:** Muncul error CORS di konsol browser bertuliskan `Access-Control-Allow-Origin` saat mencoba menghubungkan Socket.io.
* **Solusi:**
  - Pastikan variabel `CORS_ORIGIN` di `.env` backend sudah dikonfigurasi dan cocok dengan URL frontend Anda (default: `http://localhost:5173`).
  ```env
  CORS_ORIGIN=http://localhost:5173
  ```

---

## 5. Masalah Instalasi PWA (Progressive Web App)

### Tombol "Add to Home Screen" atau "Install" Tidak Muncul di Browser
* **Gejala:** Aplikasi diakses dari HP tetapi browser Chrome/Safari tidak mendeteksi aplikasi sebagai PWA.
* **Solusi:**
  - **Syarat Wajib HTTPS:** Untuk keamanan, browser seluler membatasi instalasi PWA hanya melalui koneksi **HTTPS** yang aman (pengecualian diberikan untuk akses via `localhost` di mesin lokal).
  - Jika Anda mendeploy aplikasi untuk diuji di perangkat seluler lain secara lokal, gunakan reverse proxy seperti **ngrok** atau **Localtunnel** untuk menyediakan sertifikat HTTPS secara gratis saat development.

---

  - **Syarat Wajib HTTPS:** Untuk keamanan, browser seluler membatasi instalasi PWA hanya melalui koneksi **HTTPS** yang aman (pengecualian diberikan untuk akses via `localhost` di mesin lokal).
  - Jika Anda mendeploy aplikasi untuk diuji di perangkat seluler lain secara lokal, gunakan reverse proxy seperti **ngrok** atau **Localtunnel** untuk menyediakan sertifikat HTTPS secara gratis saat development.

---

## 6. Masalah Package Manager Bun

### Lockfile Rusak / Konflik Dependensi
* **Gejala:** Error saat menjalankan `bun install` dikarenakan ketidakcocokan versi atau error unduhan cache.
* **Solusi:**
  1. Hapus folder `node_modules` dan file `bun.lock` di folder frontend maupun backend.
  2. Bersihkan cache bun:
     ```powershell
     bun pm cache clean
     ```
  3. Jalankan kembali instalasi bersih:
     ```powershell
     bun install
     ```

---

## 7. Masalah Docker Compose & Validasi Keamanan Baru

### Error Docker Compose: `DATABASE_URL must be set in .env`
* **Gejala:** Menjalankan `docker compose up` menghasilkan pesan error fatal yang menghentikan peluncuran kontainer karena variabel lingkungan kosong.
* **Solusi:**
  - Sejak hardening keamanan diterapkan, Docker Compose tidak lagi menggunakan fallback rahasia bawaan (`changeme`/`password`). Anda wajib mengisi `.env` di folder root sebelum menjalankan Docker Compose.
  - Buat file `.env` di direktori yang sama dengan `docker-compose.yml` dan pastikan mendefinisikan variable berikut:
    - `DATABASE_URL`
    - `JWT_ACCESS_SECRET` (minimal 32 karakter)
    - `JWT_REFRESH_SECRET` (minimal 32 karakter)
    - `POSTGRES_PASSWORD`

### Kontainer Backend Statusnya `unhealthy` atau Terus Restart di Docker
* **Gejala:** Kontainer backend gagal melewati uji kesehatan (*healthcheck*) dan kontainer frontend tidak dapat diakses (karena bergantung pada status sehat backend).
* **Solusi:**
  1. Periksa log backend untuk mendeteksi error inisialisasi:
     ```bash
     docker compose logs backend
     ```
  2. Masalah yang sering terjadi adalah kegagalan validasi startup di NestJS akibat secret kunci JWT kurang dari 32 karakter (lihat error di bawah).
  3. Pastikan database PostgreSQL di Docker sudah benar-benar siap menerima koneksi sebelum backend memulai proses startup (default db healthcheck dikonfigurasi 10 detik interval).

### Startup Crash Backend: `JWT_ACCESS_SECRET must be at least 32 characters long`
* **Gejala:** Log backend menunjukkan pesan kesalahan class-validator saat startup mengenai panjang secret key JWT yang kurang dari batas minimal.
* **Solusi:**
  - Demi keamanan tanda tangan kriptografis token JWT, panjang secret wajib minimal 32 karakter.
  - Hasilkan kunci acak yang kuat menggunakan terminal openSSL lalu salin ke `.env` Anda:
    ```bash
    openssl rand -base64 32
    ```

### Import Berkas Excel Aset Menghasilkan Error `400 Bad Request` / `File type validation failed`
* **Gejala:** Saat admin mengunggah file template Excel untuk di-import, API mengembalikan error validasi file meskipun file tampak benar di sisi frontend.
* **Solusi:**
  - Mulai v1.2, backend secara ketat memvalidasi tipe file MIME di server. Pastikan file yang diunggah memiliki format ekstensi Excel yang sah (`.xlsx` atau `.xls`).
  - Beberapa kompresi file zip atau modifikasi manual bisa merubah MIME type berkas tersebut. Unduh ulang berkas template resmi dari halaman dashboard, isi kembali datanya, dan unggah ulang tanpa merubah ekstensinya.

