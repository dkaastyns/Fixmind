# FixMind — Dokumentasi Sistem Migrasi Database

Aplikasi FixMind menggunakan sistem migrasi database berbasis raw-SQL kustom yang sederhana dan performan. Sistem ini tidak menggunakan ORM (seperti Prisma atau TypeORM) demi menjaga performa optimal dan memberikan kontrol penuh atas query database.

---

## Cara Kerja Sistem Migrasi

Sistem migrasi diatur oleh script [migrate.ts](file:///d:/FixMind/backend/scripts/migrate.ts) di dalam direktori `backend/scripts/`.

1. **Direktori Migrasi:** Semua file migrasi disimpan dalam format `.sql` di folder [backend/migrations/](file:///d:/FixMind/backend/migrations).
2. **Tracking Migrasi:** Sistem membuat tabel pelacak bernama `schema_migrations` di database untuk menyimpan daftar file migrasi yang telah sukses dijalankan.
3. **Penerapan Sekuensial:** File migrasi dibaca dari direktori, diurutkan secara alfabetis/numerik (berdasarkan prefix angka seperti `0001`, `0002`), dan dijalankan satu per satu di dalam transaksi database (`BEGIN ... COMMIT`).
4. **Idempotensi:** Jika sebuah file migrasi sudah tercatat di tabel `schema_migrations`, migrasi tersebut akan dilewati (*skipped*).

---

## Cara Menjalankan Migrasi

Untuk menjalankan migrasi ke database Anda, pastikan variabel lingkungan `DATABASE_URL` sudah terkonfigurasi dengan benar di file `.env` di dalam folder `backend/`.

Jalankan perintah berikut dari terminal:

```powershell
cd backend
bun run migrate
```

### Output Log yang Diharapkan:
- Jika ada migrasi baru:
  ```text
  skip  0001_init_extensions.sql
  skip  0002_create_users_and_sessions.sql
  apply 0013_create_new_table.sql
  Migrations complete.
  ```
- Jika database sudah up-to-date:
  ```text
  skip  0001_init_extensions.sql
  ...
  skip  0012_create_maintenance_schedules.sql
  Migrations complete.
  ```

---

## Cara Membuat Migrasi Baru

Ikuti langkah-langkah berikut jika Anda perlu mengubah skema database (menambah tabel, kolom, indeks, dll):

1. **Tentukan Urutan File:**
   Lihat file terakhir di folder [backend/migrations/](file:///d:/FixMind/backend/migrations). Cari prefix angka terakhirnya (misalnya `0012_create_maintenance_schedules.sql`).
   
2. **Buat File SQL Baru:**
   Buat file baru dengan nomor urut berikutnya. Gunakan format nama `XXXX_deskripsi_singkat.sql`.
   Contoh: `0013_add_status_to_users.sql`

3. **Tulis Query DDL/DML:**
   Tulis kueri SQL murni untuk migrasi tersebut.
   *Contoh isi file `0013_add_status_to_users.sql`:*
   ```sql
   ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'ACTIVE';
   ```

4. **Uji Migrasi:**
   Jalankan `bun run migrate` di folder `backend/` untuk menerapkan perubahan pada database lokal Anda.

---

## Skema Tabel Pelacak `schema_migrations`

Sistem migrasi secara otomatis membuat tabel berikut untuk melacak riwayat migrasi:

| Kolom | Tipe Data | Deskripsi |
|-------|-----------|-----------|
| `id` | `SERIAL PRIMARY KEY` | ID unik sekuensial |
| `filename` | `VARCHAR(255) UNIQUE` | Nama file migrasi (e.g. `0001_init_extensions.sql`) |
| `applied_at` | `TIMESTAMPTZ DEFAULT now()` | Waktu saat migrasi diterapkan |

---

## Pemecahan Masalah (Troubleshooting)

### 1. Migrasi Gagal Ditengah Jalan
Setiap file migrasi dijalankan di dalam sebuah transaksi (`sql.begin`). Jika terjadi error sintaks atau kegagalan relasi di dalam file SQL:
- Transaksi untuk file tersebut akan otomatis di-**rollback**.
- Proses migrasi akan langsung terhenti.
- Perbaiki kesalahan sintaks pada file `.sql` Anda, pastikan database dalam keadaan konsisten, lalu jalankan kembali `bun run migrate`.

### 2. Inkonsistensi Riwayat Migrasi
Jika Anda secara manual menghapus tabel di database tanpa menghapus baris terkait di tabel `schema_migrations`, sistem migrasi akan menganggap migrasi tersebut sudah terpasang.
- Untuk memperbaikinya secara manual, Anda bisa menghapus baris migrasi tertentu dari tabel pelacak:
  ```sql
  DELETE FROM schema_migrations WHERE filename = '0013_add_status_to_users.sql';
  ```
- Atau jika berada di fase pengembangan lokal, Anda dapat membersihkan database lalu menjalankan ulang dari awal menggunakan script seed.
