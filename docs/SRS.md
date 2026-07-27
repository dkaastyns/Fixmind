# FixMind — Software Requirements Specification (SRS)

Spesifikasi Kebutuhan Perangkat Lunak (*Software Requirements Specification*) ini mendokumentasikan kebutuhan fungsional dan non-fungsional dari aplikasi **E-Lapor DPRD (FixMind)**.

---

## 1. Kebutuhan Fungsional (Functional Requirements)

### Autentikasi & Keamanan (FR-AUTH)
| Kode ID | Persyaratan Fungsional |
|---------|------------------------|
| `FR-AUTH-01` | Sistem wajib mengotentikasi pengguna menggunakan kredensial email dan password |
| `FR-AUTH-02` | Sistem wajib menerbitkan JWT access token (15m) + refresh token rotation (httpOnly cookie) |
| `FR-AUTH-03` | Sistem wajib menerapkan kontrol akses berbasis peran (RBAC): `ADMIN`, `TECHNICIAN`, `USER` |
| `FR-AUTH-04` | Sistem wajib mendukung pencabutan sesi (*session revocation*) saat pengguna melakukan logout |
| `FR-AUTH-05` | Sistem wajib mengunci akun pengguna selama 15 menit jika 5x berturut-turut gagal login |

### Pelaporan Kerusakan & Fasilitas (FR-REPORTS)
| Kode ID | Persyaratan Fungsional |
|---------|------------------------|
| `FR-REP-01` | `USER` dapat membuat laporan kerusakan dengan judul, deskripsi, ruangan, & aset opsional |
| `FR-REP-02` | `USER` & `TECHNICIAN` dapat mengunggah foto bukti kerusakan & foto perbaikan ke Cloudinary |
| `FR-REP-03` | `USER` dapat memantau status tiket laporan & linimasa pengerjaan secara real-time |
| `FR-REP-04` | `ADMIN` dapat menugaskan teknisi internal atau eksternal untuk menangani laporan |
| `FR-REP-05` | `ADMIN` & `TECHNICIAN` dapat memperbarui status pengerjaan laporan (`IN_PROGRESS`, `DONE`) |
| `FR-REP-06` | `ADMIN` dapat mengunduh data laporan ke dalam format berkas Excel dan PDF |

### Analisis Kecerdasan Buatan (FR-AI)
| Kode ID | Persyaratan Fungsional |
|---------|------------------------|
| `FR-AI-01` | Sistem wajib menganalisis laporan secara asinkron untuk mengkalkulasi skor & prioritas (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) |
| `FR-AI-02` | Sistem wajib menghasilkan rekomendasi langkah penanganan teknis & estimasi durasi jam pengerjaan |
| `FR-AI-03` | Respon analisis AI harus berformat JSON terstruktur |
| `FR-AI-04` | Kegagalan pada layanan AI tidak boleh menggagalkan proses penyimpanan laporan pengguna |

### Administrasi & Fasilitas (FR-ADMIN)
| Kode ID | Persyaratan Fungsional |
|---------|------------------------|
| `FR-ADM-01` | `ADMIN` dapat mengelola (CRUD) akun pengguna, teknisi, dan status aktif akun |
| `FR-ADM-02` | `ADMIN` dapat mengelola (CRUD) data ruangan & aset inventaris Pemda |
| `FR-ADM-03` | `ADMIN` dapat mengimpor data aset inventaris massal dari file Excel (`.xlsx`/`.xls`) |
| `FR-ADM-04` | `ADMIN` dapat meninjau (*Approve* / *Reject*) permohonan pemindahan aset antar ruangan |
| `FR-ADM-05` | `ADMIN` dapat mengelola agenda pemeliharaan rutin (*Maintenance Schedule*) & informasi vendor |

---

## 2. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Persyaratan Non-Fungsional |
|----------|----------------------------|
| **Keamanan (Security)** | Encrypted passwords (`bcrypt`), JWT rotation, Helmet security headers, Rate Limiting, & Account Lockout |
| **Performa (Performance)** | Indeks database pada `status`, `reporter_id`, `created_at`, & pencarian kata kunci |
| **Ketersediaan (Availability)** | Pemisahan alur AI; fungsi inti CRUD tetap beroperasi penuh meskipun API LLM mengalami kendala |
| **Pemeliharaan (Maintainability)** | Pola Repositori, pemisahan batas modul NestJS, & tipe data `postgres.js` murni |
| **UX & Responsivitas** | *Mobile-first*, dukungan PWA, *glassmorphism*, indikator prapemuatan, & notifikasi toast |

---

## 3. Kontrak Respon API (API Envelope Contract)

Semua respon API mengembalikan format JSON standar:

```json
{ 
  "success": true, 
  "message": "Pesan deskripsi respon", 
  "data": {}, 
  "meta": {} 
}
```

Prefix Endpoint: `/api/v1`

---

## 4. Retensi & Integritas Data

- Penghapusan data pengguna, ruangan, aset, dan laporan menggunakan metode *Soft Delete* (`deleted_at IS NULL`).
- Catatan `report_histories` bersifat *append-only audit log* yang tidak dapat diubah kembali.
- Sesi login dicabut melalui kolom `revoked_at` tanpa menghapus rekam jejak audit keamanan.
