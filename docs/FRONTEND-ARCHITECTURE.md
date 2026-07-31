# ASETKITA Semarang — Frontend Architecture

Dokumen ini menjelaskan arsitektur teknis, teknologi pendukung, manajemen state, serta pola komponen pada frontend peramban **E-Lapor DPRD (ASETKITA Semarang)**.

---

## Tech Stack Frontend

| Teknologi | Versi | Peran |
|-----------|-------|-------|
| React | 19 | UI Library inti |
| Vite | 8+ | Build tool & dev server |
| TypeScript | 5+ | Sistem tipe statis |
| Tailwind CSS | v4 | Utility-first styling |
| Framer Motion | 12+ | Animasi & transisi halaman |
| TanStack Query | v5 | Server-state management, caching, & optimistic updates |
| Zustand | 5+ | Client auth session (accessToken & data user di memori) |
| React Router | 7 | Sistem rute deklaratif dengan router guards |
| Vite PWA Plugin | 1+ | Progressive Web App, Service Worker caching, & instalasi seluler/desktop |
| Lucide React | — | Library ikon konsisten |
| Sonner | — | Komponen toast notification |

---

## Peta Struktur Direktori Frontend

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

## Pengelolaan State (State Management Architecture)

| Jenis State | Perkakas (Tool) | Catatan & Strategi Keamanan |
|-------------|-----------------|------------------------------|
| Server Data | TanStack Query | Menangani pengambil data API, pembaruan otomatis, & pembersihan cache query |
| Auth Session | Zustand | Menyimpan `accessToken` dan objek `user` hanya di memori RAM (tidak pernah di `localStorage`) |
| Refresh Token | HttpOnly Cookie | Disimpan oleh browser dalam cookie aman `asetkita_semarang_refresh`, kebal dari serangan XSS |
| PWA Offline State | OfflineSyncProvider | Menyimpan antrean transaksi lokal saat offline & menyinkronkan saat koneksi pulih |
| Form State | Native Controlled State | Validasi real-time pada formulir modal & input |

---

## Alur Autentikasi & Token Refresh

```text
Pengguna Login (POST /auth/login)
  -> Terima accessToken (JSON body) + refreshToken (HttpOnly Cookie)
  -> Simpan accessToken di Zustand store (memori, bukan localStorage)
  -> Setiap request API: sertakan accessToken di header Authorization

Saat accessToken kedaluwarsa (respons 401):
  -> apiClient otomatis mengirim POST /auth/refresh (dengan cookie)
  -> Terima accessToken baru
  -> Ulangi request asli secara transparan
  -> Jika refresh juga gagal: logout paksa & redirect ke /login
```

---

## Design System & Estetika Visual

Aplikasi ini mengusung estetika **Minimalism + Glassmorphism**:

| Token | Nilai |
|-------|-------|
| Warna Primary (Gold) | `#F9D141` / `#d9a416` |
| Warna Background (Terang) | `#FAFAFC` |
| Glass Card Background | `rgba(255, 255, 255, 0.72)` dengan `backdrop-blur-md` |
| Glass Card Border | `rgba(255, 255, 255, 0.45)` |
| Font Utama | Inter (Google Fonts) |
| Border Radius | `rounded-xl` / `rounded-2xl` |
| Animasi | Framer Motion, durasi 150ms–300ms |

---

## Peta Rute URL Aplikasi (Route Map)

| Path URL | Guard Akses | Deskripsi Halaman |
|----------|-------------|-------------------|
| `/` | Public | Landing Page utama dengan Opening Intro Screen |
| `/terms` | Public | Halaman Ketentuan Layanan |
| `/privacy` | Public | Halaman Kebijakan Privasi |
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

---

## Konvensi Komponen

Lihat [docs/CONVENTIONS.md](CONVENTIONS.md) untuk panduan lengkap konvensi penulisan komponen React, pengelolaan state, dan penggunaan Framer Motion.
