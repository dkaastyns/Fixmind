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

## Frontend Testing

Modul Frontend menggunakan **Vitest** sebagai kerangka kerja pengujian (testing framework) utama, dikombinasikan dengan **React Testing Library** dan **jsdom** untuk menguji komponen UI React.

### 1. Menjalankan Pengujian

Jalankan perintah berikut dari folder `frontend/`:

* **Unit & Component Tests:**
  ```powershell
  bun run test
  ```
* **Watch Mode (Sangat berguna saat development):**
  ```powershell
  bun run test:watch
  ```
* **Coverage Report (Laporan Cakupan Uji):**
  ```powershell
  bun run test:coverage
  ```

### 2. Pola Unit & Component Testing

Unit/component test ditulis berdampingan dengan kode yang diuji menggunakan ekstensi `.spec.tsx`. File konfigurasi utama berada di [vitest.config.ts](file:///d:/FixMind/frontend/vitest.config.ts) dan file inisialisasi lingkungan pengujian berada di [src/test/setup.ts](file:///d:/FixMind/frontend/src/test/setup.ts).

#### Contoh Menguji Komponen UI (`Button`)
Berikut adalah pola pengujian komponen React 19 menggunakan React Testing Library yang diimplementasikan pada [button.spec.tsx](file:///d:/FixMind/frontend/src/components/ui/button.spec.tsx):

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from './button'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'

describe('Button Component', () => {
  it('renders correctly with default styles and text', () => {
    render(<Button>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /click me/i })
    expect(buttonElement).toBeInTheDocument()
    expect(buttonElement).toHaveAttribute('type', 'button')
  })

  it('triggers onClick handler when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click Me</Button>)
    const buttonElement = screen.getByRole('button', { name: /click me/i })
    
    await userEvent.click(buttonElement)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>)
    const buttonElement = screen.getByRole('button', { name: /disabled button/i })
    expect(buttonElement).toBeDisabled()
  })
})
```

### 3. Rekomendasi End-to-End (E2E) & PWA Testing

Karena Frontend mendukung Progressive Web App (PWA), pengujian E2E berbasis browser sungguhan sangat krusial menggunakan **Playwright**.
* **Aliran Otentikasi:** Tes skenario login, penyimpanan session, dan logout.
* **Fungsi PWA:** Tes kompatibilitas service worker dan instalasi PWA di Chrome/Safari.
* **Responsivitas:** Verifikasi tampilan dashboard admin dan form pelaporan di ukuran layar mobile (Mobile-First).
