# ASETKITA Semarang — Product Requirements Document (PRD)

Dokumen Persyaratan Produk (*Product Requirements Document*) ini mendefinisikan latar belakang, masalah, tujuan, peran pengguna, dan fitur utama aplikasi **E-Lapor DPRD (ASETKITA Semarang)**.

---

## 1. Gambaran Umum (Overview)

**ASETKITA Semarang** adalah sistem manajemen pelaporan dan pemeliharaan sarana prasarana gedung berbasis *Artificial Intelligence* (AI) dan *Progressive Web App* (PWA) yang dirancang khusus untuk Sekretariat DPRD Kota Semarang.

AI berfungsi sebagai **Sistem Pendukung Keputusan (Decision Support System)** — administrator tetap memegang kendali penuh atas keputusan penugasan teknisi dan penentuan prioritas final.

---

## 2. Pernyataan Masalah (Problem Statement)

Pelaporan kerusakan fasilitas gedung sebelumnya sering kali tidak terstruktur, terhambat, dan sulit diprioritaskan. Administrator membutuhkan **Single Source of Truth** untuk mengelola data ruangan, aset inventaris Pemda, status perbaikan, dan metrik kinerja pemeliharaan dalam satu platform terpadu.

---

## 3. Tujuan Produk & Metrik Keberhasilan (Goals & Metrics)

| Tujuan Utama | Metrik Keberhasilan |
|--------------|---------------------|
| **Sentralisasi Laporan** | 100% laporan kerusakan fasilitas dibuat & dilacak di dalam sistem |
| **Respon Cepat** | Median waktu penugasan teknisi (*time-to-assign*) < 24 jam |
| **Transparansi Sistem** | Pengguna dapat memantau linimasa status tiket dari awal hingga selesai |
| **Dukungan Prioritas** | AI menyajikan skor prioritas terstruktur & rekomendasi teknis otomatis |
| **Kemudahan Maintenance** | Arsitektur modular NestJS + kueri Raw SQL yang performan & bersih |

---

## 4. Peran Pengguna (User Roles)

### 1. User (Pegawai Sekretariat / Pengguna)
- Membuat tiket laporan kerusakan, mengunggah foto kerusakan, memantau status di linimasa, serta mengajukan permohonan pemindahan aset antar ruangan.

### 2. Administrator (Admin)
- Kelola akun pengguna, kelola ruangan & aset inventaris, impor data aset massal dari Excel, tinjau pengajuan transfer aset, buat agenda pemeliharaan rutin vendor, dan ekspor laporan (Excel/PDF).

---

## 5. Fitur Utama & Fase Rilis (Core Features)

| Versi | Fitur yang Dirilis |
|-------|--------------------|
| **Foundation** | Autentikasi JWT, skema database, dasbor shell, & modul AI skeleton |
| **MVP** | CRUD Laporan, CRUD Ruangan & Aset, & penugasan teknisi |
| **v1.0** | Analisis AI prioritas otomatis saat laporan dibuat, lampiran foto Cloudinary, & ekspor dokumen |
| **v1.1** | Dasbor Analitik & Instant Global Search Modal |
| **v1.2** | Agenda Pemeliharaan Rutin Vendor, Persetujuan Transfer Aset, & Bulk Import Excel |

---

## 6. Pembatasan Fitur (Non-Goals)

- Tidak membuat aplikasi native mobile terpisah (Cukup menggunakan standar PWA).
- Tidak membuat microservice Python/FastAPI terpisah untuk AI pada tahap awal (Cukup internal NestJS `AiModule`).
- Tidak menggunakan database vektor eksternal berbayar (Cukup menggunakan ekstensi native `pgvector` di PostgreSQL).

---

## 7. Aturan & Batasan Teknis (Technical Constraints)

- **Runtime:** Bun 1.3+
- **Backend:** NestJS 11 dengan *Clean Architecture* per modul
- **Database:** PostgreSQL 16 `asetkita-semarang` dengan kueri Raw SQL via `postgres.js`
- **Tanpa ORM:** Dilarang keras menggunakan Prisma, TypeORM, atau ORM berat lainnya
- **AI Engine:** Google Gemini 2.5 Flash API via REST
