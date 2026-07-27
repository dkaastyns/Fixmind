import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ShieldCheck,
  EyeOff,
  Database,
  Lock,
  UserCog,
  ShieldAlert,
  CheckCircle2,
  FileText,
  KeyRound,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const sections = [
  {
    icon: EyeOff,
    title: '1. Pengumpulan Informasi',
    badge: 'PRIVASI DATA',
    summary: 'Jenis data yang kami kumpulkan saat pendaftaran dan penggunaan.',
    details: [
      {
        num: '1.1',
        head: 'Data Identitas Pengguna',
        desc: 'Nama Lengkap, Alamat Email resmi, Nomor Telepon, serta Kredensial Akun (Kata sandi terenkripsi hash).',
      },
      {
        num: '1.2',
        head: 'Data Pelaporan Fasilitas',
        desc: 'Foto bukti fisik kerusakan fasilitas, deskripsi rinci kendala, serta posisi lokasi ruangan di lingkungan DPRD Kota Semarang.',
      },
    ],
  },
  {
    icon: Database,
    title: '2. Penggunaan Informasi',
    badge: 'TUJUAN PENGOLAHAN',
    summary: 'Bagaimana data Anda diolah untuk perbaikan prasarana.',
    details: [
      {
        num: '2.1',
        head: 'Fasilitasi & Koordinasi Perbaikan',
        desc: 'Memproses tiket laporan kerusakan dan memfasilitasi koordinasi teknisi perbaikan sarana prasarana.',
      },
      {
        num: '2.2',
        head: 'Analisis Prioritas AI',
        desc: 'Modul AI menganalisis data untuk merekomendasikan tingkat prioritas (Rendah/Sedang/Tinggi/Kritis) dan mengelompokkan kategori secara otomatis.',
      },
      {
        num: '2.3',
        head: 'Notifikasi Real-time',
        desc: 'Mengirimkan pembaruan status perbaikan secara otomatis dan instan langsung ke perangkat pelapor.',
      },
    ],
  },
  {
    icon: Lock,
    title: '3. Penyimpanan & Keamanan Data',
    badge: 'PROTEKSI KREDENSIAL',
    summary: 'Standar keamanan teknis dan proteksi kata sandi.',
    details: [
      {
        num: '3.1',
        head: 'Enkripsi Kredensial Terenkripsi',
        desc: 'Semua kata sandi dienkripsi dengan algoritma bcrypt hash yang aman sebelum disimpan di database database server.',
      },
      {
        num: '3.2',
        head: 'Perlindungan Akses Tanpa Izin',
        desc: 'Langkah teknis dan organisasional diterapkan secara ketat untuk melindungi data pribadi dari kebocoran, kehilangan, atau manipulasi.',
      },
    ],
  },
  {
    icon: ShieldAlert,
    title: '4. Pembagian Data Pihak Ketiga',
    badge: 'KERAHASIAAN MUTLAK',
    summary: 'Komitmen penolakan penjualan atau penyebaran data.',
    details: [
      {
        num: '4.1',
        head: 'Tanpa Komersialisasi Data',
        desc: 'FixMind tidak akan pernah menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan komersial apapun.',
      },
      {
        num: '4.2',
        head: 'Akses Internal Terbatas',
        desc: 'Data laporan hanya diakses oleh administrator internal JDIH dan tim pemeliharaan sarana prasarana resmi DPRD Kota Semarang.',
      },
    ],
  },
  {
    icon: UserCog,
    title: '5. Hak & Pilihan Pengguna',
    badge: 'KONTROL PENGGUNA',
    summary: 'Wewenang Anda terhadap data dan profil akun.',
    details: [
      {
        num: '5.1',
        head: 'Pembaruan Profil Mandiri',
        desc: 'Anda memiliki hak penuh memperbarui informasi nama, nomor telepon, foto profil, dan kata sandi secara mandiri kapan saja.',
      },
      {
        num: '5.2',
        head: 'Permintaan Bantuan & Penghapusan',
        desc: 'Dapat menghubungi administrator JDIH jika memerlukan bantuan teknis terkait data akun atau permintaan penonaktifan akun.',
      },
    ],
  },
]

const highlights = [
  { icon: KeyRound, text: 'Bcrypt Password Hash' },
  { icon: ShieldAlert, text: 'Tanpa Pihak Ketiga' },
  { icon: Eye, text: 'Akses Internal Terbatas' },
  { icon: ShieldCheck, text: 'Proteksi Data Mutlak' },
]

export function PrivacyPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/signup')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-950 font-sans selection:bg-[#F9D141]/30">
      
      {/* Full-screen Background Image with Dark Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/new-bg_dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay with slight blur matching signup/login pages */}
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
          <div className="p-6 sm:p-10 rounded-[24px] border border-white/10 bg-slate-950/15 shadow-[0_20px_45px_rgba(0,0,0,0.5)] backdrop-blur-[2px] text-white">
            
            {/* Unified Document Tab Switcher */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-950/40 border border-white/10 backdrop-blur-md">
                <Link 
                  to="/terms" 
                  className={`relative px-5 py-2.5 text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
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
                  className={`relative px-5 py-2.5 text-xs sm:text-sm font-bold transition-all rounded-xl cursor-pointer ${
                    location.pathname === '/privacy' 
                      ? 'gradient-gold text-white shadow-md' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Kebijakan Pengguna
                  </span>
                </Link>
              </div>
            </div>

            {/* Document Hero */}
            <div className="mb-8 text-center relative">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-gold shadow-md">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white drop-shadow-sm">
                <span className="text-[#FFEBA1]">Kebijakan </span>
                <span className="font-extrabold">Pengguna</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
                Komitmen perlindungan kerahasiaan dan privasi data akun Anda di FixMind DPRD Kota Semarang
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-bold text-[#F9D141]">
                <span>Terakhir Diperbarui: Juli 2026</span>
              </div>
              <div className="mx-auto mt-4 h-1 w-20 rounded-full gradient-gold" />
            </div>

            {/* Quick Takeaways Highlights */}
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-center gap-2.5 rounded-xl bg-white/10 border border-white/10 p-3 text-xs font-semibold text-white backdrop-blur-md shadow-sm hover:bg-white/15 transition-all"
                >
                  <h.icon className="h-4 w-4 text-[#F9D141] shrink-0" />
                  <span className="truncate">{h.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Document Sections */}
            <div className="space-y-6">
              {sections.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ delay: idx * 0.06, duration: 0.35 }}
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

                  {/* Dark Glass Sub-Item Cards */}
                  <div className="grid gap-3 pt-1">
                    {section.details.map((detail, dIdx) => (
                      <div 
                        key={dIdx}
                        className="flex items-start gap-3.5 rounded-[16px] bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 sm:p-5 shadow-sm text-white transition-all hover:bg-slate-900/80 hover:border-[#F9D141]/40"
                      >
                        <div className="p-1.5 rounded-full bg-[#F9D141]/20 text-[#F9D141] border border-[#F9D141]/30 shrink-0 mt-0.5 shadow-sm">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <div className="text-xs sm:text-sm leading-relaxed">
                          <span className="font-extrabold text-[#FFEBA1] mr-1.5">{detail.num} {detail.head}:</span>
                          <span className="text-slate-200 font-medium">{detail.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer CTA & Acceptance Notice */}
            <div className="mt-10 border-t border-white/10 pt-8 text-center">
              <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-xl mx-auto leading-relaxed font-medium">
                Dengan mencentang persetujuan saat mendaftar, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh kebijakan di atas.
              </p>
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 h-11 text-sm sm:text-base font-bold text-white gradient-gold shadow-[0_8px_20px_rgba(0,0,0,0.35)] hover:opacity-95 transition-all duration-200 rounded-2xl cursor-pointer"
                >
                  Saya Setuju & Daftar Sekarang
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        <footer className="mt-8 text-center text-xs text-slate-400 font-medium">
          © {new Date().getFullYear()} FixMind DPRD Kota Semarang. Hak Cipta Dilindungi Undang-Undang.
        </footer>
      </div>
    </div>
  )
}
