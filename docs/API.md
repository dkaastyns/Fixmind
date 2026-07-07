# FixMind — API Documentation

Base URL: `http://localhost:3000/api/v1`

Semua endpoint yang membutuhkan autentikasi wajib menyertakan header:
```
Authorization: Bearer <accessToken>
```

## Response Format

### Success
```json
{
  "success": true,
  "message": "Login successful",
  "data": { }
}
```

### Error
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "email must be an email" }]
}
```

---

## Authentication

Refresh token disimpan di **httpOnly cookie** `fixmind_refresh` pada path `/api/v1/auth`.

Access token dikembalikan di JSON dan dikirim sebagai `Authorization: Bearer <token>`.

### POST /auth/login
**Public** | Login

**Body:**
```json
{ "email": "admin@fixmind.local", "password": "Admin123!@#" }
```

**Response data:**
```json
{
  "user": { "id": "...", "email": "...", "fullName": "...", "role": "ADMIN" },
  "accessToken": "eyJ...",
  "expiresIn": "15m"
}
```

### POST /auth/refresh
**Public** | Refresh access token (menggunakan cookie)

### POST /auth/logout
**Authenticated** | Cabut sesi, hapus cookie

### GET /auth/me
**Authenticated** | Profil pengguna yang sedang login

---

## Health

### GET /health
**Public** | Cek status server API

---

## Users

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/users` | ADMIN | Daftar semua pengguna |
| `GET` | `/users/technicians` | ADMIN | Daftar teknisi aktif |
| `POST` | `/users` | ADMIN | Buat pengguna baru |
| `PATCH` | `/users/:id` | ADMIN | Update data pengguna |
| `DELETE` | `/users/:id` | ADMIN | Hapus pengguna |

---

## Rooms (Ruangan)

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/rooms` | Authenticated | Daftar semua ruangan |
| `GET` | `/rooms/:id` | Authenticated | Detail ruangan |
| `POST` | `/rooms` | ADMIN | Tambah ruangan baru |
| `PATCH` | `/rooms/:id` | ADMIN | Update ruangan |
| `DELETE` | `/rooms/:id` | ADMIN | Hapus ruangan |

---

## Assets (Aset Inventaris)

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/assets` | Authenticated | Daftar aset (opsional: `?roomId=<uuid>`) |
| `GET` | `/assets/:id` | Authenticated | Detail aset |
| `POST` | `/assets` | ADMIN | Tambah aset manual |
| `PATCH` | `/assets/:id` | ADMIN | Update aset |
| `DELETE` | `/assets/:id` | ADMIN | Hapus aset (soft delete) |
| `GET` | `/assets/import/template` | ADMIN | Download template Excel untuk import |
| `POST` | `/assets/import?roomId=<uuid>` | ADMIN | Import aset dari file Excel |

### Body POST /assets
```json
{
  "roomId": "uuid-ruangan",
  "idpemda": "1.3.2.01.10.001",
  "kodeBarang": "KMP-001",
  "nomorRegister": "REG-2024-001",
  "namaBarang": "Kursi Pimpinan",
  "merkType": "Chitose / Type-A"
}
```

### Import Excel (POST /assets/import)
- **Content-Type:** `multipart/form-data`
- **Query param:** `roomId` (UUID ruangan tujuan) — **wajib**
- **Form field:** `file` — file `.xlsx` atau `.xls`

**Kolom Excel yang wajib ada di baris header:**

| Nama Kolom | Alias yang Diterima |
|------------|---------------------|
| `idpemda` | `id_pemda` |
| `kode_barang` | `kode_brg` |
| `nomor_register` | `no_register`, `no_reg` |
| `nama_barang` | `nama_brg` |
| `merk_type` | `merk_dan_type`, `merk_tipe`, `merk_dan_tipe`, `merk` |

**Response:**
```json
{
  "success": true,
  "message": "Assets imported",
  "data": {
    "imported": 10,
    "data": [ { "id": "...", "kodeBarang": "...", ... } ]
  }
}
```

> **Upsert:** Jika `kode_barang` sudah ada di database, baris tersebut akan **diperbarui** (bukan duplikat).

---

## Reports (Laporan)

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/reports` | Authenticated | Daftar laporan (filter: `status`, `roomId`, `dateFrom`, `dateTo`) |
| `GET` | `/reports/:id` | Authenticated | Detail laporan beserta riwayat & lampiran |
| `POST` | `/reports` | USER, ADMIN | Buat laporan baru |
| `PATCH` | `/reports/:id/status` | TECHNICIAN, ADMIN | Update status laporan |
| `POST` | `/reports/:id/assign` | ADMIN | Tugaskan teknisi |
| `POST` | `/reports/:id/attachments` | USER, TECHNICIAN | Upload foto (multipart) |
| `GET` | `/reports/:id/comments` | Authenticated | Ambil komentar laporan |
| `POST` | `/reports/:id/comments` | Authenticated | Tambah komentar |
| `GET` | `/reports/export/excel` | ADMIN | Export laporan ke Excel |
| `GET` | `/reports/export/pdf` | ADMIN | Export laporan ke PDF |

---

## Maintenance (Jadwal Pemeliharaan)

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/maintenance` | Authenticated | Daftar jadwal (filter: `status`, `technicianId`) |
| `POST` | `/maintenance` | ADMIN | Buat jadwal pemeliharaan |
| `PATCH` | `/maintenance/:id/status` | TECHNICIAN, ADMIN | Update status jadwal |
| `DELETE` | `/maintenance/:id` | ADMIN | Hapus jadwal |

---

## Analytics

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| `GET` | `/analytics/overview` | ADMIN | Ringkasan dashboard (laporan aktif, dll) |
| `GET` | `/analytics/summary` | ADMIN | Statistik lengkap dengan breakdown |
| `GET` | `/analytics/technician-stats` | ADMIN | Statistik performa teknisi |
| `GET` | `/analytics/export` | ADMIN | Export data analitik |

---

## AI

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| `POST` | `/ai/chat` | Authenticated | Chat dengan AI asisten |

**Body:**
```json
{ "prompt": "Bagaimana cara merawat AC agar tidak cepat rusak?" }
```

---

## HTTP Status Codes

| Code | Penggunaan |
|------|-----------|
| 200 | Sukses |
| 201 | Data berhasil dibuat |
| 400 | Validasi gagal / input tidak valid |
| 401 | Tidak terautentikasi |
| 403 | Tidak punya izin (RBAC) |
| 404 | Data tidak ditemukan |
| 409 | Konflik (mis. duplikat kode barang) |
| 429 | Terlalu banyak request (rate limit) |
| 500 | Kesalahan server |
