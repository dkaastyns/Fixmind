# FixMind — Dokumentasi Strategi Seeding Data

Untuk mempermudah proses pengembangan lokal dan pengujian aplikasi, FixMind menyediakan mekanisme seeding data awal untuk mengisi database dengan data pengguna (*users*), fasilitas/ruangan (*rooms*), aset (*assets*), dan laporan sampel (*reports*).

---

## Cara Kerja Script Seed

Proses seeding dikelola oleh script [seed.ts](file:///d:/FixMind/backend/scripts/seed.ts) di dalam direktori `backend/scripts/`.

Ketika script dijalankan, sistem akan melakukan langkah-langkah berikut secara berurutan:

1. **Pembersihan Data Lama (Truncate):**
   Script akan mengosongkan tabel `reports`, `assets`, dan `rooms` secara menyeluruh dengan kueri cascading (`TRUNCATE TABLE reports, assets, rooms CASCADE;`).
   
   > [!WARNING]
   > Menjalankan seed akan menghapus semua data transaksi laporan, aset, dan ruangan yang ada di database lokal Anda. Jangan jalankan perintah ini di lingkungan produksi!

2. **Seeding Akun Pengguna (Users):**
   Menambahkan dua akun default jika belum terdaftar (berdasarkan email):
   - **Admin:** `admin@fixmind.local` (Password: `Admin123!@#`)
   - **User Biasa:** `user@fixmind.local` (Password: `User123!@#`)
   Password dienkripsi menggunakan *bcrypt* dengan tingkat keamanan 12 rounds.

3. **Seeding Ruangan (Rooms):**
   Mendaftarkan beberapa ruangan contoh seperti Lobby Utama, Ruangan Paripurna, Ruangan Humas, Ruangan Serbaguna, dll.

4. **Seeding Aset (Assets):**
   Mendaftarkan aset inventaris contoh dan langsung menghubungkannya ke ID ruangan yang sesuai. Beberapa contoh aset:
   - Sistem Audio Paripurna (TOA ZA-2240)
   - AC Sentral 5PK (Daikin 5PK)
   - Dispenser Air Panas/Dingin (Miyako WDP-300)
   
5. **Seeding Laporan Masalah (Reports) & Riwayat Laporan (Report Histories):**
   Membuat laporan simulasi kerusakan (misal: AC Paripurna tidak dingin, pintu kaca lobby macet) lengkap dengan riwayat status awal laporan (`CREATED`, `AI_ANALYZED`) untuk mempermudah visualisasi fitur pelacakan (*timeline*).

---

## Cara Menjalankan Seeding

Pastikan variabel lingkungan `DATABASE_URL` sudah terkonfigurasi dengan benar di file `.env` di dalam folder `backend/` dan migrasi database sudah selesai dijalankan (`bun run migrate`).

Jalankan perintah berikut dari terminal:

```powershell
cd backend
bun run seed
```

### Output Log yang Diharapkan:
```text
skip user admin@fixmind.local
skip user user@fixmind.local
seeded room RSG-1
seeded room KEU-2
...
seeded asset AUD-PRP-1
seeded asset AC-PRP-1
...
seeded sample reports

Seed complete. Login credentials:
  ADMIN admin@fixmind.local / Admin123!@#
  USER user@fixmind.local / User123!@#
```

---

## Menambahkan Data Seed Baru

Jika Anda ingin menambahkan data tiruan baru untuk tujuan pengujian:

1. Buka file [seed.ts](file:///d:/FixMind/backend/scripts/seed.ts).
2. Temukan konstanta data yang sesuai:
   - Untuk pengguna baru: Tambahkan objek ke array `USERS`.
   - Untuk ruangan baru: Tambahkan objek ke array `rooms` di dalam fungsi `seedFacilities()`.
   - Untuk aset baru: Tambahkan objek ke array `assets` di dalam fungsi `seedFacilities()`. Pastikan `roomIdx` merujuk pada indeks array ruangan yang benar.
   - Untuk laporan baru: Tambahkan logika insert di fungsi `seedReports()`.
3. Simpan file, lalu jalankan kembali `bun run seed`.
