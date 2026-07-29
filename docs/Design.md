# ASETKITA Semarang — Filosofi & Sistem Desain UI/UX (Design System)

Dokumen ini berisi panduan gaya visual, sistem warna, tipografi, serta aturan UX pada aplikasi **E-Lapor DPRD (ASETKITA Semarang)**. Aplikasi ini dirancang agar memberikan pengalaman dasbor enterprise modern yang cepat, elegan, dan intuitif.

---

## 1. Prinsip Desain Utama (Design Principles)

- **Mobile-First Design:** Dirancang utama untuk perangkat seluler terlebih dahulu, kemudian ditingkatkan secara responsif untuk tablet dan desktop.
- **Bersih & Minimalis (Clean & Minimalist):** Menghindari elemen visual berlebihan yang mengganggu konsentrasi pengguna.
- **Profesional & Premium:** Menggunakan estetika modern setara produk SaaS kelas dunia (seperti Vercel, Linear, atau Stripe).
- **Aksesibilitas & Hirarki Jelas:** Memperhatikan kontras teks, keterbacaan, dan ukuran area sentuh (*thumb-friendly*).

---

## 2. Bahasa Desain & Gaya Visual (UI Style)

**Desain Bahasa:** *Minimalism + Glassmorphic Aesthetics*

- Menggunakan kartu transparan (*glass card*) dengan efek blur latar belakang (*backdrop blur*) alih-alih bayangan gelap yang berat.
- Sudut elemen yang konsisten (`rounded-xl` / `rounded-2xl`).
- Animasi transisi yang halus, profesional, dan tidak berlebihan.

---

## 3. Palet Warna (Color Palette)

### Warna Gradasi Utama (Primary Gradient)
- **Warna Aksen:** `#F9D141` / `#d9a416` (Emas DPRD) dipadukan dengan aksen hangat.
- **Latar Belakang:** `#FAFAFC` (Terang) & `#090D16` / `slate-950` (Tirai Kaca Gelap)
- **Kartu Transparan (Glass Card):** `rgba(255, 255, 255, 0.72)` dengan border `rgba(255, 255, 255, 0.45)`
- **Teks Utama:** `#1E293B` (Teks Terang) & `#FFFFFF` (Teks Kaca Gelap)
- **Teks Sekunder:** `#64748B` / `slate-400`
- **Status Indikator:**
  - Sukses (Success): `#22C55E`
  - Peringatan (Warning): `#F59E0B`
  - Bahaya (Danger): `#EF4444` / `#D42115`
  - Informasi (Info): `#3B82F6`

---

## 4. Tipografi (Typography)

- **Font Utama:** Inter (Google Fonts)
- **Ketebalan Font (Font Weight):** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold), 800 (ExtraBold).
- Hindari font dekoratif yang sulit dibaca. Gunakan hirarki ukuran yang konsisten dari judul hingga teks kecil.

---

## 5. Gaya Komponen UI (Component Style)

- **Kartu (Cards):** Sudut melengkung `rounded-xl`, batas tipis transparan, backdrop blur, dan animasi hover angkat (*lift on hover*).
- **Tombol (Buttons):**
  - Primary: Gradasi warna aksen dengan teks putih tegas (`text-white font-extrabold`).
  - Secondary: Putih bersih / glass transparan dengan efek hover halus.
  - Danger: Merah tegas untuk konfirmasi aksi destruktif.
- **Tabel Data:** Minimalis, bersih, dengan efek hover baris bergantian tanpa border berlebihan.
- **Sidebar Navigasi:** Dapat diciutkan (*collapsible*), mendukung mode melayang mobile, dan indikator aktif berpendar.

---

## 6. Prinsip Animasi (Animation Principles)

Menggunakan **Framer Motion** dengan durasi transisi 150ms–300ms.
- Animasi yang diperbolehkan: *Fade*, *Slide*, *Scale*, *Stagger*, *Hover Lift*, dan *Page Transition*.
- Dilarang membuat animasi yang terlalu ramai atau memperlambat interaksi pengguna.

---

## 7. Prinsip Pengalaman Pengguna (UX Principles)

- Utamakan kegunaan (*usability*) di atas estetika semata.
- Minimalkan jumlah klik pengguna untuk menyelesaikan tugas.
- Selalu sediakan dialog konfirmasi (*confirmation modal*) untuk aksi penghapusan atau perubahan status kritikal.
- Berikan umpan balik visual (*visual feedback*) pada setiap interaksi (loading state, toast notification, empty state, error message).