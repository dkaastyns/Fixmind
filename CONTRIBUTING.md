# Panduan Kontribusi FixMind (Contributing Guidelines)

Terima kasih telah berkontribusi pada pengembangan E-Lapor DPRD (FixMind)! Dokumen ini menjelaskan standar kode, alur kerja Git, strategi branching, dan konvensi commit yang wajib diikuti oleh semua developer.

---

## 1. Strategi Pencabangan Git (Git Branching Strategy)

Kami menggunakan model cabang berbasis fitur (*feature-branch workflow*) yang berpusat pada branch `main`. Seluruh pengerjaan fitur baru atau perbaikan wajib didelegasikan ke cabang terpisah sebelum digabungkan kembali ke `main`.

### Format Penamaan Branch
Nama cabang (*branch name*) wajib menggunakan format: `<kategori>/<deskripsi-singkat>` dengan menggunakan huruf kecil dan tanda hubung (`-`) sebagai pemisah.

| Kategori | Penggunaan | Contoh Nama Branch |
|----------|------------|-------------------|
| `feature/` | Implementasi fitur atau fungsionalitas baru | `feature/pencarian-global` |
| `fix/` | Perbaikan bug, celah keamanan, atau galat program | `fix/refresh-token-lockout` |
| `docs/` | Perubahan atau penambahan pada berkas dokumentasi | `docs/api-examples` |
| `refactor/` | Restrukturisasi kode tanpa mengubah fungsionalitas | `refactor/query-optimization` |
| `test/` | Penambahan atau perbaikan unit test / E2E test | `test/auth-controller` |
| `chore/` | Pemeliharaan proyek (package update, ci/cd config) | `chore/update-react-router` |

### Alur Kerja Kerja Harian
1. Sinkronkan branch `main` lokal Anda dengan remote:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Buat branch baru dari `main`:
   ```bash
   git checkout -b feature/nama-fitur-anda
   ```
3. Lakukan pengerjaan kode secara terfokus.
4. Lakukan commit berkala dengan mengikuti panduan pesan commit di bawah ini.

---

## 2. Konvensi Pesan Commit (Conventional Commits)

FixMind menggunakan standar **Conventional Commits** untuk memudahkan pembuatan riwayat perubahan (*changelog*) otomatis dan menjaga kerapian repositori Git.

### Format Struktur Commit
```text
<type>(<scope>): <deskripsi singkat dalam bahasa indonesia/inggris>

[opsional: deskripsi detail multi-baris jika diperlukan]
```

### Jenis-jenis `<type>` yang Diperbolehkan:
- **`feat`**: Menambahkan fitur baru ke dalam aplikasi (misal: `feat(api): tambah endpoint audit log`).
- **`fix`**: Memperbaiki bug atau celah keamanan (misal: `fix(auth): validasi kekuatan kata sandi register`).
- **`docs`**: Menulis atau memperbarui dokumentasi (misal: `docs: perbarui panduan instalasi docker`).
- **`style`**: Perubahan kosmetik, formatting, CSS, atau UI yang tidak mengubah logika program (misal: `style(ui): tambah pendaran logo login`).
- **`refactor`**: Perubahan kode yang tidak memperbaiki bug atau menambah fitur (misal: `refactor(database): optimasi kueri select assets`).
- **`test`**: Menambah atau memperbarui kode pengujian (misal: `test(backend): tambah unit test registrasi`).
- **`chore`**: Pemeliharaan alat pengembangan, dependensi, atau konfigurasi (opsional tanpa scope) (misal: `chore: update helmet ke v8`).

### Contoh Pesan Commit yang Benar:
```text
feat(auth): tambahkan batas rate limiting pada endpoint refresh token

Mencegah serangan brute force pada endpoint refresh token dengan membatasi
maksimal 10 request per menit per alamat IP klien.
```

---

## 3. Alur Penggabungan Kode (Pull Request Workflow)

Untuk menjaga stabilitas branch `main`, semua penggabungan kode wajib melalui proses *Pull Request* (PR) di GitHub:

1. **Jalankan Verifikasi Lokal Sebelum Push:**
   Sebelum mengirim cabang Anda ke GitHub, pastikan kode lulus audit lokal:
   ```bash
   # Di folder backend & frontend
   bun run lint   # pastikan tidak ada error linter
   bun run build  # pastikan kode sukses terkompilasi
   ```
2. **Push Branch ke GitHub:**
   ```bash
   git push origin feature/nama-fitur-anda
   ```
3. **Buka Pull Request (PR):**
   - Buka repositori FixMind di GitHub dan klik **Compare & pull request**.
   - Berikan judul PR yang deskriptif (menggunakan Conventional Commits format).
   - Tulis deskripsi singkat tentang apa saja perubahan yang Anda lakukan, bagaimana cara mengujinya, dan lampirkan screenshot jika ada perubahan visual UI.
4. **Proses Review:**
   - Rekan tim akan memeriksa kualitas kode Anda.
   - Jika ada komentar atau saran perbaikan, lakukan commit tambahan pada branch yang sama dan push ulang. PR akan otomatis ter-update.
5. **Merge ke `main`:**
   Setelah disetujui (Approved) dan build CI/CD dinyatakan sukses, PR dapat digabungkan (*merged*) menggunakan opsi **Squash and merge** agar riwayat commit di `main` tetap bersih.

---

## 4. Keamanan & Kredensial (Secrets Warning)
> [!CAUTION]
> **JANGAN PERNAH MENG-COMMIT KREDENSIAL:**
> Dilarang keras menaruh kunci rahasia (*API key*, password, *private token*) secara tertulis (*hardcoded*) dalam kode sumber. Gunakan file `.env` lokal untuk mengonfigurasi rahasia tersebut.
>
> Proyek ini menyediakan pre-commit hook otomatis untuk memindai kredensial sebelum commit dibuat. Aktifkan dengan perintah:
> ```bash
> git config core.hooksPath .githooks
> ```
