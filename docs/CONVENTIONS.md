# ASETKITA Semarang — Panduan Konvensi Kode (Code Conventions)

Dokumen ini berisi aturan dan konvensi penulisan kode yang berlaku di seluruh proyek ASETKITA Semarang, mencakup backend NestJS maupun frontend React. Tujuannya adalah menjaga konsistensi, keterbacaan, dan kemudahan pemeliharaan kode bagi seluruh anggota tim pengembang.

---

## 1. Konvensi Penamaan (Naming Conventions)

### Umum (Berlaku di Backend dan Frontend)

| Konteks | Konvensi | Contoh |
|---------|----------|--------|
| Variabel dan fungsi | `camelCase` | `reportId`, `getUserById()` |
| Kelas dan tipe/interface | `PascalCase` | `ReportsService`, `CreateReportDto`, `ApiResponse` |
| Konstanta global | `UPPER_SNAKE_CASE` | `JWT_ACCESS_EXPIRES`, `MAX_FILE_SIZE` |
| Nama file di Backend | `kebab-case` | `reports.service.ts`, `create-report.dto.ts` |
| Nama file di Frontend | `kebab-case` | `report-detail-page.tsx`, `glass-card.tsx` |
| Variabel lingkungan | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `GEMINI_API_KEY` |

### Backend — NestJS

| Konteks | Konvensi | Contoh |
|---------|----------|--------|
| Nama modul (folder) | `kebab-case` | `asset-transfers/`, `maintenance/` |
| Controller class | `<NamaFitur>Controller` | `ReportsController` |
| Service class | `<NamaFitur>Service` | `ReportsService` |
| Repository class | `<NamaFitur>Repository` | `ReportsRepository` |
| DTO class | `<Aksi><NamaFitur>Dto` | `CreateReportDto`, `UpdateStatusDto` |
| Endpoint route | `kebab-case` | `/api/v1/asset-transfers`, `/api/v1/auth/refresh` |
| Kolom database | `snake_case` | `created_at`, `reporter_id`, `ai_analysis_status` |
| Kolom hasil query (setelah konversi) | `camelCase` | `createdAt`, `reporterId`, `aiAnalysisStatus` |

### Frontend — React / TypeScript

| Konteks | Konvensi | Contoh |
|---------|----------|--------|
| Komponen React | `PascalCase` (fungsi) | `GlassCard`, `ReportDetailPage` |
| Halaman (Page component) | `<NamaHalaman>Page` | `ReportDetailPage`, `MaintenancePage` |
| Custom hook | `use<NamaHook>` | `useAuthStore`, `useReportDetail` |
| File komponen | `kebab-case.tsx` | `glass-card.tsx`, `report-detail-page.tsx` |
| Alias import | Gunakan `@/` | `import { Button } from '@/components/ui/button'` |
| Tipe/Interface API | Sesuai nama entitas | `Report`, `User`, `MaintenanceSchedule` |

---

## 2. Konvensi Struktur File

### Backend — Pola Setiap Modul

Setiap fitur baru di backend ditempatkan di `backend/src/modules/<nama-modul>/` dengan struktur standar berikut:

```text
modules/<nama-modul>/
├── <nama-modul>.controller.ts   # Routing HTTP, tidak mengandung logika bisnis
├── <nama-modul>.module.ts       # Pendaftaran dependency injection
├── dto/
│   ├── create-<nama>.dto.ts     # DTO untuk POST request
│   └── update-<nama>.dto.ts     # DTO untuk PATCH request
├── services/
│   └── <nama-modul>.service.ts  # Logika bisnis aplikasi
└── repositories/
    └── <nama-modul>.repository.ts  # Kueri Raw SQL via postgres.js
```

Aturan pemisahan tanggung jawab:
- **Controller**: Hanya menerima request, memanggil service, dan mengembalikan respons. Tidak boleh mengandung kueri database langsung.
- **Service**: Mengandung logika bisnis, validasi tambahan, dan orkestrasi pemanggilan repository.
- **Repository**: Hanya mengandung kueri SQL murni. Tidak boleh mengandung logika bisnis.

### Frontend — Pola Setiap Fitur

Setiap fitur baru ditempatkan di `frontend/src/features/<nama-fitur>/` dengan struktur berikut:

```text
features/<nama-fitur>/
└── pages/
    └── <nama-fitur>-page.tsx    # Komponen halaman utama
```

Komponen yang dapat digunakan ulang di lebih dari satu fitur ditempatkan di `frontend/src/components/ui/`.

---

## 3. Kueri Database (Backend)

Proyek ini menggunakan **`postgres.js`** dengan *tagged template literals* untuk menulis Raw SQL. Tidak menggunakan ORM seperti TypeORM atau Prisma.

### Aturan Penulisan Kueri

1. Selalu gunakan parameterisasi bawaan `postgres.js`. Jangan pernah melakukan string concatenation langsung untuk nilai yang berasal dari input pengguna.

   ```typescript
   // Benar — Aman dari SQL Injection
   const result = await sql`SELECT * FROM reports WHERE id = ${id}`;

   // Salah — Berbahaya, rentan SQL Injection
   const result = await sql`SELECT * FROM reports WHERE id = '${id}'`;
   ```

2. Gunakan `sql.unsafe()` hanya untuk segmen kueri yang bersifat dinamis dan sudah pasti aman secara kontekstual (contoh: nama kolom dari whitelist internal, bukan input pengguna).

3. Konversi nama kolom dari `snake_case` ke `camelCase` ditangani otomatis oleh konfigurasi `transform` di `backend/src/database/sql.ts`. Tidak perlu mapping manual.

4. Selalu sertakan klausa `LIMIT` pada kueri yang mengembalikan banyak baris. Gunakan paginasi berbasis `OFFSET` atau `cursor`.

---

## 4. API Response Envelope

Semua endpoint REST API mengembalikan respons dalam format *envelope* standar yang konsisten. Format ini diterapkan secara otomatis oleh `TransformInterceptor` dan `AllExceptionsFilter` di backend.

### Respons Sukses (2xx)

```json
{
  "success": true,
  "message": "Deskripsi singkat hasil operasi",
  "data": { }
}
```

Untuk respons list/paginasi, `data` berisi:

```json
{
  "success": true,
  "message": "Reports fetched successfully",
  "data": {
    "items": [],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Respons Error (4xx / 5xx)

```json
{
  "success": false,
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Deskripsi error yang dapat dibaca pengguna"
}
```

---

## 5. Penanganan Error di Frontend

Seluruh pemanggilan API di frontend melalui wrapper `apiClient` di `frontend/src/lib/api-client.ts`. Wrapper ini menangani:

- Penyisipan Access Token otomatis dari Zustand store ke header `Authorization`.
- Percobaan ulang (*retry*) refresh token secara otomatis saat menerima respons `401 Unauthorized`.
- Pemanggilan TanStack Query tidak perlu menambahkan logic refresh token secara manual.

Pola penggunaan yang direkomendasikan untuk data fetching:

```typescript
// Di dalam komponen atau custom hook
const { data, isLoading, error } = useQuery({
  queryKey: ['reports', page, search],
  queryFn: () => apiClient.get(`/reports?page=${page}&search=${search}`),
})
```

Untuk mutasi (POST, PATCH, DELETE):

```typescript
const mutation = useMutation({
  mutationFn: (payload: CreateReportDto) => apiClient.post('/reports', payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] })
    toast.success('Laporan berhasil dibuat')
  },
  onError: (error) => {
    toast.error(error.message ?? 'Terjadi kesalahan')
  },
})
```

---

## 6. Konvensi Komponen React

### Penulisan Komponen

- Gunakan *function component* dengan tipe eksplisit. Hindari *class component*.
- Ekstrak props ke tipe terpisah jika memiliki lebih dari 3 prop.
- Berikan nama deskriptif pada handler. Gunakan awalan `handle` untuk event handler.

```typescript
// Benar
type ReportCardProps = {
  report: Report
  onStatusChange: (id: string, status: string) => void
}

function ReportCard({ report, onStatusChange }: ReportCardProps) {
  function handleStatusChange() {
    onStatusChange(report.id, 'IN_PROGRESS')
  }
  // ...
}
```

### Penggunaan Animasi (Framer Motion)

- Definisikan objek `Variants` di luar komponen untuk menghindari re-render yang tidak perlu.
- Selalu gunakan `as const` pada properti `type` dalam konfigurasi transition untuk menghindari error TypeScript.
- Batasi penggunaan `animate-ping` hanya pada satu elemen per tampilan untuk menghindari distraksi visual.

```typescript
// Di luar komponen
const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
}
```

### Pengelolaan State

| Jenis Data | Gunakan |
|------------|---------|
| Data dari API (server-state) | TanStack Query (`useQuery`, `useMutation`) |
| State otentikasi (token, user) | Zustand (`useAuthStore`) |
| State lokal komponen (modal terbuka, input value) | `useState` React |
| State form kompleks | Controlled state React (`useState`) |

---

## 7. Gaya Penulisan Kode (Code Style)

### Umum

- Selalu gunakan **TypeScript** yang ketat. Hindari penggunaan tipe `any`. Gunakan `unknown` jika tipe tidak pasti, lalu persempit dengan type guard.
- Aktifkan `strict` mode di `tsconfig.json` (sudah aktif secara default pada proyek ini).
- Gunakan *optional chaining* (`?.`) dan *nullish coalescing* (`??`) daripada pemeriksaan `null`/`undefined` manual.

### Backend

- Tandai semua endpoint publik (tidak memerlukan autentikasi) dengan dekorator `@Public()`.
- Tandai endpoint yang hanya boleh diakses admin dengan `@Roles('ADMIN')`.
- Gunakan `@CurrentUser()` untuk mendapatkan data user dari JWT payload di dalam controller.
- Semua DTO harus menggunakan dekorator `class-validator` untuk validasi input.

```typescript
// Contoh DTO yang benar
import { IsString, IsNotEmpty, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @IsUUID()
  reportId: string;
}
```

### Frontend

- Gunakan `cn()` dari `@/lib/utils` untuk menggabungkan kelas Tailwind secara kondisional. Jangan gunakan template literal string untuk penggabungan kelas.

```typescript
// Benar
import { cn } from '@/lib/utils'
<div className={cn('base-class', isActive && 'active-class', className)} />

// Salah
<div className={`base-class ${isActive ? 'active-class' : ''} ${className}`} />
```

---

## 8. Konvensi Migrasi Database

Setiap perubahan skema database **harus** dilakukan melalui file migrasi SQL di `backend/migrations/`, bukan dengan memodifikasi tabel secara langsung di database.

Aturan penamaan file migrasi:
- Format: `<nomor-urut-4-digit>_<deskripsi-singkat>.sql`
- Contoh: `0015_add_priority_column_to_reports.sql`

Aturan penulisan migrasi:
- Setiap file migrasi bersifat *idempoten* dan tidak dapat di-rollback secara otomatis (tidak ada migrasi `down`). Pastikan perubahan sudah dikaji dengan cermat sebelum dieksekusi di lingkungan produksi.
- Gunakan `IF NOT EXISTS` / `IF EXISTS` untuk operasi `CREATE` dan `DROP` agar migrasi aman dieksekusi ulang.
- Setelah menambahkan file migrasi baru, jalankan `bun run migrate` dari folder `backend/`.

---

## 9. Konvensi Commit dan Branching

Proyek ini mengikuti **Conventional Commits** dan Git branching strategy yang dijelaskan secara lengkap di [CONTRIBUTING.md](../CONTRIBUTING.md).

Ringkasan cepat:

| Jenis Commit | Kapan Digunakan |
|--------------|-----------------|
| `feat:` | Menambahkan fitur baru |
| `fix:` | Memperbaiki bug |
| `docs:` | Perubahan dokumentasi saja |
| `refactor:` | Perubahan kode tanpa mengubah fungsionalitas |
| `style:` | Perubahan formatting, spasi, dsb (bukan logika) |
| `test:` | Menambah atau memperbaiki test |
| `chore:` | Perubahan konfigurasi, dependensi, build script |
| `perf:` | Perbaikan performa |
