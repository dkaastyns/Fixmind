# ASETKITA Semarang — Dokumentasi Kecerdasan Buatan (AI)

Dokumen ini menjelaskan filosofi, ruang lingkup, integrasi, dan konfigurasi modul Kecerdasan Buatan (*Artificial Intelligence*) pada aplikasi **E-Lapor DPRD (ASETKITA Semarang)**.

---

## Filosofi Penggunaan AI

Kecerdasan Buatan dalam ASETKITA Semarang bersifat **penasihat (advisory only)**. Administrator tetap memegang kendali penuh untuk menugaskan teknisi dan menentukan prioritas final laporan. Sistem tidak pernah menutup laporan (*auto-close*) atau menugaskan teknisi secara otomatis (*auto-assign*) hanya berdasarkan keluaran AI semata.

---

## Ruang Lingkup Kemampuan AI

Modul AI menyediakan dua kemampuan utama dalam satu analisis:

### 1. Klasifikasi Prioritas & Skor Bahaya (Priority & Score)
- **Input:** Nama aset, nama ruangan, dan deskripsi detail kerusakan dari pelapor.
- **Output (JSON Payload):**
```json
{
  "priority": "HIGH",
  "score": 78,
  "reason": "Kebocoran air di dekat panel listrik berisiko tinggi terhadap keselamatan",
  "recommendation": "Matikan aliran air utama dan periksa instalasi pipa",
  "estimatedRepairHours": 4,
  "suggestedAction": "Tugaskan teknisi saluran air dan listrik dalam waktu 4 jam"
}
```

### 2. Rekomendasi Langkah Penanganan & Estimasi Durasi
Termasuk dalam keluaran respon JSON di atas (`recommendation`, `estimatedRepairHours`, `suggestedAction`).

---

## Implementasi & Integrasi Kode

- **Modul Backend:** `backend/src/modules/ai/`
- **Provider AI Utama:** Google Gemini 2.5 Flash API (dengan opsi *fallback* Groq AI Llama 3.1)
- **Eksekusi:** Dipicu secara asinkron (*asynchronous trigger*) pada `ReportsService` sesaat setelah laporan berhasil disimpan ke database.
- **Penanganan Kegagalan (Failure Mode):** Jika terjadi gangguan pada API AI, `ai_analysis_status` di-set menjadi `FAILED`. Proses pembuatan tiket laporan pelapor **sama sekali tidak terganggu** dan tetap berhasil disimpan.

---

## Konfigurasi Variabel Lingkungan (.env)

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=kunci-api-gemini-anda
GEMINI_MODEL=gemini-2.5-flash
GROQ_API_KEY=kunci-api-groq-opsional
```

---

## Keandalan & Monitoring (Reliability)

- Batas waktu *timeout* 15 detik per request AI.
- Penanganan error dicatat di log server secara otomatis, mengembalikan respon null tanpa menghentikan aplikasi.
- Tabel `ai_usage_logs` mencatat metrik eksekusi API dan jumlah token untuk pemantauan penggunaan.
