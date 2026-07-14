# FixMind — Dokumentasi Pustaka Komponen (Component Library)

Dokumen ini menjelaskan sistem desain UI, prinsip dasar, dan dokumentasi komponen visual yang dapat digunakan kembali (*reusable UI components*) di modul Frontend aplikasi FixMind.

---

## 1. Prinsip Desain & Visual (Design System)

Frontend FixMind dirancang menggunakan kombinasi gaya **Minimalism** dan **Glassmorphism** untuk menciptakan kesan modern, premium, dan bersih layaknya produk SaaS kelas dunia (seperti Vercel, Linear, atau Notion).

### Token Visual Utama:
* **Warna Aksen / Gradasi Utama:** `#EECDA3` $\rightarrow$ `#EF629F` (`linear-gradient(90deg, #EECDA3 0%, #EF629F 100%)`)
* **Latar Belakang:** `#FAFAFC`
* **Elemen Kartu (Glassmorphic Card):** Latar belakang transparan `rgba(255, 255, 255, 0.72)` dipadukan dengan border halus `rgba(255, 255, 255, 0.45)` dan efek blur latar belakang `backdrop-filter: blur(12px)`.
* **Tipografi:** Menggunakan font **Inter** untuk keterbacaan optimal.

---

## 2. Komponen UI Reusable (UI Elements)

Semua komponen UI terletak di direktori [frontend/src/components/ui/](file:///d:/FixMind/frontend/src/components/ui).

### A. Tombol (`Button`)
Komponen tombol standar dengan varian desain modern.
* **File:** [button.tsx](file:///d:/FixMind/frontend/src/components/ui/button.tsx)
* **Varian (`variant`):**
  * `primary`: Gradasi oranye-merah muda khas FixMind.
  * `secondary`: Latar belakang semi-transparan (glass) dengan hover putih solid.
  * `ghost`: Transparan, hanya menampilkan latar belakang abu-abu sangat tipis saat di-hover.
  * `danger`: Warna merah solid untuk aksi destruktif.
* **Ukuran (`size`):** `sm` (tinggi 36px), `md` (tinggi 40px), `lg` (tinggi 44px).
* **Contoh Penggunaan:**
  ```tsx
  import { Button } from '@/components/ui/button'

  <Button variant="primary" size="md" onClick={handleSave}>Simpan Data</Button>
  ```

### B. Input Teks & Password (`Input` & `PasswordInput`)
Input dengan penanganan visual focus ring gradasi halus dan tombol toggle keamanan untuk tipe password.
* **File:** [input.tsx](file:///d:/FixMind/frontend/src/components/ui/input.tsx) dan [password-input.tsx](file:///d:/FixMind/frontend/src/components/ui/password-input.tsx)
* **Fitur Utama:** Focus ring transparan berwarna aksen, sudut melengkung konsisten (`rounded-xl`), dan tombol mata (eye icon) otomatis pada `PasswordInput` untuk menampilkan/menyembunyikan kata sandi.

### C. GlassCard (`GlassCard` & `AnimatedGlassCard`)
Kombinasi wadah informasi berbasis glassmorphism dengan transisi dan animasi masuk/hover halus menggunakan Framer Motion.
* **File:** [glass-card.tsx](file:///d:/FixMind/frontend/src/components/ui/glass-card.tsx) dan [animated-glass-card.tsx](file:///d:/FixMind/frontend/src/components/ui/animated-glass-card.tsx)
* **Fitur Utama:** Memberikan efek bayangan lembut, pembatas semi-transparan, efek blur backdrop, dan animasi *lift on hover* untuk menarik interaksi pengguna.

### D. Global Search Modal (`GlobalSearchModal`)
Modal pencarian pintar terpadu yang memindai data lintas modul secara instan.
* **File:** [global-search-modal.tsx](file:///d:/FixMind/frontend/src/components/ui/global-search-modal.tsx)
* **Fitur Utama:** Pencarian cepat yang diaktifkan dengan pintasan keyboard (`Ctrl+K` atau `Cmd+K`) untuk menelusuri data aset, laporan, ruangan, dan jadwal pemeliharaan dalam satu tempat.

### E. Notification Bell (`NotificationBell`)
Lonceng notifikasi real-time yang terhubung ke server WebSocket.
* **File:** [notification-bell.tsx](file:///d:/FixMind/frontend/src/components/ui/notification-bell.tsx)
* **Fitur Utama:** Menampilkan badge jumlah notifikasi aktif secara dinamis, serta popover daftar notifikasi terbaru yang dapat diklik langsung.

### F. Error Boundary (`ErrorBoundary`)
Komponen pengaman untuk menangani crash pada React rendering tree di halaman tertentu.
* **File:** [error-boundary.tsx](file:///d:/FixMind/frontend/src/components/ui/error-boundary.tsx)
* **Fitur Utama:** Menghindari layar putih polos (*blank white screen*) jika terjadi kegagalan sistem dengan menyajikan tampilan fallback premium beserta tombol untuk memuat ulang halaman (*reload*).

---

## 3. Strategi Pengujian Komponen

Setiap komponen UI utama wajib dilengkapi dengan pengujian unit/komponen menggunakan **Vitest** dan **React Testing Library** untuk memastikan ketahanan komponen terhadap regresi fungsionalitas.

* **Lokasi Pengujian:** Berdampingan dengan berkas komponen (contoh: [button.spec.tsx](file:///d:/FixMind/frontend/src/components/ui/button.spec.tsx)).
* **Cakupan Pengujian Minimal:**
  1. Memastikan komponen ter-render dengan benar di dokumen DOM.
  2. Memverifikasi properti/prop yang dikirim (seperti `disabled`, `type`, atau `className`) diterapkan dengan tepat.
  3. Menguji fungsionalitas interaktif (seperti event klik, ketikan keyboard) menggunakan simulator `@testing-library/user-event`.
