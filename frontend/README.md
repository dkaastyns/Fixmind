# FixMind — Frontend Web Client (React + Vite)

Aplikasi klien web untuk E-Lapor DPRD (FixMind) dibangun menggunakan React 19, TypeScript, Tailwind CSS v4, dan terkonfigurasi penuh sebagai **Progressive Web App (PWA)** untuk pengalaman mobile yang native.

## Fitur Utama Frontend
- **PWA & Offline Capability:** Dapat di-install pada Android/iOS langsung dari peramban. Mendukung penyimpanan cache aset untuk memuat aplikasi secara instan.
- **In-Memory Token Storage:** Untuk mencegah serangan pencurian token (XSS token stealing), Access Token disimpan di dalam memori runtime (Zustand store), bukan di `localStorage`.
- **Automatic Token Refresh Interceptor:** Client HTTP (`api-client.ts`) akan mendeteksi response `401 Unauthorized`, otomatis melakukan request refresh token di belakang layar menggunakan HttpOnly cookie, lalu mengulang kembali request asli pengguna tanpa interupsi.
- **Offline Request Queue:** Saat koneksi terputus, request mutasi data (seperti membuat laporan atau memindahkan aset) akan otomatis dimasukkan ke antrean lokal (`localStorage`). Setelah internet terhubung kembali, aplikasi otomatis menyinkronkan antrean tersebut ke server backend.
- **Transisi Halaman Halus:** Didukung oleh Framer Motion untuk transisi visual yang elegan.
- **Visualisasi Grafik Interaktif:** Dashboard pelacakan metrik menggunakan Recharts.

---

## Struktur Folder Utama
```
frontend/
├── public/                 # Icon PWA, manifest file, dan gambar statis
├── src/
│   ├── app/                # Konfigurasi Router Guard, Router, dan Auth Bootstrap
│   ├── components/         # Komponen UI global & layout dashboard
│   ├── features/           # Pembagian modul fitur halaman
│   │   ├── auth/           # Login, Signup, & proteksi sesi
│   │   ├── dashboard/      # Ringkasan dasbor
│   │   ├── landing/        # Halaman Landing, Kebijakan, dan Ketentuan
│   │   ├── reports/        # List laporan, detail laporan, & pelaporan
│   │   └── rooms/          # Manajemen ruangan dan import aset
│   ├── hooks/              # Custom React hooks global
│   ├── lib/                # api-client (wrapper fetch HTTP)
│   ├── stores/             # Zustand state management (auth-store, dll)
│   └── index.css           # Global stylesheet & Tailwind CSS v4 directives
```

---

## Panduan Instalasi & Development Lokal

### Persyaratan Utama
- [Bun](https://bun.sh/) 1.3+ (direkomendasikan) atau Node.js 20+

### Langkah Awal Setup
1. **Instal dependensi:**
   ```bash
   bun install
   ```
2. **Setup File `.env`:**
   Salin `.env.example` ke `.env`. Biasanya default URL API backend mengarah ke:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```
3. **Jalankan Aplikasi:**
   ```bash
   bun run dev
   ```
   Aplikasi dapat diakses di `http://localhost:5173`.

### Perintah Pengerjaan
```bash
# Melakukan build produksi (menghasilkan folder /dist)
bun run build

# Menjalankan preview lokal hasil build produksi
bun run preview

# Menjalankan test unit
bun run test
```

---

## Panduan Pengembangan & Integrasi API Klien

Jika Anda menambahkan fitur baru yang memanggil API, harap ikuti standar berikut:

1. **Gunakan `apiClient`:**
   Jangan menggunakan `fetch` mentah atau `axios` manual. Gunakan wrapper `apiClient` dari `@/lib/api-client`:
   ```typescript
   import { apiClient } from '@/lib/api-client';

   // Response akan di-parse otomatis dan tipe data didukung penuh
   const reports = await apiClient.get<ReportResponse>('/reports');
   ```

2. **Dukung Mode Offline:**
   Gunakan properti `offlineSafe` pada apiClient jika request tersebut berupa mutasi data yang harus tetap bisa diajukan saat tidak ada koneksi internet:
   ```typescript
   await apiClient.post('/reports', data, { offlineSafe: true });
   ```
   Ini akan memasukkan transaksi ke queue offline secara aman jika jaringan mati.

3. **Gunakan Proteksi Rute Sesuai Role:**
   Setiap halaman baru di `router.tsx` yang membutuhkan autentikasi harus dibungkus dengan `<ProtectedRoute>` dan jika hanya boleh diakses admin gunakan guard `<AdminRoute>` sebagai parent rutenya.
