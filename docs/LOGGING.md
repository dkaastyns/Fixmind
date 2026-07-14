# FixMind — Dokumentasi Logging & Monitoring

Dokumen ini menjelaskan strategi logging (pencatatan log aktivitas/kesalahan) dan rekomendasi monitoring (pemantauan) untuk aplikasi FixMind di lingkungan pengembangan (local) maupun produksi.

---

## Arsitektur Logging

FixMind menggunakan logging terpusat berbasis bawaan NestJS [Logger](https://docs.nestjs.com/techniques/logger) untuk backend. Seluruh log diarahkan ke `stdout` (Standard Output) dan `stderr` (Standard Error) secara default. Hal ini mengikuti prinsip *Twelve-Factor App* di mana log diperlakukan sebagai event stream.

### 1. Inisialisasi Logger
Pada setiap *Service*, *Controller*, atau *Repository*, buat instance logger dengan menentukan nama kelas sebagai context pencatatan:

```typescript
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LlmProviderService {
  private readonly logger = new Logger(LlmProviderService.name);

  async analyzeReport() {
    this.logger.log('Mengirim laporan ke Gemini...');
    // ...
  }
}
```

### 2. Log Levels yang Digunakan
- **`log` / `info`:** Informasi umum seputar jalannya aplikasi (misal: inisialisasi modul, koneksi database sukses, server mendengarkan port tertentu).
- **`warn`:** Kondisi tidak biasa namun bukan error fatal (misal: response AI timeout lalu menggunakan fallback, percobaan otentikasi gagal).
- **`error`:** Error fatal yang mengganggu jalannya aplikasi atau transaksi (misal: kegagalan koneksi database, query error, crash sistem). Log error harus menyertakan pesan kesalahan dan *stack trace*.
- **`debug`:** Log mendalam yang hanya aktif saat mode debug untuk penelusuran masalah (misal: detail payload request/response).

---

## Penanganan Error Global & Logging Exception

Semua error yang terjadi di HTTP layer ditangani secara global oleh [AllExceptionsFilter](file:///d:/FixMind/backend/src/common/filters/all-exceptions.filter.ts).

Filter ini secara otomatis:
1. Memeriksa tipe exception.
2. Jika merupakan error internal (`Error` non-HttpException), ia akan mencatat detail error dan *stack trace* menggunakan `logger.error`:
   ```typescript
   } else if (exception instanceof Error) {
     this.logger.error(exception.message, exception.stack);
     status = HttpStatus.INTERNAL_SERVER_ERROR;
     message = 'Internal server error';
   }
   ```
3. Mengembalikan response seragam berbentuk JSON ke pengguna (`{ success: false, message: '...' }`) untuk menyembunyikan stack trace sistem dari luar demi alasan keamanan.

---

## Log Penggunaan AI (`ai_usage_logs`)

Untuk memantau biaya penggunaan API Gemini, skema database FixMind menyediakan tabel [ai_usage_logs](file:///d:/FixMind/docs/DATABASE.md#ai_usage_logs). Tabel ini dirancang untuk mencatat setiap transaksi LLM:
- Token input & token output.
- Nama model yang digunakan (`gemini-2.5-flash`, dll).
- ID user yang memicu analisis.
- Waktu pengerjaan (latency).

---

## Rekomendasi Monitoring Produksi

Karena aplikasi menulis log langsung ke stdout/stderr, di lingkungan produksi log tersebut harus dikelola oleh sistem eksternal:

### 1. Manajemen Log (Docker / PM2)
- **Jika menggunakan Docker:** Konfigurasi Docker log driver (seperti `json-file` dengan pembatasan ukuran maks, atau forward ke `journald`/`syslog`).
- **Jika menggunakan PM2:** Gunakan utilitas seperti `pm2-logrotate` untuk mencegah file log memenuhi kapasitas penyimpanan server.

### 2. Agregasi Log & APM (Application Performance Monitoring)
Untuk melacak performa secara real-time dan menganalisis tren error, disarankan mengintegrasikan tools berikut:
- **Loki + Grafana:** Solusi hemat resource untuk memantau log dari container Docker.
- **ELK Stack (Elasticsearch, Logstash, Kibana):** Pilihan industri untuk pencarian log berskala besar.
- **Sentry:** Hubungkan Sentry ke NestJS Exception Filter untuk menangkap error produksi secara otomatis lengkap dengan context request & user.
- **Prometheus + Grafana:** Menarik metrik internal NestJS (seperti penggunaan CPU, RAM, jumlah koneksi aktif WebSocket, dan latency database).
