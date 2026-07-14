# FixMind — Panduan & Strategi Pengujian (Testing)

Dokumen ini menjelaskan strategi, arsitektur, dan pola pengujian yang digunakan dalam proyek FixMind baik untuk Backend maupun Frontend.

---

## Backend Testing

Backend NestJS menggunakan [Jest](https://jestjs.io/) sebagai kerangka kerja pengujian (testing framework) utama, dan [Supertest](https://github.com/ladjs/supertest) untuk pengujian E2E (End-to-End).

### 1. Menjalankan Pengujian

Jalankan perintah berikut dari folder `backend/`:

* **Unit Tests:**
  ```powershell
  bun run test
  ```
* **E2E Tests:**
  ```powershell
  bun run test:e2e
  ```
* **Coverage Report (Laporan Cakupan Uji):**
  ```powershell
  bun run test:cov
  ```
* **Watch Mode (Sangat berguna saat development):**
  ```powershell
  bun run test:watch
  ```

### 2. Pola Unit Testing (Unit Testing Patterns)

Unit test ditulis berdampingan dengan kode yang diuji, menggunakan ekstensi `.spec.ts`. Fokus utama unit test adalah menguji fungsionalitas unit terkecil (seperti service atau repository) secara terisolasi dengan melakukan mocking pada dependensinya.

#### Contoh Mocking Database Kustom (`postgres.js`)
Karena backend menggunakan `postgres.js` (raw SQL) alih-alih ORM, kita menguji repository dengan melakukan mocking pada fungsi tagged template literal dari database client.

Berikut adalah pola yang digunakan pada [reports.repository.spec.ts](file:///d:/FixMind/backend/src/modules/reports/repositories/reports.repository.spec.ts):

```typescript
import { Sql } from '../../../database/sql';
import { ReportsRepository } from './reports.repository';

describe('ReportsRepository', () => {
  it('includes the room and user joins in the count query when filtering by search', async () => {
    const queries: string[] = [];
    
    // Mocking fungsi sql`` postgres.js
    const sqlMock = jest.fn(
      (strings: TemplateStringsArray, ...values: unknown[]) => {
        const query = strings.reduce((acc, str, index) => {
          const val = values[index];
          const valStr = typeof val === 'string' || typeof val === 'number' ? String(val) : '';
          return acc + str + valStr;
        }, '');
        queries.push(query);

        return queries.length === 1 ? [{ id: 'report-1' }] : [{ count: '1' }];
      },
    ) as unknown as Sql;

    const repository = new ReportsRepository(sqlMock);
    await repository.list({ page: 1, limit: 10, search: 'room' });

    // Verifikasi query yang dihasilkan
    const countQuery = queries.find(
      (query) =>
        query.includes('FROM reports r') &&
        query.includes('JOIN rooms rm ON rm.id = r.room_id') &&
        query.includes('JOIN users u ON u.id = r.reporter_id'),
    );

    expect(countQuery).toBeDefined();
  });
});
```

### 3. Pola Pengujian E2E (E2E Testing Patterns)

Pengujian E2E diletakkan di direktori `backend/test/` dengan ekstensi `.e2e-spec.ts`. E2E menguji aliran aplikasi dari ujung ke ujung melalui HTTP request ke server NestJS yang berjalan di memory.

Berikut pola pengujian E2E pada [app.e2e-spec.ts](file:///d:/FixMind/backend/test/app.e2e-spec.ts):

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterEach(async () => {
    await app.close();
  });
});
```

---

## Frontend Testing Strategy

Saat ini, modul Frontend belum diisi dengan rangkaian pengujian aktif. Namun, kami merekomendasikan strategi berikut untuk pengembangan masa depan:

### 1. Unit & Integration Testing dengan Vitest
Karena frontend menggunakan Vite + React 19 + TypeScript, [Vitest](https://vitest.dev/) adalah kerangka kerja terbaik karena memiliki performa sangat cepat dan kompatibilitas out-of-the-box dengan konfigurasi Vite yang ada.

* **Fokus Uji:**
  - Fungsi utilitas (formatting, parsing, dll).
  - Custom React Hooks (terutama Zustand store dan wrapper TanStack Query).
  - Integrasi komponen individual menggunakan [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

### 2. End-to-End (E2E) & PWA Testing dengan Playwright
Karena Frontend mendukung Progressive Web App (PWA), pengujian E2E berbasis browser sungguhan sangat krusial. [Playwright](https://playwright.dev/) direkomendasikan karena:
- Mendukung pengujian instalasi PWA dan Service Worker secara native.
- Mampu mensimulasikan berbagai ukuran layar (Mobile-First responsive check).
- Pengujian aliran otentikasi (login, session persistence, logout).
- Skenario pengajuan laporan kerusakan hingga diselesaikan oleh admin.
