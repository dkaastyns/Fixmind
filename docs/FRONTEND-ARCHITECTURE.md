# ASETKITA Semarang — Frontend Architecture

Dokumen ini menjelaskan arsitektur teknis, teknologi pendukung, manajemen state, serta pola komponen pada frontend peramban **E-Lapor DPRD (ASETKITA Semarang)**.

---

## 🛠️ Tech Stack Frontend

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite` & utility `@layer`)
- **TanStack Query (React Query v5)** — Pengelolaan *server-state*, *caching*, & *optimistic updates*
- **Zustand** — Pengelolaan *client auth session* (`accessToken` & data `user` di memori)
- **React Router 7** — Sistem rute deklaratif dengan *router guards* terpisah
- **Framer Motion** — Animasi sinematik, *glassmorphism*, & *opening intro*
- **Vite PWA (Plugin)** — Dukungan *Progressive Web App*, *Service Worker caching*, & instalasi aplikasi seluler/desktop tanpa APK

---

## 📂 Peta Struktur Direktori Frontend

```text
frontend/src/
├── app/
│   ├── router.tsx          # Definisi Rute URL & Elemen Halaman
│   └── router-guards.tsx   # Guard Akses (ProtectedRoute, AdminRoute, GuestRoute, FullPageLoading)
├── components/
│   ├── layout/             # DashboardLayout, SidebarContent, Header Mobile
│   ├── providers/          # OfflineSyncProvider (Sinkronisasi PWA Offline)
│   └── ui/                 # Button, Input, GlassCard, FullPageLoading, GlobalSearchModal, FloatingActionButton
├── features/               # Modul Fitur Aplikasi
│   ├── analytics/pages/    # Halaman Dasbor Analitik & Metrik
│   ├── asset-transfers/    # Halaman Transfer Aset & Persetujuan Admin
│   ├── auth/pages/         # Halaman Login & Signup
│   ├── landing/pages/      # Landing Page, Opening Intro Screen, Terms & Privacy Policy
│   ├── maintenance/pages/  # Halaman Jadwal Pemeliharaan & Vendor Form
│   ├── profile/pages/      # Halaman Profil Saya & Keamanan Akun
│   ├── reports/pages/      # Halaman Laporan Masalah & Detail Tiket
│   ├── rooms/pages/        # Halaman Fasilitas Ruangan & Import Excel Aset
│   └── users/pages/        # Halaman Manajemen Akun Pengguna & Admin
├── lib/
│   ├── api-client.ts       # Centralized Fetch API Wrapper & Auto-Refresh Token
│   └── utils.ts            # Helper function cn() (clsx + tailwind-merge)
├── stores/
│   └── auth-store.ts       # Zustand auth store (AccessToken memory, User payload)
├── types/
│   └── api.ts              # TypeScript interfaces untuk API payload & DTO
└── index.css               # Design System Tokens, CSS Utilities, & Smooth Scrollbars
```

---

## 🧠 Pengelolaan State (State Management Architecture)

| Jenis State | Perkakas (Tool) | Catatan & Strategi Keamanan |
|-------------|-----------------|-----------------------------|
| **Server Data** | TanStack Query | Menangani pengambil data API, pembaruan otomatis, & pembersihan *cache* query |
| **Auth Session** | Zustand | Menyimpan `accessToken` dan objek `user` **hanya di memori RAM** (tidak pernah di `localStorage`) |
| **Refresh Token** | HttpOnly Cookie | Disimpan oleh browser dalam cookie aman `asetkita_semarang_refresh`, kebal dari serangan XSS |
| **PWA Offline State** | OfflineSyncProvider | Menyimpan antrean transaksi lokal saat offline & menyinkronkan saat koneksi pulih |
| **Form State** | Native Controlled State | Validasi real-time pada formulir modal & input |

---

## 🎨 Design System & Estetika Visual

Aplikasi ini mengusung estetika **Dark Glassmorphism** yang mewah & futuristik:

- **Warna Utama**: Deep Slate (`#090D16`, `slate-950`), Accent Gold (`#F9D141` / `#d9a416`), & Soft White
- **Kartu Kaca (Glass Card)**: `bg-slate-900/60 backdrop-blur-md border border-white/10 text-white`
- **Typo & Font**: Font `Inter` dengan variasi ketebalan dari *Medium* hingga *ExtraBold*
- **Layar Pemuatan (Full Page Loading)**: Layar pemuatan terang bermerek logo JDIH Kota Semarang dan animasi titik berpendar emas

---

## 🔗 Peta Rute URL Aplikasi (Route Map)

| Path URL | Guard Akses | Deskripsi Halaman |
|----------|-------------|-------------------|
| `/` | Public | Landing Page utama dengan Opening Intro Screen |
| `/terms` | Public | Halaman Ketentuan Layanan (*Terms of Service*) |
| `/privacy` | Public | Halaman Kebijakan Privasi (*Privacy Policy*) |
| `/login` | Guest Only | Halaman Masuk / Login Akun |
| `/signup` | Guest Only | Halaman Pendaftaran Akun Baru |
| `/dashboard` | Auth (User/Admin) | Dasbor Statistik & Ringkasan Aktivitas |
| `/dashboard/reports` | Auth (User/Admin) | Halaman Manajemen Laporan Masalah |
| `/dashboard/reports/:id` | Auth (User/Admin) | Halaman Detail Tiket, Histori Audit, & Komentar |
| `/dashboard/rooms` | Auth (User/Admin) | Halaman Fasilitas Ruangan & Import Excel Aset |
| `/dashboard/asset-transfers` | Auth (User/Admin) | Halaman Pengajuan Pemindahan Aset |
| `/dashboard/asset-transfers/review` | Admin Only | Halaman Persetujuan Transfer Aset |
| `/dashboard/maintenance` | Admin Only | Halaman Agenda Pemeliharaan Rutin & Vendor |
| `/dashboard/users` | Admin Only | Halaman Manajemen Akun Pengguna & Admin |
| `/dashboard/analytics` | Admin Only | Halaman Analitik Metrik & Grafik Laporan |
| `/dashboard/profile` | Auth (User/Admin) | Halaman Pengaturan Profil Saya |
