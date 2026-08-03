# 📖 Panduan Pengguna — ASETKITA Semarang

> **E-Lapor DPRD (ASETKITA Semarang)**  
> Sistem Manajemen Pelaporan & Pemeliharaan Fasilitas Berbasis AI & PWA  
> Sekretariat DPRD Kota Semarang

---

## Daftar Isi

- [Pendahuluan](#pendahuluan)
- [Memulai Aplikasi](#memulai-aplikasi)
- [🧑 Panduan USER (Pegawai)](#panduan-user-pegawai)
  - [Dasbor Pengguna](#dasbor-pengguna)
  - [Fitur 1: Pelaporan Kerusakan](#fitur-1-pelaporan-kerusakan)
  - [Fitur 2: Detail Laporan & Linimasa](#fitur-2-detail-laporan--linimasa)
  - [Fitur 3: Komentar & Diskusi](#fitur-3-komentar--diskusi)
  - [Fitur 4: Pengajuan Pemindahan Aset](#fitur-4-pengajuan-pemindahan-aset)
  - [Fitur 5: Ruangan & Inventaris Aset](#fitur-5-ruangan--inventaris-aset)
  - [Fitur 6: Pencarian Global](#fitur-6-pencarian-global)
  - [Fitur 7: Profil & Pengaturan Akun](#fitur-7-profil--pengaturan-akun)
  - [Fitur 8: Notifikasi Real-time](#fitur-8-notifikasi-real-time)
- [🛡️ Panduan ADMINISTRATOR (Admin)](#panduan-administrator-admin)
  - [Dasbor Admin](#dasbor-admin)
  - [Fitur A1: Manajemen Laporan](#fitur-a1-manajemen-laporan)
  - [Fitur A2: Manajemen Pengguna](#fitur-a2-manajemen-pengguna)
  - [Fitur A3: Manajemen Ruangan & Aset](#fitur-a3-manajemen-ruangan--aset)
  - [Fitur A4: Jadwal Pemeliharaan Rutin](#fitur-a4-jadwal-pemeliharaan-rutin)
  - [Fitur A5: Persetujuan Transfer Aset](#fitur-a5-persetujuan-transfer-aset)
  - [Fitur A6: Analitik & Ekspor Laporan](#fitur-a6-analitik--ekspor-laporan)
- [🤖 Fitur Kecerdasan Buatan (AI)](#fitur-kecerdasan-buatan-ai)
- [📊 Referensi Status & Kode](#referensi-status--kode)
- [❓ FAQ & Pemecahan Masalah Umum](#faq--pemecahan-masalah-umum)

---

## Pendahuluan

**ASETKITA Semarang** adalah platform digital terpadu untuk mempermudah pengaduan kerusakan fasilitas, pengelolaan inventaris aset, dan penjadwalan pemeliharaan gedung di Sekretariat DPRD Kota Semarang.

Sistem ini mengintegrasikan **Kecerdasan Buatan (Google Gemini 2.5 Flash)** untuk menganalisis prioritas laporan secara otomatis, dan menggunakan teknologi **Progressive Web App (PWA)** agar dapat diakses dari perangkat apa pun tanpa menginstal aplikasi terpisah.

### Dua Peran Pengguna

| Peran | Deskripsi | Akses |
|-------|-----------|-------|
| **USER** (Pegawai) | Staf Sekretariat yang melaporkan kerusakan dan mengajukan transfer aset | Laporan, Transfer Aset, Ruangan (lihat), Profil |
| **ADMIN** (Administrator) | Administrator sistem yang mengelola keseluruhan platform | Semua fitur termasuk Manajemen User, Analitik, Persetujuan Transfer |

---

## Memulai Aplikasi

### Cara Login

1. Buka peramban web dan akses URL aplikasi.
2. Klik tombol **"Masuk ke Sistem"** di halaman Landing Page.
3. Isi **Email** dan **Kata Sandi** akun Anda.
4. Klik **"Masuk"** atau tekan `Enter`.
5. Anda diarahkan ke **Dasbor** sesuai peran.

> **Kredensial Bawaan (untuk pengujian):**
>
> | Peran | Email | Kata Sandi |
> |-------|-------|------------|
> | Admin | `admin@asetkita-semarang.local` | `Admin123!@#` |
> | User | `user@asetkita-semarang.local` | `User123!@#` |

### Keamanan Akun & Lockout

- Gagal login **5 kali berturut-turut** → akun **terkunci selama 15 menit**
- Setelah 15 menit akun terbuka otomatis
- Untuk membuka lebih awal, hubungi Administrator

> Pastikan **Caps Lock** tidak aktif saat mengetik kata sandi.

### Cara Logout

1. Klik nama pengguna / avatar di **kiri bawah** sidebar.
2. Pilih **"Keluar"** / **"Logout"**.
3. Sesi dicabut dan Anda kembali ke halaman login.

### Instalasi PWA (Opsional)

**Android (Chrome):** Ketuk ⋮ (tiga titik) → "Tambahkan ke Layar Beranda"

**iOS (Safari):** Ketuk ↑ (bagikan) → "Tambahkan ke Layar Beranda"

**Desktop (Chrome/Edge):** Klik ikon install di address bar → "Install"

---

## Panduan USER (Pegawai)

---

### Dasbor Pengguna

Setelah login sebagai USER, Anda melihat **Dasbor Pengguna** dengan:

#### Banner Selamat Datang
- Nama Anda, tanggal hari ini
- **Search Bar (Pencarian Global)** — klik atau tekan `Ctrl+K`

#### Kartu Statistik

| Kartu | Keterangan |
|-------|------------|
| Laporan Saya | Total laporan yang pernah Anda buat |
| Menunggu | Laporan status `PENDING` |
| Sedang Dikerjakan | Laporan status `IN_PROGRESS` |
| Selesai | Laporan status `COMPLETED` |

#### Laporan Terbaru Saya
- 3 laporan terbaru dengan status
- Klik untuk lihat detail
- Tombol **"Lihat Semua Laporan"**

#### Pengajuan Transfer Terbaru
- 3 transfer aset terbaru
- Badge merah = jumlah yang masih `PENDING`

---

### Fitur 1: Pelaporan Kerusakan

#### Cara Membuat Laporan Baru

1. Klik menu **"Laporan Kerusakan"** di sidebar
2. Klik tombol **"+ Buat Laporan"**
3. Isi formulir:

| Field | Keterangan | Wajib? |
|-------|------------|--------|
| Judul Laporan | Ringkasan singkat (contoh: "AC Bocor di Ruang Rapat Lt. 2") | Ya |
| Deskripsi | Penjelasan detail kerusakan | Ya |
| Ruangan | Pilih ruangan dari dropdown | Ya |
| Aset Terkait | Pilih aset spesifik | Opsional |
| Foto Kerusakan | Unggah foto bukti (JPG/PNG) | Opsional |

4. Klik **"Kirim Laporan"**
5. Status awal laporan: **`PENDING`**
6. AI otomatis menganalisis laporan Anda di latar belakang

#### Melihat & Memfilter Daftar Laporan

**Filter Status (Tab di atas tabel):**

| Tab | Status | Keterangan |
|-----|--------|------------|
| Semua | — | Semua laporan Anda |
| Menunggu | `PENDING` | Belum ditindaklanjuti |
| Ditinjau | `REVIEWED` | Admin sedang memeriksa |
| Sedang Dikerjakan | `IN_PROGRESS` | Teknisi sedang memperbaiki |
| Selesai | `COMPLETED` | Perbaikan selesai |
| Dibatalkan | `CANCELLED` | Laporan dibatalkan |
| Ditolak | `REJECTED` | Laporan tidak diproses |

**Filter Lanjutan** (klik ikon Filter):
- Berdasarkan **Ruangan** tertentu
- Berdasarkan **Rentang Tanggal**

**Pencarian:** Ketik di kolom search untuk mencari berdasarkan judul.

**Pagination:** 10 laporan per halaman, navigasi dengan tombol ⟨ ⟩.

---

### Fitur 2: Detail Laporan & Linimasa

Klik judul laporan untuk membuka halaman Detail Laporan.

#### Panel Kiri — Informasi Utama
- Judul & deskripsi lengkap
- Ruangan & aset terkait
- Tanggal pembuatan
- **Galeri Foto** — klik untuk mode lightbox (layar penuh)

#### Panel Kanan — Metadata
- Status saat ini (badge berwarna)
- Prioritas AI (CRITICAL/HIGH/MEDIUM/LOW)
- Nama Pelapor
- Teknisi/Vendor yang ditugaskan

#### Panel Analisis AI

Setelah AI selesai, muncul panel "Analisis AI" berisi:

| Info | Keterangan |
|------|------------|
| Prioritas | Level urgensitas (CRITICAL/HIGH/MEDIUM/LOW) |
| Estimasi Waktu | Perkiraan durasi perbaikan dalam jam |
| Rekomendasi Teknis | Saran langkah penanganan dari AI |

> Jika analisis masih berlangsung, halaman **auto-refresh tiap 3 detik** hingga hasil tersedia.

#### Linimasa (Timeline)

Riwayat kronologis semua perubahan laporan:

| Icon | Kejadian |
|------|----------|
| Bel | Laporan baru dibuat |
| Mata | Laporan ditinjau admin |
| Roda gigi | Pengerjaan dimulai, teknisi ditugaskan |
| Centang | Laporan diselesaikan |
| Silang | Laporan dibatalkan / ditolak |
| Robot | Hasil analisis AI tersedia |

---

### Fitur 3: Komentar & Diskusi

#### Cara Menambah Komentar
1. Scroll ke bagian **"Diskusi"** di halaman detail laporan
2. Klik kolom input "Tulis komentar..."
3. Ketik pesan Anda
4. Klik tombol Kirim atau tekan `Ctrl+Enter`

#### Cara Membalas Komentar
1. Klik tombol **"Balas"** di bawah komentar
2. Tulis balasan di input yang muncul
3. Klik Kirim

> Semua komentar tersimpan permanen sebagai rekam jejak audit laporan.

---

### Fitur 4: Pengajuan Pemindahan Aset

#### Cara Mengajukan Transfer Aset

1. Klik menu **"Transfer Aset"** di sidebar
2. Isi formulir pengajuan:

| Field | Keterangan |
|-------|------------|
| Ruang Asal | Ruangan tempat aset saat ini |
| Aset yang Dipindahkan | Pilih aset dari ruang yang dipilih |
| Ruang Tujuan | Ruangan tujuan (ruang asal tidak tersedia) |
| Alasan Pemindahan | Jelaskan alasan (minimal 10 karakter) |

3. Periksa rangkuman detail di panel samping
4. Klik **"Ajukan Transfer"**
5. Konfirmasi di modal yang muncul

> Pengajuan masuk dengan status `PENDING` dan menunggu persetujuan Admin.

#### Melihat Riwayat Pengajuan

Di bagian bawah halaman, tabel **"Riwayat Pengajuan Saya"** menampilkan semua pengajuan:

| Status | Warna | Keterangan |
|--------|-------|------------|
| `PENDING` | Oranye | Menunggu tinjauan Admin |
| `APPROVED` | Hijau | Disetujui, aset dipindahkan |
| `REJECTED` | Merah | Ditolak oleh Admin |

Filter: gunakan tab `Semua` / `Menunggu` / `Disetujui` / `Ditolak`.

---

### Fitur 5: Ruangan & Inventaris Aset

#### Melihat Daftar Ruangan
1. Klik menu **"Ruangan & Aset"** di sidebar
2. Panel kiri = daftar semua ruangan aktif
3. Gunakan kolom pencarian untuk cari ruangan
4. Klik ruangan untuk lihat asetnya

#### Melihat Aset dalam Ruangan

Panel kanan menampilkan daftar aset:

| Kolom | Keterangan |
|-------|------------|
| Nama Aset | Nama / kode inventaris aset |
| Kategori | Jenis aset (AC, Proyektor, Meja, dll.) |
| Kondisi | Status kondisi aset |

> Sebagai USER, Anda hanya bisa **melihat** data. Untuk CRUD data diperlukan akses ADMIN.

---

### Fitur 6: Pencarian Global

Fitur pencarian terpadu yang menemukan data dari seluruh modul dalam satu kolom.

#### Cara Menggunakan
1. Klik **Search Bar** di banner dasbor, ATAU tekan `Ctrl+K` (Windows) / `Cmd+K` (Mac)
2. Modal pencarian muncul dari mana pun dalam aplikasi
3. Ketik kata kunci

Hasil muncul secara instan, dikelompokkan per kategori:

| Kategori | Contoh Hasil |
|----------|-------------|
| Ruangan | "Ruang Rapat Lantai 2" |
| Aset | "AC Daikin 2 PK — R. Rapat" |
| Laporan | "AC Bocor — PENDING" |
| Transfer Aset | "Kursi Kayu → R. Sekretariat" |
| Jadwal Pemeliharaan | "Service AC Bulanan — 15 Agt" |

4. Klik hasil untuk navigasi langsung ke halaman terkait.

---

### Fitur 7: Profil & Pengaturan Akun

#### Mengakses Halaman Profil
Klik nama pengguna atau avatar di sidebar → pilih **"Profil Saya"**

#### Informasi yang Dapat Diubah

| Field | Keterangan |
|-------|------------|
| Nama Lengkap | Nama tampilan di sistem |
| Email | Alamat email untuk login |
| Kata Sandi | Ubah kata sandi akun |
| Foto Profil | Unggah foto avatar (opsional) |

#### Cara Mengubah Kata Sandi
1. Temukan bagian "Ubah Kata Sandi"
2. Masukkan **Kata Sandi Lama**
3. Masukkan **Kata Sandi Baru** (min. 8 karakter)
4. Ulangi di kolom **Konfirmasi**
5. Klik **"Simpan Perubahan"**

---

### Fitur 8: Notifikasi Real-time

Sistem menggunakan **WebSocket (Socket.io)** untuk notifikasi instan tanpa refresh.

#### Cara Melihat Notifikasi
Klik ikon **Lonceng** di pojok kanan atas untuk membuka panel notifikasi.

#### Jenis Notifikasi untuk USER

| Notifikasi | Pemicu |
|------------|--------|
| AI selesai menganalisis | Laporan Anda selesai dianalisis |
| Transfer disetujui | Admin menyetujui pengajuan Anda |
| Transfer ditolak | Admin menolak pengajuan Anda |
| Status laporan diperbarui | Admin mengubah status laporan Anda |

---

## Panduan ADMINISTRATOR (Admin)

---

### Dasbor Admin

Ringkasan eksekutif seluruh sistem secara real-time.

#### Kartu Statistik Utama

| Kartu | Keterangan |
|-------|------------|
| Total Laporan Aktif | Semua laporan yang belum selesai di seluruh sistem |
| Rata-rata Rating | Rating kepuasan pengguna atas penyelesaian laporan |
| Estimasi Total Jam | Akumulasi estimasi jam pengerjaan dari analisis AI |
| Transfer Menunggu | Pengajuan transfer yang belum diproses |

#### Grafik & Visualisasi

**Bar Chart — Laporan per Bulan:**
Tren jumlah laporan 6 bulan terakhir. Membantu analisis apakah beban pemeliharaan meningkat atau menurun.

**Pie Chart — Distribusi Prioritas AI:**
Proporsi laporan berdasarkan level prioritas. Identifikasi apakah banyak masalah kritis belum tertangani.

**Pie Chart — Status Transfer Aset:**
Proporsi transfer PENDING, APPROVED, dan REJECTED.

#### Tabel Transfer Aset Terbaru
5 pengajuan transfer terbaru dengan tombol **Setujui / Tolak** langsung dari dasbor.

#### Tabel Jadwal Pemeliharaan Mendatang
5 agenda pemeliharaan terdekat berdasarkan tanggal.

#### Tombol Export Data (Global)
Klik **"Export Data"** untuk mengunduh laporan dalam format Excel/PDF.

---

### Fitur A1: Manajemen Laporan

Admin memiliki kontrol penuh atas semua laporan dari seluruh pegawai.

#### Perbedaan USER vs ADMIN

| Kemampuan | USER | ADMIN |
|-----------|------|-------|
| Lihat laporan sendiri | Ya | Ya |
| Lihat laporan semua pengguna | Tidak | Ya |
| Buat laporan baru | Ya | Ya |
| Ubah status laporan | Tidak | Ya |
| Tugaskan teknisi / vendor | Tidak | Ya |
| Unggah foto bukti perbaikan | Tidak | Ya |

#### Mengubah Status Laporan

1. Buka **Detail Laporan**
2. Klik dropdown **Status** di panel kanan
3. Pilih status:

| Status | Keterangan |
|--------|------------|
| `PENDING` | Belum ditindaklanjuti |
| `REVIEWED` | Admin sedang meninjau |
| `IN_PROGRESS` | Pengerjaan telah dimulai |
| `COMPLETED` | Perbaikan selesai |
| `CANCELLED` | Laporan dibatalkan |
| `REJECTED` | Laporan ditolak |

4. Isi catatan perubahan jika perlu
5. Klik **"Simpan Status"**

#### Menugaskan Teknisi / Vendor
1. Temukan bagian "Penugasan Teknisi" di detail laporan
2. Masukkan nama teknisi atau vendor
3. Klik **"Simpan"**

#### Mengunggah Foto Bukti Perbaikan
1. Klik **"Unggah Foto Perbaikan"**
2. Pilih file gambar dari perangkat
3. Foto diunggah ke Cloudinary dan tampil di galeri laporan

---

### Fitur A2: Manajemen Pengguna

Kontrol penuh atas semua akun pengguna sistem.

#### Mengakses
Klik menu **"Pengguna"** di sidebar.

#### Tabel Pengguna

| Kolom | Keterangan |
|-------|------------|
| Nama Lengkap | Nama lengkap pegawai |
| Email | Alamat email untuk login |
| Peran | `ADMIN` atau `USER` |
| Status | Aktif atau Non-aktif |
| Tanggal Dibuat | Kapan akun dibuat |

Filter: tab `Semua` / `Admin` / `User`.

#### Membuat Akun Pengguna Baru

1. Klik **"+ Tambah Pengguna"**
2. Isi formulir:

| Field | Keterangan | Wajib? |
|-------|------------|--------|
| Nama Lengkap | Nama lengkap pegawai | Ya |
| Email | Alamat email unik | Ya |
| Kata Sandi | Kata sandi awal (min. 8 karakter) | Ya |
| Peran | `USER` atau `ADMIN` | Ya |

3. Klik **"Simpan"**
4. Berikan email dan kata sandi kepada pegawai

#### Menonaktifkan / Mengaktifkan Akun
1. Klik **toggle switch** di baris pengguna
2. Konfirmasi di modal yang muncul

> Pengguna nonaktif **tidak dapat login** sampai diaktifkan kembali.

#### Mereset Kata Sandi Pengguna

1. Klik ikon **Kunci (Reset Sandi)** di baris pengguna
2. Masukkan **kata sandi baru**
3. Klik **"Reset"**
4. Sampaikan kata sandi baru kepada pengguna

#### Menghapus Akun Pengguna

> Penghapusan menggunakan *soft delete* — data tidak hilang dari database untuk audit.

1. Klik ikon **Hapus (Trash)** di baris pengguna
2. Ketik nama pengguna di modal konfirmasi
3. Klik **"Hapus"**

---

### Fitur A3: Manajemen Ruangan & Aset

Kontrol penuh atas data ruangan dan inventaris aset gedung.

#### Mengakses
Klik menu **"Ruangan & Aset"** di sidebar.

#### Struktur Halaman
- **Panel Kiri** — Daftar ruangan
- **Panel Kanan** — Daftar aset dari ruangan yang dipilih

#### Membuat Ruangan Baru
1. Klik **"+ Ruangan"** di panel kiri
2. Isi Nama Ruangan dan Lantai/Lokasi
3. Klik **"Simpan"**

#### Menghapus Ruangan
1. Centang ruangan yang ingin dihapus
2. Klik **"Hapus Terpilih"**
3. Konfirmasi di modal

> Ruangan yang masih memiliki aset aktif **tidak dapat dihapus**.

#### Menambah Aset ke Ruangan

1. Pilih ruangan di panel kiri
2. Klik **"+ Aset"** di panel kanan
3. Isi formulir:

| Field | Keterangan | Wajib? |
|-------|------------|--------|
| Nama Aset | Nama/label aset (contoh: "AC Daikin 2 PK") | Ya |
| Kode Inventaris | Nomor inventaris dari Pemda | Opsional |
| Kategori | Jenis aset | Opsional |
| Kondisi | Status kondisi aset | Opsional |

4. Klik **"Simpan Aset"**

#### Import Aset Massal dari Excel

1. Pilih ruangan tujuan di panel kiri
2. Klik tombol **"Import Excel"**
3. Klik **"Unduh Template"** — isi data di file template yang terunduh
4. Upload file Excel yang sudah diisi
5. Klik **"Import"**
6. Sistem menampilkan hasil import per baris

> Gunakan selalu template yang disediakan agar format kolom sesuai dengan database.

#### Export Data Ruangan & Aset
1. Klik **"Export"** di pojok kanan atas
2. Pilih format **Excel** atau **PDF**
3. File otomatis terunduh

#### Menghapus Aset
1. Centang aset yang ingin dihapus di panel kanan
2. Klik **"Hapus Terpilih"**
3. Konfirmasi di modal

---

### Fitur A4: Jadwal Pemeliharaan Rutin

Merencanakan dan mencatat agenda pemeliharaan preventif gedung dan aset.

#### Mengakses
Klik menu **"Jadwal Pemeliharaan"** di sidebar.

#### Tampilan Halaman
Agenda ditampilkan sebagai **kartu (card)** berisi:
- Judul agenda, ruangan/aset, frekuensi, tanggal terjadwal
- Badge status (berwarna)
- Vendor/penanggung jawab, estimasi biaya

#### Membuat Jadwal Baru

1. Klik **"+ Jadwal"**
2. Isi formulir:

| Field | Keterangan | Wajib? |
|-------|------------|--------|
| Judul | Nama agenda (contoh: "Service Rutin AC Gedung Utama") | Ya |
| Deskripsi | Detail pekerjaan | Opsional |
| Ruangan | Ruangan yang dipelihara | Ya |
| Aset | Aset spesifik yang dipelihara | Opsional |
| Frekuensi | Seberapa sering | Ya |
| Tanggal Terjadwal | Kapan dilaksanakan | Ya |
| Tipe Penanggung Jawab | Internal (staf) atau Vendor Eksternal | Ya |
| Nama Vendor / Staf | Nama perusahaan atau staf | Ya |
| Nama Kontak Person | Nama PIC vendor | Opsional |
| No. Telepon Vendor | Nomor yang dapat dihubungi | Opsional |
| Estimasi Biaya | Perkiraan biaya pemeliharaan (Rp) | Opsional |
| Catatan | Catatan tambahan | Opsional |

3. Klik **"Simpan Jadwal"**

**Pilihan Frekuensi:**

| Kode | Label | Keterangan |
|------|-------|------------|
| `WEEKLY` | Mingguan | Setiap minggu |
| `MONTHLY` | Bulanan | Setiap bulan |
| `QUARTERLY` | Triwulan | Setiap 3 bulan |
| `ANNUALLY` | Tahunan | Setiap tahun |
| `ONE_TIME` | Sekali Saja | Tidak berulang |

#### Mengubah Status Jadwal

| Tombol | Aksi | Status Baru |
|--------|------|------------|
| Mulai | Pengerjaan dimulai | `IN_PROGRESS` |
| Selesai | Pengerjaan selesai | `DONE` |
| Batal | Batalkan jadwal | `CANCELLED` |

> Jadwal melewati tanggal terjadwal tanpa perubahan status otomatis menjadi `OVERDUE`.

**Referensi Status:**

| Status | Label | Badge |
|--------|-------|-------|
| `SCHEDULED` | Terjadwal | Amber/Kuning |
| `IN_PROGRESS` | Dikerjakan | Biru |
| `DONE` | Selesai | Hijau |
| `CANCELLED` | Batal | Merah |
| `OVERDUE` | Terlambat | Merah Tua |

#### Mengedit Jadwal
1. Klik ikon Edit di kartu jadwal
2. Ubah field yang diperlukan
3. Klik **"Perbarui"**

#### Menghapus Jadwal
1. Klik ikon Hapus di kartu jadwal
2. Konfirmasi di modal

#### Export Jadwal Pemeliharaan
1. Klik **"Export"** di pojok kanan atas
2. Pilih format Excel atau PDF + rentang waktu
3. File otomatis terunduh

---

### Fitur A5: Persetujuan Transfer Aset

Meninjau dan memberikan keputusan atas pengajuan pemindahan aset dari pegawai.

#### Mengakses
Klik menu **"Transfer Aset"** → **"Tinjauan Pengajuan"** di sidebar.

#### Statistik Counter

| Counter | Keterangan |
|---------|------------|
| Menunggu | Pengajuan belum diproses |
| Disetujui | Pengajuan telah disetujui |
| Ditolak | Pengajuan yang ditolak |
| Total | Total semua pengajuan |

#### Informasi di Setiap Kartu Pengajuan

- Nama aset yang dipindahkan
- **Ruang Asal → Ruang Tujuan**
- Nama pegawai pelapor & tanggal pengajuan
- Alasan pemindahan dari pegawai
- Kolom **Catatan Admin** untuk diisi saat memberi keputusan

#### Menyetujui Pengajuan

1. Opsional: isi **Catatan Admin**
2. Klik tombol **"Setujui"**
3. Konfirmasi di modal

> Jika disetujui: `room_id` aset otomatis diperbarui ke ruangan tujuan. Notifikasi dikirim ke pegawai.

#### Menolak Pengajuan

1. **Wajib** isi **Catatan Admin** (alasan penolakan)
2. Klik tombol **"Tolak"**
3. Konfirmasi di modal

> Jika ditolak: aset tetap di ruangan asal. Notifikasi dikirim ke pegawai.

#### Pemindahan Langsung (Fitur Khusus Admin)

Admin dapat memindahkan aset tanpa proses pengajuan:
1. Menu Transfer Aset → isi Ruang Asal, Aset, Ruang Tujuan
2. Klik **"Pindahkan Langsung"** (tanpa kolom Alasan)
3. Aset langsung dipindahkan

---

### Fitur A6: Analitik & Ekspor Laporan

#### Halaman Analitik
Klik menu **"Analitik"** di sidebar.

**Kartu Statistik:**

| Metrik | Keterangan |
|--------|------------|
| Laporan Terbuka | Total laporan aktif belum selesai |
| Sedang Dikerjakan | Laporan dengan status `IN_PROGRESS` |
| Selesai (30 Hari) | Laporan diselesaikan dalam 30 hari terakhir |
| Rating Rata-rata | Rata-rata penilaian kepuasan pengguna |

**Visualisasi:**

1. **Distribusi Prioritas AI** — Bar chart jumlah laporan per level prioritas
2. **Ruangan dengan Laporan Terbanyak** — Bar chart horizontal, identifikasi area bermasalah

#### Export Data — Panduan Lengkap

**Titik akses export:**
- Tombol "Export Data" di **Dasbor Admin**
- Tombol "Export Excel/PDF" di **Halaman Analitik**
- Tombol "Export" di **Ruangan & Aset**
- Tombol "Export" di **Jadwal Pemeliharaan**

**Langkah export dari Dasbor/Analitik:**

1. Klik tombol **"Export Data"**
2. Pilih **Jenis Laporan:**

| Pilihan | Keterangan |
|---------|------------|
| Laporan Masalah | Data laporan kerusakan fasilitas |
| Transfer Aset | Data pengajuan pemindahan aset |
| Jadwal Pemeliharaan | Data agenda maintenance |

3. Pilih **Rentang Waktu:**

| Pilihan | Keterangan |
|---------|------------|
| Semua Waktu | Seluruh data historis |
| Pilih Tanggal | Tentukan tanggal mulai dan selesai |

4. Pilih **Format File:**

| Format | Keterangan |
|--------|------------|
| Excel (.xlsx) | Untuk analisis di spreadsheet |
| PDF | Dokumen siap cetak / lampiran surat |

5. Klik format yang dipilih — file otomatis terunduh.

---

## Fitur Kecerdasan Buatan (AI)

Sistem mengintegrasikan **Google Gemini 2.5 Flash** sebagai mesin analisis AI.

### Cara Kerja AI

Setiap laporan baru memicu **analisis AI secara otomatis** di latar belakang:

1. Membaca judul dan deskripsi laporan
2. Menganalisis kategori dan kondisi aset terkait
3. Mempertimbangkan konteks ruangan
4. Menghasilkan analisis terstruktur dalam format JSON

### Hasil Analisis AI

Tersedia di **Detail Laporan** pada panel "Analisis AI":

| Parameter | Keterangan | Contoh |
|-----------|------------|--------|
| Skor Prioritas | Nilai numerik urgensitas 0-100 | `85` |
| Level Prioritas | Kategori urgensitas | `HIGH` |
| Estimasi Jam | Perkiraan durasi perbaikan | `4 jam` |
| Rekomendasi Teknis | Saran langkah penanganan | "Periksa pipa kondensasi..." |

### Status Analisis AI

| Status | Keterangan |
|--------|------------|
| `PENDING` | Analisis dalam antrian |
| `PROCESSING` | AI sedang menganalisis (auto-refresh 3 detik) |
| `COMPLETED` | Analisis selesai, hasil tersedia |
| `FAILED` | Analisis gagal (laporan tetap tersimpan) |

### Level Prioritas AI

| Level | Label | Rekomendasi Waktu Respons |
|-------|-------|--------------------------|
| `CRITICAL` | Kritis | Segera ditangani < 24 jam |
| `HIGH` | Tinggi | Ditangani < 48 jam |
| `MEDIUM` | Sedang | Ditangani dalam seminggu |
| `LOW` | Rendah | Dapat dijadwalkan fleksibel |

### Poin Penting

> **AI sebagai Pendukung Keputusan, bukan Penentu.**
> Hasil analisis bersifat **rekomendasi**. Administrator tetap memegang kendali penuh atas keputusan akhir.

> **Failsafe:** Jika layanan AI gangguan, laporan tetap tersimpan dengan status AI `FAILED`. Operasi CRUD laporan berjalan normal.

---

## Referensi Status & Kode

### Status Laporan Kerusakan

| Status | Label | Badge | Keterangan |
|--------|-------|-------|------------|
| `PENDING` | Menunggu | Kuning | Laporan baru, belum ditinjau |
| `REVIEWED` | Ditinjau | Biru | Admin sedang memeriksa |
| `IN_PROGRESS` | Sedang Dikerjakan | Ungu/Indigo | Teknisi sedang memperbaiki |
| `COMPLETED` | Selesai | Hijau | Perbaikan berhasil |
| `CANCELLED` | Dibatalkan | Abu-abu | Laporan dibatalkan |
| `REJECTED` | Ditolak | Merah | Laporan tidak diproses |

### Level Prioritas AI

| Level | Label | Badge | Urgensitas |
|-------|-------|-------|------------|
| `CRITICAL` | Kritis | Merah Tua | Kerusakan parah, ancaman operasional |
| `HIGH` | Tinggi | Oranye | Kerusakan signifikan, penanganan cepat |
| `MEDIUM` | Sedang | Kuning | Kerusakan moderat, perlu penjadwalan |
| `LOW` | Rendah | Hijau | Kerusakan ringan, bisa ditunda |

### Status Transfer Aset

| Status | Label | Badge | Keterangan |
|--------|-------|-------|------------|
| `PENDING` | Menunggu | Oranye | Pengajuan belum ditinjau Admin |
| `APPROVED` | Disetujui | Hijau | Aset berhasil dipindahkan |
| `REJECTED` | Ditolak | Merah | Pengajuan tidak disetujui |

### Status Jadwal Pemeliharaan

| Status | Label | Badge | Keterangan |
|--------|-------|-------|------------|
| `SCHEDULED` | Terjadwal | Amber | Agenda terencana, belum dimulai |
| `IN_PROGRESS` | Dikerjakan | Biru | Sedang berlangsung |
| `DONE` | Selesai | Hijau | Berhasil diselesaikan |
| `CANCELLED` | Batal | Merah | Agenda dibatalkan |
| `OVERDUE` | Terlambat | Merah Tua | Melewati tanggal terjadwal |

---

## FAQ & Pemecahan Masalah Umum

**Q: Akun terkunci dan tidak bisa login?**

Tunggu **15 menit** hingga terbuka otomatis. Untuk membuka lebih cepat, hubungi Administrator yang dapat membuka kunci melalui panel Manajemen Pengguna.

---

**Q: Analisis AI laporan tidak muncul setelah lama?**

Normalnya 5-30 detik. Jika lebih dari 5 menit, layanan AI mungkin gangguan. Status tercatat `FAILED`. Laporan Anda tetap aman dan Admin dapat memproses secara manual.

---

**Q: Tombol "Buat Laporan" tidak ada?**

Pastikan Anda sudah login, akun dalam status **aktif**, dan berada di halaman "Laporan Kerusakan". Jika masih tidak ada, hubungi Administrator.

---

**Q: Import Excel aset gagal?**

Kemungkinan penyebab:
1. Tidak menggunakan template yang disediakan — unduh ulang template
2. Format kolom tidak sesuai (angka/teks)
3. Nama aset duplikat
4. File Excel rusak — simpan ulang dan coba lagi

---

**Q: Pengajuan transfer masih PENDING sudah beberapa hari?**

Pengajuan perlu persetujuan Admin secara manual. Jika lebih dari 2-3 hari kerja belum ada respons, hubungi Administrator secara langsung.

---

**Q: Notifikasi real-time tidak muncul?**

1. Pastikan koneksi internet stabil
2. Coba refresh halaman (F5)
3. Gunakan browser modern (Chrome/Firefox/Edge versi terbaru)
4. Periksa apakah ad-blocker memblokir koneksi WebSocket

---

**Q: Bagaimana cara export laporan bulanan?**

(Hanya Admin) Buka Dasbor → klik "Export Data" → pilih jenis laporan → pilih "Pilih Tanggal" → isi rentang bulan → pilih format Excel atau PDF.

---

**Q: Data yang dihapus bisa dipulihkan?**

Sistem menggunakan **Soft Delete** — data ditandai dihapus, bukan benar-benar hilang. Pemulihan hanya bisa dilakukan tim pengembang via akses database langsung. Hubungi tim IT jika diperlukan.

---

**Q: Bagaimana cara install aplikasi di HP?**

Lihat bagian **Instalasi PWA** di awal panduan. Mendukung Android (Chrome), iOS (Safari), dan Desktop (Chrome/Edge) tanpa melalui toko aplikasi.

---

*Dokumen ini terakhir diperbarui pada **Agustus 2026** oleh Tim Pengembang ASETKITA Semarang.*

*Untuk pertanyaan teknis lebih lanjut, lihat dokumentasi developer di folder `docs/` atau hubungi tim IT Sekretariat DPRD Kota Semarang.*
