# E-Lapor DPRD (FixMind)

E-Lapor DPRD (dengan nama kode FixMind) adalah sebuah sistem manajemen pelaporan dan pemeliharaan fasilitas modern berbasis _Artificial Intelligence_ (AI) yang dirancang khusus untuk mengelola, melacak, dan menyelesaikan berbagai kerusakan atau kendala fasilitas di lingkungan gedung dewan maupun perkantoran.

Sistem ini membantu mempermudah pelaporan, di mana AI (menggunakan Gemini 2.5 Flash) secara otomatis menganalisis masalah, menentukan prioritas, memberikan estimasi waktu, serta menyajikan rekomendasi perbaikan untuk dipantau oleh admin dan pengguna.

## Fitur Utama
- **Pelaporan Pintar dengan AI:** Identifikasi prioritas, kategori masalah, dan estimasi pengerjaan otomatis.
- **Jadwal Pemeliharaan Rutin:** Manajemen penjadwalan pemeliharaan fasilitas dan aset secara berkala (Mingguan, Bulanan, dll) dengan manajemen pihak ketiga (vendor).
- **Pengajuan Pemindahan Aset:** User dapat mengajukan perpindahan aset antar ruangan, lalu admin meninjau dan menyetujuinya sebelum lokasi aset otomatis diubah di database.
- **Pencarian Global Terpadu:** Cari semua informasi dengan cepat dan akurat melintasi Aset, Laporan Masalah, Transfer, dan Jadwal Pemeliharaan dalam satu kolom pencarian pintar.
- **Dukungan Aplikasi Mobile (PWA):** Frontend telah mendukung standar Progressive Web App (PWA). Aplikasi dapat langsung di-install pada smartphone Android maupun iOS langsung dari peramban web (tanpa perlu APK terpisah).
- **Linimasa (Timeline) Pelaporan:** Lacak status tiket dari mulai dibuat, ditugaskan, hingga selesai dikerjakan.
- **Ekspor Data & Laporan (Analytics):** Analisis kinerja pelaporan fasilitas dalam bentuk metrik visual dan ekspor (CSV, Excel, PDF) dengan rentang waktu.
- **Notifikasi Real-time:** Memberikan pembaruan instan (*WebSockets*) kepada admin maupun pelapor jika status laporan berubah.
- **Import Aset dari Excel:** Admin dapat mengimpor data aset inventaris Pemda secara massal dari file `.xlsx`/`.xls` langsung ke database.

---

## Fitur Baru: Jadwal Pemeliharaan (Maintenance Schedule)

Fitur untuk menjadwalkan perbaikan rutin fasilitas dan aset dengan manajemen vendor pihak ketiga.
- Fitur pencatatan lengkap: Nama vendor, kontak person, nomor HP vendor, serta estimasi biaya perbaikan.
- Pengaturan siklus: Sekali saja (One-time), Mingguan, Bulanan, Triwulan, hingga Tahunan.
- Pelacakan status jadwal yang komprehensif: Terjadwal, Dikerjakan, Selesai, Batal, atau Terlambat (Overdue).

## Fitur Pengajuan Pemindahan Aset

Fitur ini memperluas alur aplikasi dari sekadar pengaduan masalah menjadi juga pengelolaan perpindahan aset antar ruangan.

### Alur Penggunaan
1. **User** membuka menu **Pengajuan Transfer** di dashboard.
2. User memilih **ruangan asal**, **aset**, **ruangan tujuan**, lalu menuliskan **alasan pemindahan**.
3. Pengajuan tersimpan dengan status **PENDING**.
4. **Admin** membuka menu **Approval Transfer** di dashboard.
5. Admin meninjau detail pengajuan lalu memilih **Setuju** atau **Tolak**.
6. Jika **disetujui**, sistem otomatis mengubah `room_id` aset ke ruangan tujuan di database.

### Endpoint API Aset & Pemeliharaan

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET` | `/assets/transfers` | Daftar pengajuan transfer |
| `PATCH` | `/assets/transfers/:id` | Review transfer oleh admin (`APPROVED` / `REJECTED`) |
| `GET` | `/maintenance` | Daftar agenda pemeliharaan |
| `POST` | `/maintenance` | Buat jadwal pemeliharaan baru |
| `PATCH` | `/maintenance/:id/status` | Ubah status pengerjaan pemeliharaan |

---

## Fitur Import Aset (Excel)

Fitur ini memungkinkan admin mengimpor data aset inventaris dari **file Excel (.xlsx/.xls)** ke dalam database secara massal.

### Cara Penggunaan
1. **Buka halaman** `Fasilitas & Ruangan` di dashboard admin.
2. Klik tombol **Template** di pojok kanan atas untuk mengunduh template Excel.
3. Isi data aset di file template sesuai kolom yang tersedia.
4. Klik tombol **Import Excel** dan unggah file tersebut.

### Format Kolom Excel (Wajib)
| idpemda | kode_barang | nomor_register | nama_barang | merk_type |
|---------|-------------|----------------|-------------|-----------|

---

## Tech Stack (Tumpukan Teknologi)

Proyek ini menggunakan arsitektur _Clean Architecture_ dan dipisahkan menjadi dua bagian utama (Frontend & Backend), tanpa menggunakan ORM berat untuk menjaga performa optimal.

| Komponen | Teknologi yang Digunakan |
|----------|---------------------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, TanStack Query, Zustand, Framer Motion, **Vite PWA** |
| **Backend** | NestJS 11, JWT (Otentikasi), WebSockets (Socket.io), class-validator |
| **Database** | PostgreSQL + Ekstensi `pgvector` (untuk Semantic Search / RAG AI) |
| **Kueri DB** | _Raw SQL_ melalui `postgres.js` (performa dan kontrol penuh) |
| **Kecerdasan Buatan (AI)** | Gemini 2.5 Flash (Google Generative AI) & Groq AI (Llama 3.1) |
| **Runtime & Package Manager** | [Bun](https://bun.sh/) 1.3+ |

---

## Panduan Menjalankan Proyek (Quick Start)

### Persyaratan Sistem
- [Bun](https://bun.sh/) **1.3+** - digunakan sebagai runtime **dan** package manager (pengganti Node.js/npm).
- PostgreSQL 16+ dengan ekstensi **pgvector** sudah terpasang.
- Buat sebuah database kosong di PostgreSQL bernama `fixmind`.

> **Penting:** Proyek ini menggunakan **Bun**, bukan `npm` atau `yarn`. Install Bun: `powershell -c "irm bun.sh/install.ps1 | iex"`

### 1. Konfigurasi Environment & Instalasi
**Backend:**
```powershell
cd backend
copy .env.example .env
# Edit .env dan sesuaikan DATABASE_URL dan GEMINI_API_KEY
bun install
bun run migrate
bun run seed
```

**Frontend:**
```powershell
cd frontend
copy .env.example .env
bun install
```

### 2. Menjalankan Server Pengembangan

**Terminal 1 (Backend):**
```powershell
cd backend
bun run start:dev
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
bun run dev
```

- **Akses Aplikasi (Frontend):** `http://localhost:5173`
- **Akses API (Backend):** `http://localhost:3000/api/v1`

---

## PWA & Dukungan Mobile (Instalasi Aplikasi Tanpa APK)

Aplikasi ini sudah diprogram agar dikenali sebagai _Progressive Web App_ (PWA) yang native-like.

1. Buka URL aplikasi ini di _browser_ Handphone Anda (disarankan Google Chrome untuk Android, atau Safari untuk iOS).
2. Akan muncul prompt **"Add to Home Screen"** atau **"Install App"**.
3. Jika tidak muncul, tekan tombol opsi (titik tiga) di Chrome dan pilih "Tambahkan ke Layar Utama".
4. Aplikasi akan terpasang di HP layaknya aplikasi _native_ lengkap dengan _icon_ dan kemampuan berjalan secara penuh.

---

## Dokumentasi Tambahan

Detail mengenai arsitektur dan kebutuhan sistem lainnya dapat dibaca pada folder `docs/`:

| File | Deskripsi |
|------|-----------|
| [docs/PRD.md](docs/PRD.md) | Kebutuhan Produk (Product Requirements) |
| [docs/DATABASE.md](docs/DATABASE.md) | ERD, Skema, dan Indeks Database |
| [docs/API.md](docs/API.md) | Referensi Endpoints API |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Fase-fase Pengembangan Proyek |
