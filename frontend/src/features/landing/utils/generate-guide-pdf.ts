import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Utilitas untuk membuat Dokumen PDF Panduan Pengguna Resmi ASETKITA Semarang
 * Menggunakan palet warna primer CSS (#F9D141 Gold & #1A1A1A Charcoal)
 * dengan narasi bahasa yang ramah, jelas, dan mudah dipahami oleh pengguna awam.
 */
export async function generateUserGuidePDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 18
  const contentWidth = pageWidth - margin * 2

  // Palet Warna Primer sesuai index.css (.gradient-primary: #F9D141 -> #1A1A1A)
  const primaryGold = [249, 209, 65] // #F9D141 (Kuning Emas Primer)
  const primaryDark = [26, 26, 26] // #1A1A1A (Charcoal Gelap Primer)
  const headingGold = [184, 134, 11] // #B8860B (Dark Gold kontras tinggi untuk teks judul di atas putih)
  const secondarySlate = [71, 85, 105] // #475569 (Teks sekunder abu-abu)
  const lightBg = [254, 252, 243] // #FEFCF3 (Krem lembut untuk kotak info)

  // ==========================================
  // HALAMAN 1: COVER & DAFTAR ISI RESMI
  // ==========================================
  
  // Header Banner Atas (Charcoal Gelap #1A1A1A)
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.rect(0, 0, pageWidth, 58, 'F')

  // Garis Aksen Emas Primer (#F9D141)
  doc.setFillColor(primaryGold[0], primaryGold[1], primaryGold[2])
  doc.rect(0, 58, pageWidth, 3.5, 'F')

  // Kop Instansi
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2])
  doc.text('DEWAN PERWAKILAN RAKYAT DAERAH KOTA SEMARANG', pageWidth / 2, 20, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(240, 240, 240)
  doc.text('Jaringan Dokumentasi dan Informasi Hukum (JDIH) & Bagian Sarana Prasarana', pageWidth / 2, 27, { align: 'center' })

  // Nama Platform
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('ASETKITA SEMARANG', pageWidth / 2, 42, { align: 'center' })

  let currentY = 74

  // Judul Utama Dokumen
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(21)
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.text('BUKU PANDUAN PENGGUNA', pageWidth / 2, currentY, { align: 'center' })
  currentY += 8

  doc.setFontSize(12)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('(PEDOMAN PRAKTIS PELAPORAN & PEMELIHARAAN FASILITAS)', pageWidth / 2, currentY, { align: 'center' })
  currentY += 10

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  doc.text('Panduan Sederhana Langkah demi Langkah untuk Seluruh Pegawai & Pengelola Gedung', pageWidth / 2, currentY, { align: 'center' })
  currentY += 14

  // Kotak Informasi Dokumen
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, 'F')
  doc.setDrawColor(primaryGold[0], primaryGold[1], primaryGold[2])
  doc.setLineWidth(0.5)
  doc.roundedRect(margin, currentY, contentWidth, 34, 3, 3, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.text('INFORMASI PENTING:', margin + 6, currentY + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  doc.text('• Sasaran Pembaca : Seluruh Pegawai, Staf, & Administrator Sekretariat DPRD Kota Semarang', margin + 6, currentY + 14)
  doc.text('• Tujuan Panduan  : Mempermudah pelaporan fasilitas rusak agar cepat ditangani teknisi', margin + 6, currentY + 20)
  doc.text('• Versi Sistem    : Edisi Terbaru 2.0 (Dilengkapi Asisten Pintar & Notifikasi Otomatis)', margin + 6, currentY + 26)

  currentY += 43

  // Judul Daftar Isi
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.text('DAFTAR ISI & POKOK BAHASAN', margin, currentY)
  currentY += 6

  autoTable(doc, {
    startY: currentY,
    head: [['Bab', 'Topik Panduan', 'Keterangan']],
    body: [
      ['Bab 1', 'Cara Membuka Aplikasi & Masuk Akun', 'Langkah login, pasang di layar HP (PWA), & solusi lupa sandi'],
      ['Bab 2', 'Panduan Pegawai: Lapor Kerusakan', '4 langkah mudah lapor AC mati, proyektor, kran bocor, dll'],
      ['Bab 3', 'Panduan Admin: Mengatur Perbaikan', 'Mengecek laporan masuk, menugaskan teknisi, & jadwal servis'],
      ['Bab 4', 'Arti Warna Status & Bantuan AI', 'Penjelasan warna Kuning, Biru, Hijau, Merah, & Asisten Cerdas'],
      ['Bab 5', 'Tanya Jawab (FAQ) & Pusat Bantuan', 'Solusi kendala foto, internet, serta nomor kontak bagian umum'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [26, 26, 26],
      textColor: [249, 209, 65],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold', textColor: [26, 26, 26] },
      1: { cellWidth: 62, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  // ==========================================
  // HALAMAN 2: BAB 1 & BAB 2 (PANDUAN PEGAWAI)
  // ==========================================
  doc.addPage()
  currentY = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 1: CARA MEMBUKA APLIKASI & MASUK KE AKUN', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  const textBab1 = 'ASETKITA Semarang dapat dibuka dari mana saja lewat HP maupun laptop tanpa perlu mengunduh aplikasi berat dari Play Store. Cukup gunakan browser internet yang sudah ada di perangkat Anda.'
  const splitBab1 = doc.splitTextToSize(textBab1, contentWidth)
  doc.text(splitBab1, margin, currentY)
  currentY += splitBab1.length * 4 + 3

  autoTable(doc, {
    startY: currentY,
    head: [['Langkah', 'Petunjuk Praktis untuk Pengguna']],
    body: [
      ['1. Masuk Akun', 'Buka browser di HP/Laptop > Ketikkan alamat website ASETKITA > Masukkan Email & Kata Sandi yang diberikan kantor > Klik tombol "Masuk".'],
      ['2. Pasang di Layar HP (PWA)', 'Agar mudah dibuka seperti aplikasi biasa: Di Android (Chrome), ketuk titik tiga di kanan atas > pilih "Tambahkan ke Layar Utama". Di iPhone (Safari), ketuk tombol Bagikan > pilih "Add to Home Screen".'],
      ['3. Jika Lupa Password', 'Jangan panik jika lupa kata sandi. Cukup hubungi Admin JDIH atau Bagian Umum di kantor untuk dibuatkan kata sandi baru.'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 8.5 },
    bodyStyles: { fontSize: 7.8, textColor: [30, 41, 59] },
    columnStyles: { 0: { cellWidth: 42, fontStyle: 'bold' } },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 2: PANDUAN PEGAWAI — CARA MUDAH MELAPOR KERUSAKAN', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  const textBab2 = 'Jika Anda menemukan AC mati, air kran bocor, proyektor ruangan tidak menyala, atau kursi patah, segera laporkan dengan 4 langkah mudah berikut agar cepat diperbaiki oleh tim teknisi.'
  const splitBab2 = doc.splitTextToSize(textBab2, contentWidth)
  doc.text(splitBab2, margin, currentY)
  currentY += splitBab2.length * 4 + 3

  autoTable(doc, {
    startY: currentY,
    head: [['Tahap', 'Apa yang Harus Dilakukan?', 'Contoh yang Baik & Jelas']],
    body: [
      ['1. Tekan Tombol Buat Laporan', 'Buka menu "Laporan Masalah" di sebelah kiri layar, lalu tekan tombol kuning "+ Buat Laporan" di pojok kanan atas.', 'Tombol berwarna kuning emas di atas daftar laporan.'],
      ['2. Tulis Judul Kerusakan', 'Tuliskan nama barang dan masalahnya secara singkat dan jelas dengan bahasa sehari-hari.', 'BAIK: "AC Ruang Rapat Lt. 2 Mati Tidak Dingin"\nKURANG: "Ada yang rusak tolong benerin"'],
      ['3. Pilih Ruangan & Barang', 'Pilih lokasi ruangan tempat Anda berada dari daftar pilihan yang tersedia (misal: Ruang Komisi A).', 'Pilih ruangan yang sesuai agar teknisi tidak salah alamat mencari lokasi.'],
      ['4. Foto & Kirim Laporan', 'Ambil foto barang yang rusak dengan kamera HP Anda, lalu tekan tombol "Kirim Laporan". Selesai!', 'Sertakan foto yang jelas dan tidak buram agar teknisi membawa alat yang pas.'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 26, 26], textColor: [249, 209, 65], fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  // ==========================================
  // HALAMAN 3: BAB 3 & BAB 4
  // ==========================================
  doc.addPage()
  currentY = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 3: PANDUAN ADMINISTRATOR & BAGIAN UMUM', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  const textBab3 = 'Panduan untuk pengelola fasilitas dalam membagikan tugas perbaikan ke teknisi dan memantau aset kantor.'
  const splitBab3 = doc.splitTextToSize(textBab3, contentWidth)
  doc.text(splitBab3, margin, currentY)
  currentY += splitBab3.length * 4 + 3

  autoTable(doc, {
    startY: currentY,
    head: [['Tugas Admin', 'Penjelasan Sederhana']],
    body: [
      ['1. Cek Laporan Masuk', 'Buka dasbor utama untuk melihat laporan terbaru dari para pegawai. Laporan yang mendesak akan ditandai prioritas tinggi oleh sistem.'],
      ['2. Tugaskan Teknisi', 'Pilih teknisi atau pihak perbaikan (vendor) yang bertugas menangani kerusakan tersebut dan beri catatan jika diperlukan.'],
      ['3. Perbarui Status Perbaikan', 'Ubah status menjadi "Sedang Dikerjakan" saat teknisi mulai bekerja, lalu ubah ke "Selesai" setelah fasilitas selesai diperbaiki.'],
      ['4. Pindah Barang (Mutasi Aset)', 'Tinjau dan setujui permohonan staf yang ingin memindahkan barang inventaris dari satu ruangan ke ruangan lain.'],
      ['5. Servis Berkala (Maintenance)', 'Atur kalender perawatan rutin untuk fasilitas penting gedung seperti AC sentral, genset listrik, lift, dan tata suara ruang rapat.'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 8.5 },
    bodyStyles: { fontSize: 7.8, textColor: [30, 41, 59] },
    columnStyles: { 0: { cellWidth: 46, fontStyle: 'bold' } },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 4: ARTI WARNA STATUS LAPORAN & ASISTEN PINTAR (AI)', margin, currentY)
  currentY += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  const textBab4 = 'Setiap laporan yang Anda kirim akan dipantau dengan kode warna yang mudah diingat. Sistem juga memiliki Asisten Cerdas (AI) yang otomatis membaca tingkat keparahan kerusakan agar perbaikan darurat bisa langsung didahulukan.'
  const splitBab4 = doc.splitTextToSize(textBab4, contentWidth)
  doc.text(splitBab4, margin, currentY)
  currentY += splitBab4.length * 4 + 3

  autoTable(doc, {
    startY: currentY,
    head: [['Warna Indikator', 'Nama Status', 'Apa Artinya Bagi Anda?']],
    body: [
      ['🟡 KUNING / AMBER', 'MENUNGGU (PENDING)', 'Laporan Anda sudah masuk ke sistem dan sedang menunggu admin menugaskan teknisi.'],
      ['🔵 BIRU / INDIGO', 'SEDANG DIKERJAKAN', 'Teknisi sudah ditugaskan dan sedang menuju lokasi / melakukan perbaikan.'],
      ['🟢 HIJAU / EMERALD', 'SELESAI (COMPLETED)', 'Barang atau fasilitas sudah selesai diperbaiki dan siap digunakan kembali.'],
      ['🔴 MERAH / ROSE', 'DITOLAK / DIBATALKAN', 'Laporan dibatalkan (misal: laporan ganda atau barang bukan aset kantor). Admin akan mencantumkan alasannya.'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [26, 26, 26], textColor: [249, 209, 65], fontSize: 8 },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold' },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  // ==========================================
  // HALAMAN 4: BAB 5 (FAQ) & PUSAT BANTUAN
  // ==========================================
  doc.addPage()
  currentY = 20

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 5: PERTANYAAN YANG SERING DITANYAKAN (FAQ)', margin, currentY)
  currentY += 6

  autoTable(doc, {
    startY: currentY,
    head: [['Pertanyaan Umum dari Pegawai', 'Jawaban & Solusi Praktis']],
    body: [
      [
        'T: Bagaimana jika saya lupa kata sandi akun?',
        'J: Anda tidak perlu bingung. Hubungi tim admin JDIH atau Bagian Umum di kantor, dan akun Anda akan di-reset dengan kata sandi baru dalam hitungan menit.',
      ],
      [
        'T: Kenapa laporan saya masih berstatus Kuning (Menunggu)?',
        'J: Admin memprioritaskan perbaikan berdasarkan tingkat kedaruratan. Kerusakan darurat (seperti kebocoran besar atau listrik korslet) akan ditangani lebih dahulu.',
      ],
      [
        'T: Bagaimana jika koneksi internet di kantor sedang lambat?',
        'J: Aplikasi ASETKITA tetap dapat mencatat laporan Anda secara offline. Begitu perangkat Anda terhubung kembali dengan WiFi/data, laporan akan otomatis terkirim.',
      ],
      [
        'T: Apakah saya bisa menambah foto setelah laporan dikirim?',
        'J: Bisa. Buka detail laporan Anda, lalu tulis pesan atau unggah foto tambahan pada kolom Komentar/Diskusi di bagian bawah.',
      ],
      [
        'T: Bagaimana cara meminta kursi/meja dipindah ke ruangan lain?',
        'J: Buka menu "Transfer Aset" di sidebar sebelah kiri, klik "+ Ajukan Mutasi", pilih nama barang dan ruangan tujuan, lalu klik Simpan untuk menunggu konfirmasi admin.',
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 26, 26], textColor: [249, 209, 65], fontSize: 8.5 },
    bodyStyles: { fontSize: 7.8, textColor: [30, 41, 59] },
    columnStyles: { 0: { cellWidth: 54, fontStyle: 'bold' } },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 12

  // Kotak Kontak Pusat Bantuan Resmi
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
  doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'F')
  doc.setDrawColor(primaryGold[0], primaryGold[1], primaryGold[2])
  doc.setLineWidth(0.6)
  doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.text('PUSAT LAYANAN BANTUAN & DUKUNGAN TEKNIS:', margin + 6, currentY + 7.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  doc.text('Gedung Sekretariat DPRD Kota Semarang — Jl. Pemuda No. 146, Kota Semarang, Jawa Tengah', margin + 6, currentY + 13.5)
  doc.text('Hubungi Admin Sub Bagian Sarana Prasarana & Tim JDIH untuk pendampingan teknis langsung.', margin + 6, currentY + 19)

  // ==========================================
  // FOOTER & NOMOR HALAMAN RESMI (SEMUA HALAMAN)
  // ==========================================
  const totalPages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(7.5)
    doc.setTextColor(140, 140, 140)
    doc.setFont('helvetica', 'normal')

    // Header kecil untuk halaman 2 ke atas
    if (i > 1) {
      doc.setDrawColor(230, 230, 230)
      doc.setLineWidth(0.3)
      doc.line(margin, 12, pageWidth - margin, 12)
      doc.text('ASETKITA Semarang — Panduan Pengguna Resmi DPRD Kota Semarang', margin, 9)
    }

    // Footer garis dan penomoran
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.3)
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12)
    doc.text('Sekretariat DPRD Kota Semarang | Sistem Pemeliharaan Sarana Prasarana Terpadu', margin, pageHeight - 7)
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: 'right' })
  }

  // Simpan berkas PDF dan download langsung di browser
  doc.save('Panduan_Pengguna_ASETKITA_Semarang.pdf')
}
