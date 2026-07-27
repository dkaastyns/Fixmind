# FixMind — Development Roadmap & Feature Status

Dokumen ini mencatat status penyelesaian fitur dan fase pengembangan sistem **E-Lapor DPRD (FixMind)**.

---

## Status Fase Pengembangan Current: **COMPLETED & SHIPPED (V1.0)** 🎉

### Phase 0 — Inisialisasi & Pondasi Dasar ✅
- [x] Inisialisasi scaffold proyek (NestJS 11 + React 19 / Vite / Bun)
- [x] Perancangan skema database relasional & berkas migrasi SQL (`0001` – `0014`)
- [x] Integrasi `postgres.js` tanpa ORM berat untuk performa optimal
- [x] Modul Autentikasi (JWT Access Token + HTTP-Only Cookie Refresh Token Rotation)
- [x] Proteksi keamanan akun (Lockout 15 menit setelah 5x gagal login berturut-turut)
- [x] Integrasi `LlmProviderService` (Google Gemini 2.5 Flash & Groq Llama 3.1)
- [x] Desain sistem UI Dark Glassmorphism, komponen UI, & tata letak aplikasi
- [x] Konfigurasi Docker Compose & Nginx Reverse Proxy
- [x] Dokumentasi teknis terpadu di folder `docs/`

### Phase 1 — Inti Aplikasi & Manajemen Fasilitas ✅
- [x] Eksekusi migrasi database & penyemaian (*seeding*) akun penguji
- [x] Modul Manajemen Pengguna (CRUD Admin & Pengunci Akun)
- [x] Modul Fasilitas & Ruangan (CRUD Ruangan & Aset Inventaris)
- [x] Bulk Import Aset dari file Excel (`.xlsx`/`.xls`) beserta template bawaan
- [x] Modul Pelaporan Kerusakan (Pembuatan tiket, filter status, pencarian)
- [x] Pemicu Analisis AI Asinkron saat laporan dibuat (Priority Score, Estimasi Jam, Saran Solusi)
- [x] Linimasa (*Timeline*) & Histori Audit append-only pada setiap perubahan status tiket

### Phase 2 — Alur Kerja Alokasi & Pengajuan Aset ✅
- [x] Alur penugasan teknisi internal/eksternal oleh Admin
- [x] Modul Pengajuan Pemindahan Aset (Transfer Request) antar ruangan oleh User
- [x] Modul Persetujuan Transfer (Transfer Approval) oleh Admin (auto-update `room_id` aset saat disetujui)
- [x] Pengunggahan bukti foto kerusakan & foto perbaikan ke Cloudinary
- [x] Kolom diskusi & komentar laporan secara real-time

### Phase 3 — Jadwal Pemeliharaan & Notifikasi Real-time ✅
- [x] Modul Jadwal Pemeliharaan Rutin (Maintenance Schedule) fasilitas & aset
- [x] Pengelolaan vendor eksternal, nama kontak person, HP vendor, & estimasi/realisasi biaya
- [x] Siklus pemeliharaan berkala (Sekali Saja, Mingguan, Bulanan, Triwulan, Tahunan)
- [x] Pemancaran Notifikasi Real-time WebSockets (Socket.io) saat laporan & transfer diperbarui
- [x] Fitur Instant Global Search melintasi Aset, Laporan, Transfer, & Pemeliharaan

### Phase 4 — Analitik, PWA & Mode Offline ✅
- [x] Dasbor Analitik Admin (Statistik Laporan, Performa Teknisi, & Distribusi Ruangan)
- [x] Fitur Ekspor Data Laporan & Maintenance ke format **Excel** dan **PDF**
- [x] Konfigurasi Progressive Web App (PWA) & Service Worker (Instalasi Aplikasi Tanpa APK)
- [x] Provider Offline Sync untuk penyimpanan sementara saat jaringan terputus
- [x] Halaman Kebijakan Privasi (*Privacy Policy*) & Ketentuan Layanan (*Terms of Service*) berarsitektur Dark Glassmorphism
- [x] Layar Pemuatan (*Full Page Loading Screen*) terang bermerek JDIH Kota Semarang & Emas
- [x] Animasi Opening Intro Screen sinematik pertama kali buka web (`Cepat.` ➔ `Presisi.` ➔ `Cerdas.` ➔ `FixMind.`)

### Phase 5 — Pengerasan Produksi & Pemeliharaan ✅
- [x] Verifikasi tipe strict TypeScript (`npx tsc --noEmit` 0 Error)
- [x] Pengetatan header HTTP Security via Helmet & Rate Limiting Throttler
- [x] Penataan ulang dokumentasi lengkap & mutakhir di seluruh repositori

---

## 🔮 Rencana Pengembangan Masa Depan (Future Enhancements V2.0)

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| **RAG AI Chatbot Assistant** | Asisten AI berbasis pencarian vektor (`pgvector`) untuk menjawab pertanyaan inventaris & regulasi DPRD secara langsung | Medium |
| **Integrasi Whatsapp Gateway** | Pengiriman notifikasi langsung via WA ke nomor ponsel teknisi / vendor eksternal saat ditugaskan | Medium |
| **Multi-building Expansion** | Pengelompokan fasilitas ke dalam struktur multi-gedung / lokasi cabang terpisah | Low |
