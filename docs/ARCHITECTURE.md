# FixMind — Arsitektur Sistem & Alur Diagram (Flowchart)

Dokumen ini menyajikan gambaran arsitektur sistem FixMind serta diagram alur (flowchart) untuk proses-proses utama di dalam aplikasi.

---

## 1. Arsitektur Sistem Global

FixMind menggunakan arsitektur Client-Server terpisah dengan rincian komponen berikut:

```mermaid
graph TD
    Client[Frontend: React PWA] <-->|HTTP REST & WebSockets| Server[Backend: NestJS]
    Server <-->|Raw SQL / postgres.js| DB[(PostgreSQL + pgvector)]
    Server -->|API REST| Gemini[Google Gemini 2.5 Flash]
    Server -->|SDK Upload| Cloudinary[Cloudinary Media Storage]
```

### Penjelasan Komponen:
- **Frontend (PWA React):** Aplikasi web progresif yang di-deploy ke peramban pengguna, mendukung mode desktop dan seluler (instalasi tanpa APK). Berkomunikasi secara real-time via Socket.io-client.
- **Backend (NestJS):** Menyediakan API Gateway, otentikasi JWT, validasi data, serta menangani koneksi Socket.io untuk siaran notifikasi real-time.
- **Database (PostgreSQL + pgvector):** Menyimpan relasi tabel data operasional serta mendukung pencarian semantik (RAG) menggunakan indeks vektor.
- **Google Gemini 2.5 Flash:** Mesin AI penilai prioritas dan kategori laporan otomatis secara asinkron.
- **Cloudinary:** Penyimpanan eksternal untuk berkas gambar kerusakan/bukti pengerjaan perbaikan.

---

## 2. Diagram Alur Siklus Laporan & Analisis AI (Flowchart)

Berikut adalah diagram alur sejak pengguna membuat laporan kerusakan hingga laporan tersebut diproses secara otomatis oleh AI dan ditindaklanjuti oleh Admin:

```mermaid
flowchart TD
    Start([Mulai: Pelapor Menemukan Kerusakan]) --> Action1[User Input Form Laporan & Unggah Foto]
    Action1 --> Action2[Kirim POST /reports ke Backend]
    
    subgraph Backend [Server NestJS]
        Action2 --> SaveDB[Simpan Laporan ke DB dengan status PENDING]
        SaveDB --> BroadcastNew[Kirim Notifikasi Real-time via WebSockets ke Admin]
        SaveDB --> TriggerAI[Pemicu Asinkron: LlmProviderService]
    end

    subgraph AI [Analisis Kecerdasan Buatan]
        TriggerAI --> APIRequest[Kirim data aset, ruangan & deskripsi ke Gemini API]
        APIRequest --> APIResponse{Apakah Gemini API Sukses?}
        APIResponse -- Ya --> ParseAI[Parse JSON: Priority, Score, Recommendation, Estimated Hours]
        ParseAI --> UpdateDB[Simpan hasil analisis ke kolom ai_ dan update priority laporan]
        APIResponse -- Tidak --> LogFail[Catat Error di Log & Set status AI FAILED]
    end

    UpdateDB --> BroadcastAI[Kirim Notifikasi Update AI via WebSockets ke Admin]
    LogFail --> BroadcastAI

    BroadcastAI --> AdminReview[Admin melihat laporan di dashboard beserta rekomendasi AI]
    AdminReview --> AdminAssign[Admin menunjuk Teknisi dan menyesuaikan prioritas final]
    AdminAssign --> TechWork[Teknisi menerima tugas, memperbaiki kerusakan & mengubah status ke DONE]
    TechWork --> End([Selesai: Laporan Ditutup])
```

---

## 3. Diagram Alur Pengajuan Pemindahan Aset (Asset Transfer Flow)

Berikut adalah diagram alur untuk proses pengajuan pemindahan aset inventaris antar ruangan:

```mermaid
flowchart TD
    StartTransfer([Mulai: User mengajukan transfer]) --> Form[Pilih Ruang Asal, Aset, Ruang Tujuan, & Alasan]
    Form --> APIPost[POST /assets/transfers]
    APIPost --> SaveTransfer[Simpan di tabel asset_transfers dengan status PENDING]
    SaveTransfer --> NotifyAdmin[Notifikasi WebSocket dikirim ke Admin]
    
    NotifyAdmin --> Review{Review Admin}
    Review -- Setujui --> Approve[Ubah status transfer APPROVED]
    Approve --> UpdateAsset[Otomatis ubah room_id aset ke Ruang Tujuan di tabel assets]
    Review -- Tolak --> Reject[Ubah status transfer REJECTED]
    
    UpdateAsset --> NotifyUser[Kirim update status ke User via WebSockets]
    Reject --> NotifyUser
    NotifyUser --> EndTransfer([Selesai])
```
