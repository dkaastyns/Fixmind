import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Utilitas untuk membuat Dokumen PDF Panduan Pengguna Resmi ASETKITA Semarang
 * Menggunakan palet warna primer CSS (#F9D141 Gold & #1A1A1A Charcoal)
 * dengan perataan posisi lingkaran indikator warna dan pembagian halaman yang presisi (4 halaman penuh).
 */
export async function generateUserGuidePDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 16
  const contentWidth = pageWidth - margin * 2

  // Palet Warna Primer sesuai index.css (.gradient-primary: #F9D141 -> #1A1A1A)
  const primaryGold = [249, 209, 65] // #F9D141 (Kuning Emas Primer)
  const primaryDark = [26, 26, 26] // #1A1A1A (Charcoal Gelap Primer)
  const headingGold = [184, 134, 11] // #B8860B (Dark Gold kontras tinggi untuk teks judul)
  const secondarySlate = [71, 85, 105] // #475569 (Teks sekunder abu-abu)
  const lightBg = [254, 252, 243] // #FEFCF3 (Krem lembut untuk kotak info)

  // ==========================================
  // HALAMAN 1: COVER & DAFTAR ISI RESMI
  // ==========================================

  // Header Banner Atas (Charcoal Gelap #1A1A1A)
  doc.setFillColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.rect(0, 0, pageWidth, 54, 'F')

  // Garis Aksen Emas Primer (#F9D141)
  doc.setFillColor(primaryGold[0], primaryGold[1], primaryGold[2])
  doc.rect(0, 54, pageWidth, 3.5, 'F')

  // Kop Instansi
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(primaryGold[0], primaryGold[1], primaryGold[2])
  doc.text('DEWAN PERWAKILAN RAKYAT DAERAH KOTA SEMARANG', pageWidth / 2, 18, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(240, 240, 240)
  doc.text('Jaringan Dokumentasi dan Informasi Hukum (JDIH) & Bagian Sarana Prasarana', pageWidth / 2, 25, { align: 'center' })

  // Nama Platform
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(255, 255, 255)
  doc.text('ASETKITA SEMARANG', pageWidth / 2, 40, { align: 'center' })

  let currentY = 70

  // Judul Utama Dokumen
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.text('BUKU PANDUAN PENGGUNA', pageWidth / 2, currentY, { align: 'center' })
  currentY += 7.5

  doc.setFontSize(11.5)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('(PEDOMAN PRAKTIS PELAPORAN & PEMELIHARAAN FASILITAS)', pageWidth / 2, currentY, { align: 'center' })
  currentY += 9

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  doc.text('Panduan Operasional Sederhana untuk Seluruh Staf, Pegawai, & Pengelola Gedung', pageWidth / 2, currentY, { align: 'center' })
  currentY += 12

  // Kotak Informasi Dokumen
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
  doc.roundedRect(margin, currentY, contentWidth, 33, 3, 3, 'F')
  doc.setDrawColor(primaryGold[0], primaryGold[1], primaryGold[2])
  doc.setLineWidth(0.6)
  doc.roundedRect(margin, currentY, contentWidth, 33, 3, 3, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.text('INFORMASI PENTING DOKUMEN:', margin + 6, currentY + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.2)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  doc.text('- Sasaran Pembaca : Seluruh Pegawai, Anggota Dewan, & Admin Sekretariat DPRD Kota Semarang', margin + 6, currentY + 13)
  doc.text('- Tujuan Panduan  : Mempermudah pelaporan fasilitas rusak agar segera ditangani teknisi', margin + 6, currentY + 19)
  doc.text('- Versi Sistem    : Edisi 2.0 (Dilengkapi Asisten Cerdas AI Priority & Pelaporan Offline)', margin + 6, currentY + 25)

  currentY += 41

  // Judul Daftar Isi
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.text('DAFTAR ISI & STRUKTUR PANDUAN', margin, currentY)
  currentY += 5

  autoTable(doc, {
    startY: currentY,
    head: [['Bab', 'Topik Panduan', 'Pokok Pembahasan']],
    body: [
      ['Bab 1', 'Cara Membuka Aplikasi & Masuk Akun', 'Langkah login, pasang di layar HP (PWA), & solusi jika lupa sandi'],
      ['Bab 2', 'Panduan Pegawai: Lapor Kerusakan', '4 langkah mudah lapor AC, lampu, kran bocor, tips foto & contoh'],
      ['Bab 3', 'Panduan Admin: Mengatur Perbaikan', 'Mengecek laporan masuk, menugaskan teknisi, & jadwal servis rutin'],
      ['Bab 4', 'Arti Warna Status & Waktu Respon (SLA)', 'Penjelasan 4 warna status, target waktu perbaikan, & Asisten AI'],
      ['Bab 5', 'Tanya Jawab (FAQ) & Pusat Bantuan', 'Solusi kendala offline, mutasi aset, serta kontak bagian umum'],
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
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 18, fontStyle: 'bold', textColor: [26, 26, 26] },
      1: { cellWidth: 64, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
    },
    margin: { left: margin, right: margin },
  })

  // ==========================================
  // HALAMAN 2: BAB 1 & BAB 2 (PANDUAN PEGAWAI)
  // ==========================================
  doc.addPage()
  currentY = 16

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 1: CARA MEMBUKA APLIKASI & MASUK KE AKUN', margin, currentY)
  currentY += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  const textBab1 = 'ASETKITA Semarang dapat dibuka langsung lewat HP maupun laptop tanpa perlu mengunduh aplikasi berat dari Play Store/App Store. Cukup gunakan browser internet yang sudah ada di perangkat Anda.'
  const splitBab1 = doc.splitTextToSize(textBab1, contentWidth)
  doc.text(splitBab1, margin, currentY)
  currentY += splitBab1.length * 3.5 + 2

  autoTable(doc, {
    startY: currentY,
    head: [['Langkah', 'Petunjuk Praktis untuk Pengguna']],
    body: [
      ['1. Buka Website', 'Buka browser di HP/Laptop (Google Chrome atau Safari) > Masukkan alamat website ASETKITA.'],
      ['2. Masuk Akun (Login)', 'Masukkan Email kantor dan Kata Sandi Anda > Tekan tombol kuning "Masuk".'],
      ['3. Pasang di Layar HP (PWA)', 'Di Android (Chrome): Ketuk titik tiga di kanan atas > pilih "Tambahkan ke Layar Utama". Di iPhone (Safari): Ketuk ikon Bagikan > pilih "Add to Home Screen". Ikon ASETKITA akan langsung muncul di layar HP.'],
      ['4. Jika Lupa Kata Sandi', 'Cukup hubungi Admin JDIH atau Bagian Umum di kantor untuk dibuatkan kata sandi baru dalam hitungan menit.'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.4, textColor: [30, 41, 59], cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 38, fontStyle: 'bold' } },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 2: PANDUAN PEGAWAI — CARA MUDAH MELAPOR KERUSAKAN', margin, currentY)
  currentY += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  const textBab2 = 'Jika menemukan AC mati, lampu padam, proyektor tidak menyala, kran bocor, atau kursi rusak, laporkan dengan 4 langkah mudah berikut:'
  const splitBab2 = doc.splitTextToSize(textBab2, contentWidth)
  doc.text(splitBab2, margin, currentY)
  currentY += splitBab2.length * 3.5 + 2

  autoTable(doc, {
    startY: currentY,
    head: [['Tahap', 'Apa yang Harus Dilakukan?', 'Contoh & Tips Penting']],
    body: [
      ['1. Tekan Tombol Lapor', 'Buka menu "Laporan Masalah" di menu sebelah kiri, lalu tekan tombol kuning "+ Buat Laporan" di pojok kanan atas.', 'Tombol kuning emas di atas daftar laporan.'],
      ['2. Tulis Judul & Kendala', 'Tuliskan nama barang dan kerusakannya secara singkat dengan bahasa sehari-hari.', 'BAIK: "AC Ruang Rapat Lt. 2 Mati Bocor Air"\nKURANG: "Ada rusak tolong dibenerin"'],
      ['3. Pilih Ruangan & Barang', 'Pilih lokasi ruangan tempat Anda berada dari daftar (misal: Ruang Komisi A atau Ruang Rapat Fraksi).', 'Pastikan ruangan sesuai agar teknisi langsung menuju lokasi yang tepat.'],
      ['4. Ambil Foto & Kirim', 'Ambil foto bagian yang rusak dengan kamera HP Anda, lalu tekan tombol "Kirim Laporan". Selesai!', 'Sertakan foto yang jelas dan terang agar teknisi membawa alat yang pas.'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 26, 26], textColor: [249, 209, 65], fontSize: 8 },
    bodyStyles: { fontSize: 7.3, textColor: [51, 65, 85], cellPadding: 2 },
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
  currentY = 16

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 3: PANDUAN ADMINISTRATOR & BAGIAN PENGELOLA GEDUNG', margin, currentY)
  currentY += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  const textBab3 = 'Panduan untuk pengelola fasilitas dalam membagikan tugas perbaikan ke teknisi dan memantau aset kantor.'
  const splitBab3 = doc.splitTextToSize(textBab3, contentWidth)
  doc.text(splitBab3, margin, currentY)
  currentY += splitBab3.length * 3.5 + 2

  autoTable(doc, {
    startY: currentY,
    head: [['Tugas Admin', 'Penjelasan Sederhana']],
    body: [
      ['1. Cek Laporan Masuk', 'Buka dasbor utama untuk melihat laporan terbaru dari para pegawai. Kerusakan darurat otomatis ditandai prioritas tinggi oleh sistem.'],
      ['2. Tugaskan Teknisi', 'Pilih teknisi internal atau pihak vendor perbaikan yang bertugas menangani kerusakan tersebut dan berikan instruksi teknis.'],
      ['3. Perbarui Status Perbaikan', 'Ubah status menjadi "Sedang Dikerjakan" saat teknisi mulai bekerja, lalu ubah ke "Selesai" setelah fasilitas selesai diperbaiki.'],
      ['4. Pindah Barang (Mutasi Aset)', 'Tinjau dan setujui permohonan staf yang ingin memindahkan barang inventaris dari satu ruangan ke ruangan lain.'],
      ['5. Servis Berkala (Maintenance)', 'Atur kalender perawatan rutin untuk fasilitas penting gedung seperti AC sentral, genset listrik, lift, dan tata suara ruang rapat.'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontSize: 8 },
    bodyStyles: { fontSize: 7.3, textColor: [30, 41, 59], cellPadding: 2 },
    columnStyles: { 0: { cellWidth: 44, fontStyle: 'bold' } },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 4: ARTI WARNA STATUS LAPORAN & TARGET WAKTU (SLA)', margin, currentY)
  currentY += 5

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  const textBab4 = 'Setiap laporan dipantau dengan 4 kode warna yang jelas. Sistem juga dilengkapi Asisten Cerdas (AI) yang otomatis membaca tingkat keparahan agar perbaikan darurat langsung didahulukan.'
  const splitBab4 = doc.splitTextToSize(textBab4, contentWidth)
  doc.text(splitBab4, margin, currentY)
  currentY += splitBab4.length * 3.5 + 2

  autoTable(doc, {
    startY: currentY,
    head: [['Warna Indikator', 'Nama Status', 'Arti Bagi Pengguna', 'Target Waktu (SLA)']],
    body: [
      ['KUNING', 'MENUNGGU (PENDING)', 'Laporan diterima, menunggu admin menugaskan teknisi.', 'Maks. 1 - 2 Jam'],
      ['BIRU', 'SEDANG DIKERJAKAN', 'Teknisi sudah ditugaskan dan sedang memperbaiki.', '1 - 24 Jam Kerja'],
      ['HIJAU', 'SELESAI (COMPLETED)', 'Fasilitas selesai diperbaiki dan siap digunakan kembali.', 'Tuntas 100%'],
      ['MERAH', 'DITOLAK / DIBATALKAN', 'Laporan dibatalkan dengan catatan alasan dari admin.', 'Langsung Tercatat'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [26, 26, 26], textColor: [249, 209, 65], fontSize: 8 },
    bodyStyles: { fontSize: 7.3, textColor: [30, 41, 59], cellPadding: 2.2 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', cellPadding: { left: 9, top: 2.2, bottom: 2.2 } },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 32, fontStyle: 'bold', halign: 'center' },
    },
    didDrawCell: (data) => {
      // Gambar lingkaran warna asli vector di sisi kiri tanpa menimpa huruf
      if (data.section === 'body' && data.column.index === 0) {
        const colors = [
          [245, 158, 11], // Kuning Amber
          [59, 130, 246], // Biru
          [34, 197, 94],  // Hijau
          [239, 68, 68],  // Merah
        ]
        const col = colors[data.row.index]
        if (col) {
          doc.setFillColor(col[0], col[1], col[2])
          doc.circle(data.cell.x + 4.2, data.cell.y + data.cell.height / 2, 2, 'F')
        }
      }
    },
    margin: { left: margin, right: margin },
  })

  // ==========================================
  // HALAMAN 4: BAB 5 (FAQ) & PUSAT BANTUAN
  // ==========================================
  doc.addPage()
  currentY = 16

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11.5)
  doc.setTextColor(headingGold[0], headingGold[1], headingGold[2])
  doc.text('BAB 5: PERTANYAAN YANG SERING DITANYAKAN (FAQ)', margin, currentY)
  currentY += 5

  autoTable(doc, {
    startY: currentY,
    head: [['Pertanyaan Umum Pegawai', 'Jawaban & Solusi Praktis']],
    body: [
      [
        'T: Bagaimana jika koneksi internet di kantor sedang lambat/mati?',
        'J: Aplikasi ASETKITA tetap dapat mencatat laporan Anda secara offline. Begitu HP Anda terhubung kembali ke internet/WiFi kantor, laporan akan otomatis terkirim tanpa data hilang.',
      ],
      [
        'T: Bagaimana jika saya lupa kata sandi akun?',
        'J: Anda tidak perlu bingung. Hubungi tim admin JDIH atau Bagian Umum di kantor, akun Anda akan di-reset dengan kata sandi baru dalam hitungan menit.',
      ],
      [
        'T: Kenapa laporan saya masih berstatus Kuning (Menunggu)?',
        'J: Admin memprioritaskan perbaikan berdasarkan tingkat kedaruratan. Kerusakan darurat (seperti korsleting listrik atau kebocoran) akan ditangani lebih dahulu.',
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
    bodyStyles: { fontSize: 7.4, textColor: [30, 41, 59], cellPadding: 2.2 },
    columnStyles: { 0: { cellWidth: 52, fontStyle: 'bold' } },
    margin: { left: margin, right: margin },
  })

  currentY = (doc as any).lastAutoTable.finalY + 8

  // Kotak Kontak Pusat Bantuan Resmi
  doc.setFillColor(lightBg[0], lightBg[1], lightBg[2])
  doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'F')
  doc.setDrawColor(primaryGold[0], primaryGold[1], primaryGold[2])
  doc.setLineWidth(0.6)
  doc.roundedRect(margin, currentY, contentWidth, 26, 3, 3, 'D')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(primaryDark[0], primaryDark[1], primaryDark[2])
  doc.text('PUSAT LAYANAN BANTUAN & DUKUNGAN TEKNIS:', margin + 6, currentY + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(secondarySlate[0], secondarySlate[1], secondarySlate[2])
  doc.text('Gedung Sekretariat DPRD Kota Semarang - Jl. Pemuda No. 146, Kota Semarang, Jawa Tengah', margin + 6, currentY + 13)
  doc.text('Hubungi Admin Sub Bagian Sarana Prasarana & Tim JDIH untuk pendampingan teknis langsung.', margin + 6, currentY + 18.5)

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
      doc.line(margin, 11, pageWidth - margin, 11)
      doc.text('ASETKITA Semarang - Panduan Pengguna Resmi DPRD Kota Semarang', margin, 8.5)
    }

    // Footer garis dan penomoran
    doc.setDrawColor(230, 230, 230)
    doc.setLineWidth(0.3)
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11)
    doc.text('Sekretariat DPRD Kota Semarang | Sistem Pemeliharaan Sarana Prasarana Terpadu', margin, pageHeight - 6.5)
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, pageHeight - 6.5, { align: 'right' })
  }

  // Simpan berkas PDF dan download langsung di browser
  doc.save('Panduan_Pengguna_ASETKITA_Semarang.pdf')
}
