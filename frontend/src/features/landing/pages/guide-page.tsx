import { useState, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  FileText,
  ShieldCheck,
  Download,
  Search,
  Sparkles,
  UserCheck,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Cpu,
  ArrowRight,
  Loader2,
  Clock,
  Wrench,
  Boxes,
  FileCheck,
  Check,
  X,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateUserGuidePDF } from '../utils/generate-guide-pdf'
import { toast } from 'sonner'

interface GuideSection {
  id: string
  category: 'pegawai' | 'admin' | 'ai' | 'faq' | 'umum'
  icon: typeof BookOpen
  title: string
  badge: string
  summary: string
  steps?: {
    step: string
    title: string
    desc: string
    tip?: string
    goodExample?: string
    badExample?: string
  }[]
  faqs?: {
    q: string
    a: string
  }[]
}

const guideSections: GuideSection[] = [
  {
    id: 'akses-dan-pwa',
    category: 'umum',
    icon: Smartphone,
    title: 'Bab 1: Cara Membuka Aplikasi & Masuk Akun',
    badge: 'LANGKAH AWAL',
    summary: 'Petunjuk praktis membuka aplikasi di HP dan laptop tanpa perlu download dari PlayStore/AppStore.',
    steps: [
      {
        step: '1.1',
        title: 'Buka Lewat HP atau Laptop',
        desc: 'Buka browser internet yang ada di HP Anda (seperti Google Chrome atau Safari), lalu ketikkan alamat web ASETKITA Semarang.',
        tip: 'Aplikasi ini sangat ringan dan hemat kuota karena tidak membutuhkan unduhan file besar.',
      },
      {
        step: '1.2',
        title: 'Pasang Ikon di Layar HP (Bisa Dibuka Seperti Aplikasi Biasa)',
        desc: 'Di Android (Chrome): Ketuk titik tiga di pojok kanan atas > pilih "Tambahkan ke Layar Utama". Di iPhone (Safari): Ketuk tombol Bagikan (ikon kotak panah ke atas) > pilih "Add to Home Screen".',
        tip: 'Setelah terpasang, ikon ASETKITA akan muncul di layar HP Anda sehingga tinggal diklik kapan saja.',
      },
      {
        step: '1.3',
        title: 'Masuk dengan Email & Kata Sandi',
        desc: 'Ketikkan alamat email kantor dan kata sandi yang telah dibagikan. Pastikan huruf besar/kecil sudah sesuai sebelum menekan tombol "Masuk".',
      },
      {
        step: '1.4',
        title: 'Bagaimana Jika Lupa Kata Sandi?',
        desc: 'Tidak perlu panik. Anda cukup menghubungi Tim Admin JDIH atau Bagian Umum di kantor, akun Anda akan langsung dibuatkan kata sandi baru dalam hitungan menit.',
      },
    ],
  },
  {
    id: 'panduan-pegawai',
    category: 'pegawai',
    icon: UserCheck,
    title: 'Bab 2: Panduan Pegawai — Cara Melaporkan Kerusakan Fasilitas',
    badge: 'PANDUAN STAF',
    summary: '4 langkah sangat mudah saat menemukan AC mati, lampu padam, proyektor rusak, kran bocor, atau kursi patah.',
    steps: [
      {
        step: '2.1',
        title: 'Tekan Tombol "+ Buat Laporan"',
        desc: 'Buka menu "Laporan Masalah" pada bilah menu di sebelah kiri layar, lalu klik tombol kuning bertuliskan "+ Buat Laporan" di pojok kanan atas.',
      },
      {
        step: '2.2',
        title: 'Tulis Judul & Kendala dengan Bahasa Sehari-hari',
        desc: 'Tuliskan nama fasilitas dan apa kerusakannya secara singkat agar teknisi langsung paham apa yang perlu disiapkan.',
        goodExample: 'Contoh Bagus: "AC Ruang Rapat Paripurna Lt. 2 Mati Tidak Dingin" atau "Kran Air Wastafel Toilet Lt. 1 Patah Bocor"',
        badExample: 'Contoh Kurang Jelas: "Ada rusak tolong benerin" atau "Rusak parah"',
      },
      {
        step: '2.3',
        title: 'Pilih Ruangan Tempat Barang Berada',
        desc: 'Pilih nama ruangan dari daftar yang muncul (misalnya: "Ruang Komisi A", "Ruang Rapat Fraksi", dsb) agar teknisi tidak tersesat mencari lokasi barang.',
      },
      {
        step: '2.4',
        title: 'Foto Barang yang Rusak lalu Kirim',
        desc: 'Ambil foto bagian yang rusak menggunakan kamera HP Anda, lalu tekan tombol "Kirim Laporan". Laporan Anda langsung diterima oleh pengelola gedung.',
        tip: 'Foto yang jelas dan terang membantu teknisi membawa peralatan perbaikan yang tepat dari gudang.',
      },
      {
        step: '2.5',
        title: 'Ingin Memindahkan Barang ke Ruangan Lain? (Pindah Aset)',
        desc: 'Jika ingin memindahkan meja, kursi, atau komputer ke ruangan lain, buka menu "Transfer Aset" > klik "+ Ajukan Mutasi" > pilih nama barang dan ruangan tujuan > tunggu persetujuan Admin.',
      },
    ],
  },
  {
    id: 'panduan-admin',
    category: 'admin',
    icon: ShieldAlert,
    title: 'Bab 3: Panduan Admin & Bagian Pengelola Gedung',
    badge: 'PENGELOLA FASILITAS',
    summary: 'Cara memeriksa laporan masuk dari staf, membagikan tugas ke teknisi, dan memantau aset kantor.',
    steps: [
      {
        step: '3.1',
        title: 'Cek Laporan Masuk di Dasbor',
        desc: 'Buka halaman utama dasbor. Sistem akan menampilkan seluruh keluhan fasilitas terbaru. Laporan darurat akan otomatis ditandai di barisan paling atas.',
      },
      {
        step: '3.2',
        title: 'Tugaskan Teknisi / Petugas Perbaikan',
        desc: 'Buka rincian laporan > pilih nama teknisi internal atau vendor rekanan yang bertugas > berikan catatan instruksi jika dibutuhkan.',
      },
      {
        step: '3.3',
        title: 'Perbarui Status Jika Sudah Selesai',
        desc: 'Ubah status menjadi "Sedang Dikerjakan" saat teknisi mulai menangani, dan ubah ke "Selesai" setelah fasilitas kembali normal dan siap dipakai.',
      },
      {
        step: '3.4',
        title: 'Atur Jadwal Servis Rutin (Maintenance)',
        desc: 'Susun agenda servis berkala fasilitas vital kantor seperti AC Central, lift gedung, genset listrik, dan sound system ruang sidang sebelum rusak mendadak.',
      },
    ],
  },
  {
    id: 'ai-priority-flow',
    category: 'ai',
    icon: Cpu,
    title: 'Bab 4: Arti Warna Status Laporan & Asisten Cerdas (AI)',
    badge: 'PENJELASAN STATUS',
    summary: 'Arti 4 warna indikator laporan dan bagaimana sistem pintar memprioritaskan perbaikan darurat.',
    steps: [
      {
        step: '🟡 KUNING',
        title: 'MENUNGGU (PENDING)',
        desc: 'Laporan Anda sudah tersimpan dengan aman di sistem dan sedang menunggu konfirmasi admin untuk menugaskan teknisi.',
        tip: 'Target Waktu Respon: Maksimal 1 - 2 Jam Kerja.',
      },
      {
        step: '🔵 BIRU',
        title: 'SEDANG DIKERJAKAN (IN PROGRESS)',
        desc: 'Teknisi perbaikan sudah menerima tugas dan sedang menuju lokasi atau sedang memperbaiki fasilitas.',
        tip: 'Target Waktu Perbaikan: 1 - 24 Jam Kerja tergantung tingkat kesulitan barang.',
      },
      {
        step: '🟢 HIJAU',
        title: 'SELESAI (COMPLETED)',
        desc: 'Perbaikan sudah tuntas 100% dan fasilitas sudah normal kembali untuk mendukung aktivitas kerja Anda.',
        tip: 'Anda dapat memberikan ulasan atau tanda bintang atas hasil kerja teknisi.',
      },
      {
        step: '🔴 MERAH',
        title: 'DIBATALKAN / DITOLAK (REJECTED)',
        desc: 'Laporan dibatalkan (misal karena laporan dobel/ganda atau barang bukan inventaris kantor). Admin selalu menyertakan alasan pembatalan.',
      },
      {
        step: '🤖 ASISTEN AI',
        title: 'Bagaimana Asisten Cerdas Membantu?',
        desc: 'Sistem memiliki kecerdasan buatan yang otomatis membaca tulisan laporan Anda. Jika ada kata darurat seperti "korslet", "bocor besar", atau "asap", sistem langsung menaikkan prioritas penanganan ke barisan teratas.',
      },
    ],
  },
  {
    id: 'faq-bantuan',
    category: 'faq',
    icon: HelpCircle,
    title: 'Bab 5: Pertanyaan yang Sering Ditanyakan (FAQ)',
    badge: 'PUSAT BANTUAN',
    summary: 'Jawaban praktis atas pertanyaan yang paling sering dialami oleh staf dan pegawai.',
    faqs: [
      {
        q: 'Bagaimana jika koneksi internet di ruangan sedang lambat atau mati?',
        a: 'Aplikasi ASETKITA tetap bisa digunakan mencatat laporan secara offline. Begitu HP Anda tersambung kembali ke internet atau WiFi kantor, laporan akan langsung terkirim secara otomatis.',
      },
      {
        q: 'Kenapa laporan saya masih berstatus Kuning (Menunggu)?',
        a: 'Admin memprioritaskan antrean perbaikan berdasarkan tingkat kedaruratan. Kerusakan fasilitas vital (seperti listrik ruang sidang atau kebocoran) akan didahulukan.',
      },
      {
        q: 'Apakah saya bisa menambah foto baru setelah laporan dikirim?',
        a: 'Bisa. Klik laporan Anda di daftar riwayat, lalu ketik pesan atau unggah foto tambahan melalui kolom Komentar & Diskusi di bagian bawah.',
      },
      {
        q: 'Siapa yang berhak menyetujui pemindahan barang kantor?',
        a: 'Permohonan pindah barang antar ruangan akan ditinjau dan disetujui langsung oleh Admin Pengelola Aset dan Perlengkapan Sekretariat DPRD.',
      },
    ],
  },
]

const quickHighlights = [
  { icon: Sparkles, title: 'Bantuan Pintar (AI)', desc: 'Kerusakan darurat langsung diprioritaskan otomatis' },
  { icon: Wrench, title: 'Lapor 4 Langkah', desc: 'Tinggal foto barang rusak, pilih ruangan, lalu kirim' },
  { icon: Boxes, title: 'Pindah Barang Mudah', desc: 'Permohonan mutasi aset antar ruang tercatat rapi' },
  { icon: Smartphone, title: 'Bisa Buka di HP', desc: 'Pasang di layar utama HP tanpa download PlayStore' },
]

export function GuidePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isDownloading, setIsDownloading] = useState<boolean>(false)

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/signup')
    }
  }

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      const link = document.createElement('a')
      link.href = '/panduan-asetkita-semarang.pdf'
      link.download = 'Panduan_Pengguna_ASETKITA_Semarang.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Buku Panduan PDF berhasil diunduh!')
    } catch {
      try {
        await generateUserGuidePDF()
        toast.success('Buku Panduan PDF berhasil dibuat & diunduh!')
      } catch (err) {
        console.error('PDF Generation error:', err)
        toast.error('Gagal mengunduh PDF. Silakan coba kembali.')
      }
    } finally {
      setTimeout(() => setIsDownloading(false), 800)
    }
  }

  const filteredSections = useMemo(() => {
    return guideSections.filter((section) => {
      const matchCategory = selectedCategory === 'all' || section.category === selectedCategory
      const matchSearch =
        searchQuery.trim() === '' ||
        section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        section.steps?.some(
          (s) =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (s.goodExample && s.goodExample.toLowerCase().includes(searchQuery.toLowerCase())),
        ) ||
        section.faqs?.some(
          (f) =>
            f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.a.toLowerCase().includes(searchQuery.toLowerCase()),
        )

      return matchCategory && matchSearch
    })
  }, [selectedCategory, searchQuery])

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-950 font-sans selection:bg-[#F9D141]/30">
      {/* Full-screen Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/new-bg_dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto max-w-4xl w-full my-6">
        {/* Header Bar */}
        <header className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link to="/" className="inline-block transition-transform hover:scale-105 duration-300">
            <div className="max-w-[240px] sm:max-w-[280px]">
              <img
                src="/jdih-logo.png"
                alt="JDIH Kota Semarang"
                className="w-full h-auto object-contain [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.8))]"
              />
            </div>
          </Link>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="space-y-6"
        >
          {/* Main Auth-Style Dark Glass Card Container */}
          <div className="p-6 sm:p-10 rounded-[24px] border border-white/10 bg-slate-950/20 shadow-[0_20px_45px_rgba(0,0,0,0.5)] backdrop-blur-[2px] text-white">
            
            {/* Unified 3-Tab Document Switcher */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-950/40 border border-white/10 backdrop-blur-md flex-wrap justify-center gap-1">
                <Link
                  to="/terms"
                  className={`relative px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
                    location.pathname === '/terms'
                      ? 'gradient-gold text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Ketentuan Layanan
                  </span>
                </Link>

                <Link
                  to="/privacy"
                  className={`relative px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
                    location.pathname === '/privacy'
                      ? 'gradient-gold text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Kebijakan Pengguna
                  </span>
                </Link>

                <Link
                  to="/guide"
                  className={`relative px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
                    location.pathname === '/guide' || location.pathname === '/user-guide'
                      ? 'gradient-gold text-white shadow-md'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" /> Panduan Pengguna
                  </span>
                </Link>
              </div>
            </div>

            {/* Document Hero */}
            <div className="mb-8 text-center relative">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold shadow-md">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white drop-shadow-sm">
                <span className="text-[#FFEBA1]">Panduan </span>
                <span className="font-extrabold">Pengguna (Buku Petunjuk Praktis)</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium max-w-xl mx-auto leading-relaxed">
                Panduan praktis langkah demi langkah untuk seluruh pegawai dan staf dalam melaporkan fasilitas rusak serta memantau perbaikan dengan mudah.
              </p>
              
              <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold text-[#F9D141]">
                  <Sparkles className="h-3 w-3" />
                  <span>Bahasa Sederhana • Ramah Pengguna Awam</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold text-slate-300">
                  <Clock className="h-3 w-3" />
                  <span>Edisi 2.0 (DPRD Kota Semarang)</span>
                </div>
              </div>

              {/* PDF Download Callout Button in Hero */}
              <div className="mt-6 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl gradient-gold text-white font-extrabold text-xs sm:text-sm shadow-[0_8px_25px_rgba(249,209,65,0.3)] hover:opacity-95 transition-all cursor-pointer border border-amber-300/30"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                      <span>Menyiapkan Dokumen PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 text-white" />
                      <span>Unduh Buku Panduan PDF (.pdf)</span>
                    </>
                  )}
                </motion.button>
              </div>

              <div className="mx-auto mt-6 h-1 w-20 rounded-full gradient-gold" />
            </div>

            {/* Quick Highlights Feature Cards */}
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {quickHighlights.map((h, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="rounded-xl bg-white/10 border border-white/10 p-3.5 text-xs text-white backdrop-blur-md shadow-sm hover:bg-white/15 transition-all flex flex-col gap-1.5"
                >
                  <div className="flex items-center gap-2">
                    <h.icon className="h-4 w-4 text-[#F9D141] shrink-0" />
                    <span className="font-bold text-white text-[13px]">{h.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-300 leading-tight">{h.desc}</span>
                </motion.div>
              ))}
            </div>

            {/* Search & Category Filter Controls */}
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik apa yang ingin Anda cari (misal: lapor AC mati, pasang di HP, lupa sandi, warna kuning)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/70 border border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-[#F9D141] focus:ring-1 focus:ring-[#F9D141] transition-all backdrop-blur-md"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 font-medium mr-1">Filter Kategori:</span>
                {[
                  { id: 'all', label: 'Semua Bab' },
                  { id: 'umum', label: 'Bab 1: Buka di HP' },
                  { id: 'pegawai', label: 'Bab 2: Lapor Kerusakan' },
                  { id: 'admin', label: 'Bab 3: Panduan Admin' },
                  { id: 'ai', label: 'Bab 4: Arti Warna Status' },
                  { id: 'faq', label: 'Bab 5: Tanya Jawab (FAQ)' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#F9D141] text-slate-950 shadow-sm font-bold'
                        : 'bg-white/10 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Guide Sections Accordion/Cards */}
            <div className="space-y-8">
              <AnimatePresence>
                {filteredSections.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12 px-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <HelpCircle className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-white">Topik tidak ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba gunakan kata kunci sehari-hari seperti "AC", "foto", "pindah meja", "lupa sandi", atau tekan tombol reset.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('all')
                      }}
                      className="mt-4 text-xs bg-white/10 hover:bg-white/20 text-white border-white/15 rounded-xl cursor-pointer"
                    >
                      Reset Pencarian
                    </Button>
                  </motion.div>
                ) : (
                  filteredSections.map((section, idx) => (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-20px' }}
                      transition={{ delay: idx * 0.05, duration: 0.35 }}
                      className="space-y-3"
                    >
                      {/* Title Bar */}
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg gradient-gold text-white font-extrabold text-xs shadow-sm">
                            {idx + 1}
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                            {section.title}
                          </h2>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-white/10 text-[#F9D141] border border-white/10">
                          {section.badge}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 font-medium pl-10">
                        {section.summary}
                      </p>

                      {/* Step items with Good/Bad examples */}
                      <div className="grid gap-3 pt-1">
                        {section.steps?.map((st, sIdx) => (
                          <div
                            key={sIdx}
                            className="rounded-[16px] bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 sm:p-5 shadow-sm text-white transition-all hover:bg-slate-900/80 hover:border-[#F9D141]/40 space-y-3"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 rounded-full bg-[#F9D141]/20 text-[#F9D141] border border-[#F9D141]/30 shrink-0 mt-0.5 shadow-sm">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <div className="text-xs sm:text-sm leading-relaxed flex-1">
                                <span className="font-extrabold text-[#FFEBA1] mr-1.5">
                                  {st.step} {st.title}:
                                </span>
                                <span className="text-slate-200 font-medium">{st.desc}</span>
                              </div>
                            </div>

                            {/* Good vs Bad Example if available */}
                            {st.goodExample && (
                              <div className="ml-9 space-y-1.5 pt-1">
                                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-200 text-xs flex items-start gap-2">
                                  <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="leading-snug">{st.goodExample}</span>
                                </div>
                                {st.badExample && (
                                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-200 text-xs flex items-start gap-2">
                                    <X className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                                    <span className="leading-snug">{st.badExample}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Practical Tip */}
                            {st.tip && (
                              <div className="ml-9 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2">
                                <Lightbulb className="h-4 w-4 text-[#F9D141] shrink-0 mt-0.5" />
                                <span className="leading-snug">{st.tip}</span>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* FAQ Items if available */}
                        {section.faqs?.map((faq, fIdx) => (
                          <div
                            key={fIdx}
                            className="rounded-[16px] bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 sm:p-5 shadow-sm text-white transition-all hover:bg-slate-900/80 hover:border-[#F9D141]/40 space-y-2"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-1.5 rounded-full bg-[#F9D141]/20 text-[#F9D141] border border-[#F9D141]/30 shrink-0 mt-0.5 shadow-sm">
                                <HelpCircle className="h-4 w-4" />
                              </div>
                              <div className="text-xs sm:text-sm leading-relaxed flex-1">
                                <h3 className="font-bold text-[#FFEBA1] mb-1">{faq.q}</h3>
                                <p className="text-slate-200 font-medium">{faq.a}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Bottom PDF Download Banner & Action Card */}
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900/60 to-amber-500/15 border border-[#F9D141]/30 p-6 sm:p-8 backdrop-blur-md text-center space-y-4">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F9D141]/20 border border-[#F9D141]/30 text-[#F9D141]">
                <FileCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  Ingin Membaca Panduan dalam Format PDF?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                  Unduh berkas PDF resmi untuk disimpan di HP atau dicetak agar bisa dibaca kapan saja secara offline.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <motion.button
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="w-full sm:w-auto px-6 h-11 text-xs sm:text-sm font-bold text-white gradient-gold shadow-[0_8px_20px_rgba(0,0,0,0.35)] hover:opacity-95 transition-all duration-200 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Download className="h-4 w-4 text-white" />
                  )}
                  <span>Unduh Buku Panduan PDF Resmi (.pdf)</span>
                </motion.button>

                <Link to="/signup" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-11 text-xs sm:text-sm font-bold bg-white/10 hover:bg-white/20 text-white border-white/20 rounded-xl cursor-pointer gap-2"
                  >
                    <span>Mulai Daftar Akun</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="mt-8 border-t border-white/10 pt-6 text-center">
              <p className="text-xs text-slate-400 font-medium">
                Pusat Dukungan Teknis: Sekretariat DPRD Kota Semarang | Sub Bagian Tata Usaha Sarana Prasarana & Tim JDIH
              </p>
            </div>
          </div>
        </motion.div>

        <footer className="mt-8 text-center text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} ASETKITA Semarang DPRD Kota Semarang. Hak Cipta Dilindungi Undang-Undang.
        </footer>
      </div>
    </div>
  )
}
