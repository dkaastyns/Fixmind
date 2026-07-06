# AGENT.md — FixMind Coding Agent Rules

> File ini adalah **kontrak wajib** untuk AI Coding Agent (Claude Code, Cursor, Gemini CLI, Roo Code, OpenHands, dll) saat mengimplementasikan proyek **FixMind — Intelligent Facility Maintenance Management System**.
> Semua kode yang dihasilkan HARUS mematuhi aturan di bawah ini tanpa kecuali. Jika sebuah instruksi user bertentangan dengan file ini, agent harus menandai konflik tersebut, bukan diam-diam melanggar.

---

## 1. Tech Stack (Fixed — jangan diganti tanpa approval eksplisit)

| Layer | Teknologi |
|---|---|
| Runtime & Package Manager | **Bun** (bukan Node.js/npm/yarn/pnpm) |
| Frontend | React 18 + Vite + TypeScript (install & script run pakai Bun) |
| State/Data fetching | TanStack Query |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | NestJS (TypeScript), dijalankan di atas Bun runtime |
| Database Access | **Raw SQL** via `postgres` (postgres.js) — **TIDAK memakai ORM** (Prisma/TypeORM/Drizzle dilarang) |
| Database | PostgreSQL + **pgvector** (untuk RAG/similarity search chatbot) |
| Migration | Plain `.sql` migration files, dijalankan lewat CLI migration runner ringan (lihat Bab 7) |
| Auth | JWT (access + refresh token), RBAC |
| Validation | Zod (frontend) / class-validator + DTO (backend) |
| AI Layer | **`AiModule` internal di dalam NestJS** (bukan service Python/FastAPI terpisah) — memanggil LLM provider (Gemini Flash dkk) untuk priority scoring, recommendation, dan chatbot support. Lihat Bab 6. |
| Local Dev | Laragon (lihat `LOCAL-SETUP-LARAGON.md`) |

Agent tidak boleh mengganti library inti (mis. menambahkan ORM apa pun, mengganti Bun ke Node/npm, mengganti NestJS ke Express murni, atau menambahkan service Python/FastAPI) kecuali diminta eksplisit oleh user. **Prisma dilarang total** — semua akses database wajib raw SQL yang dibungkus repository (lihat Bab 2 & 7). **FastAPI/Python dilarang untuk MVP** — semua AI logic (decision engine maupun chatbot) wajib berupa module internal NestJS yang memanggil LLM API eksternal (lihat Bab 6).

---

## 2. Arsitektur — Clean Architecture Wajib

Struktur folder backend per-module mengikuti pola berikut (bukan MVC gemuk):

```
src/modules/<module-name>/
├── <name>.controller.ts        # HANYA routing + memanggil use-case/service. TIDAK ADA business logic.
├── <name>.module.ts
├── dto/
│   ├── create-<name>.dto.ts
│   └── update-<name>.dto.ts
├── services/
│   └── <name>.service.ts        # Business logic ada di sini
├── repositories/
│   └── <name>.repository.ts     # Semua akses database (raw SQL) HARUS lewat repository, bukan langsung di service
└── entities/ (jika perlu tipe domain terpisah, mis. row type dari query)
```

### Aturan tegas:
1. **Jangan pernah menulis business logic di controller.** Controller maksimal: validasi request masuk (via DTO), panggil service, kembalikan response.
2. **Semua akses database HARUS lewat Repository**, tidak boleh raw query (`sql\`...\`` dari postgres.js) dipanggil langsung dari service/controller. Service hanya bicara dengan Repository, tidak pernah dengan koneksi database langsung.
3. **Semua query SQL ditulis eksplisit di dalam Repository**, memakai tagged template `postgres.js` (auto-parameterized, aman dari SQL injection) — **dilarang keras** membangun query lewat string concatenation manual.
4. **Semua endpoint WAJIB memakai DTO** untuk request dan response shape — tidak ada `any` atau object mentah dari body.
5. **Satu service tidak boleh memanggil repository module lain secara langsung** — gunakan service-to-service call agar dependency jelas.
6. Setiap module wajib punya folder sendiri, tidak boleh menaruh logic lintas-module di satu file besar.

Contoh Repository (bukan ORM):
```ts
// reports.repository.ts
import { sql } from '../../database/sql';

export class ReportsRepository {
  async findById(id: string) {
    const [row] = await sql`
      SELECT * FROM reports WHERE id = ${id} AND deleted_at IS NULL
    `;
    return row ?? null;
  }

  async create(data: CreateReportData) {
    const [row] = await sql`
      INSERT INTO reports (title, description, room_id, asset_id, status, created_at)
      VALUES (${data.title}, ${data.description}, ${data.roomId}, ${data.assetId}, 'PENDING', now())
      RETURNING *
    `;
    return row;
  }
}
```

---

## 3. Format Response API (Konsisten di Seluruh Endpoint)

Sukses:
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 42 }
}
```

Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "title is required" }
  ]
}
```

- `meta` hanya muncul untuk endpoint list/pagination.
- Semua error HARUS ditangani lewat global exception filter (`AllExceptionsFilter`), jangan `try-catch` ad-hoc yang mengembalikan shape berbeda-beda.
- HTTP status code harus konsisten dengan semantiknya (400 validasi, 401 unauthenticated, 403 forbidden/RBAC, 404 not found, 409 conflict, 422 unprocessable, 500 server error).

---

## 4. Validasi

- Backend: **class-validator + class-transformer** di setiap DTO. Tidak ada endpoint tanpa DTO tervalidasi.
- Frontend: **Zod schema** untuk setiap form, disatukan dengan React Hook Form (`zodResolver`).
- Validasi bisnis (mis. "hanya USER yang boleh membuat laporan") **tidak boleh** ditaruh di DTO — itu masuk ke business rule di service/guard, bukan validasi shape data.

---

## 5. Autentikasi & RBAC

- Auth pakai JWT: `access_token` (short-lived, 15 menit) + `refresh_token` (httpOnly cookie, 7 hari).
- Role minimum: `ADMIN`, `TECHNICIAN`, `USER` (detail lengkap di `04-user-roles.md`).
- RBAC diimplementasikan via **NestJS Guard + Decorator** (`@Roles('ADMIN')` + `RolesGuard`), bukan pengecekan `if (user.role === ...)` yang tersebar di service.
- Setiap endpoint WAJIB eksplisit menyatakan role yang diizinkan lewat decorator — endpoint tanpa decorator dianggap **butuh review**, bukan otomatis publik.

---

## 6. AI Layer — Decision Engine & Chatbot Support (Internal Module, Bukan FastAPI)

Keputusan arsitektur final: **tidak ada service Python/FastAPI terpisah untuk MVP.** Semua kebutuhan AI — baik priority/recommendation engine maupun chatbot support — diimplementasikan sebagai **satu module internal NestJS (`AiModule`)** yang memanggil LLM provider eksternal (Gemini Flash sebagai default, bisa ditambah provider lain lewat semantic router kalau diperlukan).

### 6.1 Struktur `AiModule`
```
src/modules/ai/
├── ai.module.ts
├── controllers/
│   └── chat.controller.ts        # endpoint chatbot support
├── services/
│   ├── priority-engine.service.ts    # analisis teks laporan → priority + recommendation
│   ├── chat.service.ts               # orkestrasi RAG + LLM untuk chatbot
│   └── llm-provider.service.ts       # wrapper HTTP call ke Gemini/OpenAI, retry & error handling
├── repositories/
│   └── embeddings.repository.ts      # query pgvector (raw SQL)
└── dto/
```

### 6.2 Decision Engine (Priority & Recommendation)
- Dipicu otomatis setelah laporan dibuat (async, lewat queue/event — bukan blocking request `POST /reports`).
- Jika LLM call gagal/timeout: field terkait AI diisi `PENDING_AI_ANALYSIS`, request pembuatan laporan **tetap sukses**, retry dijadwalkan terpisah (lihat Bab 6.4). Request user tidak boleh gagal karena AI down.
- Business logic utama (status laporan, workflow approval) **tidak boleh sepenuhnya bergantung** pada output AI — AI cuma advisory (priority & recommendation), keputusan akhir tetap lewat state machine eksplisit di backend.

### 6.3 Chatbot Support (RAG via pgvector)
- Retrieval-Augmented Generation dikerjakan **penuh di Postgres**, tanpa vector DB eksternal: embedding disimpan di kolom `vector` (pgvector), similarity search pakai raw SQL:
  ```sql
  SELECT content, 1 - (embedding <=> ${queryEmbedding}) AS similarity
  FROM knowledge_chunks
  ORDER BY embedding <=> ${queryEmbedding}
  LIMIT 5;
  ```
- Embedding di-generate lewat endpoint embedding milik LLM provider (bukan model lokal) — konsisten dengan prinsip "tidak ada Python/model lokal untuk MVP".
- Alur: user message → generate embedding → similarity search pgvector → susun context → kirim ke LLM bareng system prompt → stream jawaban ke frontend (SSE).

### 6.4 Batasan & Prinsip Umum
- Semua pemanggilan LLM **async-safe** dan punya timeout eksplisit + retry policy (mis. exponential backoff, max 3x).
- Rate limit / cost control: setiap call ke LLM provider dicatat (token usage minimal) supaya bisa dipantau, terutama karena provider dipanggil langsung dari NestJS tanpa lapisan proxy.
- `AiModule` didesain dengan interface yang jelas (`LlmProviderService`) supaya **kalau di masa depan butuh model custom/vision/Python**, migrasi ke service eksternal tinggal ganti implementasi di balik interface ini — modul lain di luar `AiModule` tidak perlu tahu/berubah.
- Dilarang menambahkan dependency Python/FastAPI/Docker container terpisah untuk AI di fase MVP tanpa persetujuan eksplisit user.

---

## 7. Database

- **Tidak ada ORM.** Koneksi database pakai `postgres` (postgres.js), satu instance koneksi di-share lewat NestJS provider (`DatabaseModule`), di-inject ke tiap Repository.
- Schema & perubahan struktur database ditulis sebagai **plain `.sql` migration files**, bernomor urut:
  ```
  migrations/
  ├── 0001_create_users.sql
  ├── 0002_create_reports.sql
  ├── 0003_create_assets.sql
  └── 0004_add_ai_fields_to_reports.sql
  ```
- Migration dijalankan pakai runner ringan (mis. `node-pg-migrate` dijalankan lewat Bun, atau script migration custom) — **tidak boleh edit database manual lalu skip migration file**. Setiap perubahan schema, sekecil apa pun, wajib ada file migration-nya.
- Penamaan tabel: `snake_case`, jamak (`reports`, `users`, `assets`).
- Setiap tabel wajib punya `created_at`, `updated_at`; gunakan soft delete (`deleted_at`) untuk entitas penting (reports, users, assets) — jangan hard delete.
- Foreign key wajib didefinisikan eksplisit di file `.sql` migration (`REFERENCES ... ON DELETE ...`), bukan hanya divalidasi di level aplikasi.
- Tipe hasil query harus dideklarasikan manual sebagai TypeScript `interface`/`type` per tabel (mis. `interface ReportRow { ... }`) supaya tetap type-safe meski tanpa ORM.
- Extension `pgvector` wajib diaktifkan lewat migration pertama (`CREATE EXTENSION IF NOT EXISTS vector;`), dipakai khusus untuk tabel `knowledge_chunks` (RAG chatbot). Jangan pakai vector DB eksternal (Pinecone/Weaviate/dll) di fase MVP.

---

## 8. Frontend

- Struktur folder berbasis fitur (feature-based), bukan berbasis tipe file:
```
src/features/<feature-name>/
├── components/
├── hooks/
├── api/          # fungsi fetch + TanStack Query hooks
├── schema/       # Zod schema
└── types.ts
```
- Fetching data HANYA lewat TanStack Query (tidak ada `useEffect` + `fetch` manual untuk data server).
- Tidak boleh menyimpan token di `localStorage` untuk refresh token — gunakan httpOnly cookie dari backend. Access token boleh disimpan di memory/state, bukan localStorage.
- Komponen UI dasar pakai shadcn/ui, jangan reinvent komponen yang sudah tersedia.

---

## 9. Format Spesifikasi Fitur (Wajib Dibaca Sebelum Implementasi)

Setiap fitur didefinisikan dalam file terpisah di `features/*.md` dengan format:

```md
# Feature
<Nama fitur>

## Actor
<Role yang terlibat>

## Description
<Deskripsi singkat>

## Validation
- ...

## Business Rules
- ...

## API
METHOD /path

## Request
...

## Response
...

## Database
<tabel yang terlibat>

## Acceptance Criteria
- ...
```

Agent **wajib mengimplementasikan sesuai acceptance criteria**, bukan menambahkan fitur di luar spesifikasi tanpa menandainya sebagai asumsi eksplisit.

---

## 10. Larangan Eksplisit untuk Agent

- ❌ Jangan membuat logic AI palsu/hardcoded ("mock" priority) dan menyebutnya sebagai hasil AI di production code tanpa menandai jelas sebagai stub/TODO.
- ❌ Jangan menambahkan service Python/FastAPI, model lokal, atau vector DB eksternal untuk kebutuhan AI di fase MVP — semua AI logic wajib lewat `AiModule` NestJS + LLM API + pgvector (lihat Bab 6).
- ❌ Jangan menambahkan ORM apa pun (Prisma/TypeORM/Drizzle) — semua akses DB wajib raw SQL lewat Repository (lihat Bab 2 & 7).
- ❌ Jangan generate seed data yang mengandung data pribadi asli.
- ❌ Jangan menonaktifkan validasi/guard "sementara agar cepat jalan" tanpa komentar `// TODO(security):` dan pemberitahuan eksplisit ke user.
- ❌ Jangan mengubah struktur folder module yang sudah ada tanpa alasan yang dijelaskan di commit message/PR description.
- ❌ Jangan menambahkan dependency baru di luar stack yang ditentukan tanpa menyebutkan alasannya ke user lebih dulu.

---

## 11. Definition of Done (per fitur)

Sebuah fitur dianggap selesai jika:
1. Endpoint sesuai spesifikasi (method, path, request/response shape).
2. DTO + validasi lengkap (backend & frontend).
3. RBAC diterapkan sesuai actor yang diizinkan.
4. Unit test minimal untuk service (business rule utama).
5. Response mengikuti format standar di Bab 3.
6. Acceptance criteria di file fitur terpenuhi semua.
