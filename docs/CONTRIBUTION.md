# FixMind — Panduan Kontribusi (Contribution Guidelines)

Terima kasih atas minat Anda untuk berkontribusi pada pengembangan FixMind! Dokumen ini memandu Anda mengenai proses kontribusi, standar kode, dan gaya penulisan Git commit yang digunakan dalam proyek ini.

---

## 1. Alur Kontribusi (Workflow)

Kami menggunakan alur kerja berbasis git branch yang sederhana:

1. **Sinkronkan Repositori:**
   Pastikan branch `main` lokal Anda selalu dalam keadaan terbaru dengan repositori pusat (origin):
   ```powershell
   git checkout main
   git pull origin main
   ```

2. **Buat Cabang Fitur (Feature Branch):**
   Buat branch baru dari `main` dengan penamaan yang relevan:
   - Fitur baru: `feature/nama-fitur`
   - Perbaikan bug: `fix/nama-bug`
   - Dokumentasi: `docs/nama-dokumen`
   - Pembersihan kode: `refactor/nama-modul`
   
   Contoh:
   ```powershell
   git checkout -b feature/pencarian-global
   ```

3. **Lakukan Perubahan Kode:**
   Tulis kode Anda sesuai dengan standar desain dan arsitektur yang telah ditentukan.

4. **Jalankan Pengujian & Linter:**
   Pastikan kode Anda lolos dari verifikasi linter dan unit testing:
   ```powershell
   # Di folder backend atau frontend
   bun run lint
   bun run test
   ```

5. **Commit Perubahan:**
   Commit perubahan Anda dengan pesan yang jelas menggunakan standar *Semantic Commits* (lihat bagian di bawah).

6. **Push dan Buka Pull Request (PR):**
   Kirim branch Anda ke GitHub:
   ```powershell
   git push origin feature/pencarian-global
   ```
   Buka halaman repositori di GitHub dan buat Pull Request baru ke branch `main`.

---

## 2. Standar Penulisan Pesan Commit (Semantic Commits)

Format pesan commit mengikuti struktur berikut:
```text
<type>(<scope>): <deskripsi singkat dalam bahasa indonesia/inggris>
```

### Jenis-jenis `<type>` yang Diterima:
- **`feat`:** Implementasi fitur baru (misal: `feat(api): tambah endpoint transfer aset`).
- **`fix`:** Perbaikan bug atau kesalahan program (misal: `fix(auth): perbaiki token expiry verification`).
- **`docs`:** Perubahan pada dokumentasi saja (misal: `docs: perbarui panduan kontribusi`).
- **`style`:** Perbaikan format penulisan kode, penambahan komentar, atau perubahan CSS/UI tanpa mengubah logika aplikasi.
- **`refactor`:** Restrukturisasi kode tanpa menambah fitur baru atau memperbaiki bug (misal: `refactor(db): bersihkan query yang redundan`).
- **`test`:** Menambahkan atau memperbaiki rangkaian pengujian (misal: `test(reports): tambahkan unit test repo`).
- **`chore`:** Pekerjaan pemeliharaan rutin seperti update dependencies, konfigurasi bundler, dll (misal: `chore: update react-router-dom ke v7`).

---

## 3. Gaya Penulisan & Standar Kode

### TypeScript & Javascript
- **Linter & Formatter:** Gunakan konfigurasi Prettier dan ESLint yang telah disediakan. Pastikan editor Anda (seperti VS Code) mengaktifkan opsi *Format on Save*.
- **Tipe Data:** Hindari penggunaan tipe data `any`. Tulis deklarasi tipe atau interface secara eksplisit untuk menjaga integritas data TypeScript.
- **Async/Await:** Gunakan sintaksis modern `async/await` alih-alih promise chaining (`.then()`).

### Arsitektur Backend (NestJS)
- **Separasi Tugas (Separation of Concerns):**
  - **Controllers:** Hanya menangani request HTTP, validasi payload (menggunakan DTO dan class-validator), dan mengirimkan HTTP response.
  - **Services:** Berisi logika bisnis inti aplikasi.
  - **Repositories:** Berisi kueri database murni (`postgres.js`). Jangan meletakkan logika bisnis di dalam repository.
- **SQL Queries:** Selalu gunakan kueri SQL berparameter melalui tagged template literals (`sql\`...\``) untuk menghindari celah keamanan SQL Injection. Jangan pernah menggabungkan string query secara manual.

### Arsitektur Frontend (React & Tailwind)
- **Komponen Fungsional:** Gunakan functional components dengan React Hooks.
- **State Management:** Simpan state global di Zustand store, dan state server di TanStack Query (React Query).
- **Responsive Layout:** Terapkan prinsip Mobile-First dengan menggunakan prefix breakpoint Tailwind (`md:`, `lg:`) untuk layar yang lebih besar.
