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
    badge: 'Privasi Data',
    summary: 'Jenis data yang kami kumpulkan saat pendaftaran dan penggunaan.',
    details: [
      {
        head: 'Data Identitas Pengguna',
        desc: 'Nama Lengkap, Alamat Email resmi, Nomor Telepon, serta Kredensial Akun (Kata sandi terenkripsi hash).',
      },
      {
        head: 'Data Pelaporan Fasilitas',
        desc: 'Foto bukti fisik kerusakan fasilitas, deskripsi rinci kendala, serta posisi lokasi ruangan di lingkungan DPRD Kota Semarang.',
      },
    ],
  },
  {
    icon: Database,
    title: '2. Penggunaan Informasi',
    badge: 'Tujuan Pengolahan',
    summary: 'Bagaimana data Anda diolah untuk perbaikan prasarana.',
    details: [
      {
        head: 'Fasilitasi & Koordinasi Perbaikan',
        desc: 'Memproses tiket laporan kerusakan dan memfasilitasi koordinasi teknisi perbaikan sarana prasarana.',
      },
      {
        head: 'Analisis Prioritas AI',
        desc: 'Modul AI menganalisis data untuk merekomendasikan tingkat prioritas (Rendah/Sedang/Tinggi/Kritis) dan mengelompokkan kategori secara otomatis.',
      },
      {
        head: 'Notifikasi Real-time',
        desc: 'Mengirimkan pembaruan status perbaikan secara otomatis dan instan langsung ke perangkat pelapor.',
      },
    ],
  },
  {
    icon: Lock,
    title: '3. Penyimpanan & Keamanan Data',
    badge: 'Proteksi Kredensial',
    summary: 'Standar keamanan teknis dan proteksi kata sandi.',
    details: [
      {
        head: 'Enkripsi Kredensial Terenkripsi',
        desc: 'Semua kata sandi dienkripsi dengan algoritma bcrypt hash yang aman sebelum disimpan di database database server.',
      },
      {
        head: 'Perlindungan Akses Tanpa Izin',
        desc: 'Langkah teknis dan organisasional diterapkan secara ketat untuk melindungi data pribadi dari kebocoran, kehilangan, atau manipulasi.',
      },
    ],
  },
  {
    icon: ShieldAlert,
    title: '4. Pembagian Data Pihak Ketiga',
    badge: 'Kerahasiaan Mutlak',
    summary: 'Komitmen penolakan penjualan atau penyebaran data.',
    details: [
      {
        head: 'Tanpa Komersialisasi Data',
        desc: 'FixMind tidak akan pernah menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan komersial apapun.',
      },
      {
        head: 'Akses Internal Terbatas',
        desc: 'Data laporan hanya diakses oleh administrator internal JDIH dan tim pemeliharaan sarana prasarana resmi DPRD Kota Semarang.',
      },
    ],
  },
  {
    icon: UserCog,
    title: '5. Hak & Pilihan Pengguna',
    badge: 'Kontrol Pengguna',
    summary: 'Wewenang Anda terhadap data dan profil akun.',
    details: [
      {
        head: 'Pembaruan Profil Mandiri',
        desc: 'Anda memiliki hak penuh memperbarui informasi nama, nomor telepon, foto profil, dan kata sandi secara mandiri kapan saja.',
      },
      {
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
    <div className="relative min-h-screen bg-slate-50 text-slate-900 py-8 md:py-12 px-4 font-sans selection:bg-[#F9D141]/30">
      {/* Background Image with subtle light overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/new-bg_dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover opacity-10 blur-[1px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/90 via-slate-50/95 to-slate-100" />
        
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-1/4 left-1/3 w-[450px] h-[450px] bg-amber-200/30 rounded-full filter blur-[100px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-yellow-200/30 rounded-full filter blur-[100px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Header Navigation Toolbar */}
        <header className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link to="/" className="inline-block">
            <div className="bg-white/90 border border-slate-200/80 shadow-sm rounded-2xl px-4 py-2 flex items-center backdrop-blur-md transition-transform hover:scale-[1.02]">
              <img 
                src="/jdih-logo.png" 
                alt="JDIH Kota Semarang" 
                className="h-9 w-auto object-contain" 
              />
            </div>
          </Link>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBack}
              className="gap-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 shadow-sm font-semibold rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Button>
          </motion.div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          {/* Main White Glass Container */}
          <div className="p-6 md:p-10 shadow-xl border border-slate-200/80 bg-white/95 backdrop-blur-xl rounded-3xl relative overflow-hidden">
            
            {/* Unified Document Tab Switcher */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-inner">
                <Link to="/terms" className="relative px-5 py-2.5 text-xs md:text-sm font-bold transition-colors cursor-pointer text-slate-600 hover:text-slate-900">
                  {location.pathname === '/terms' && (
                    <motion.div
                      layoutId="activeLegalTabPill"
                      className="absolute inset-0 rounded-xl gradient-gold shadow-md z-0"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Ketentuan Layanan
                  </span>
                </Link>
                <Link to="/privacy" className="relative px-5 py-2.5 text-xs md:text-sm font-bold transition-colors cursor-pointer text-slate-950">
                  {location.pathname === '/privacy' && (
                    <motion.div
                      layoutId="activeLegalTabPill"
                      className="absolute inset-0 rounded-xl gradient-gold shadow-md z-0"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-slate-950" /> Kebijakan Pengguna
                  </span>
                </Link>
              </div>
            </div>

            {/* Document Hero */}
            <div className="mb-8 text-center relative">
              <motion.div 
                whileHover={{ scale: 1.08, rotate: -6 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-gold shadow-md border border-amber-300/50"
              >
                <ShieldCheck className="h-8 w-8 text-slate-950" />
              </motion.div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
                Kebijakan Pengguna
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-600 font-medium max-w-lg mx-auto leading-relaxed">
                Komitmen perlindungan kerahasiaan dan privasi data akun Anda di FixMind DPRD Kota Semarang
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800 shadow-xs">
                <span>Terakhir Diperbarui: Juli 2026</span>
              </div>
              <div className="mx-auto mt-4 h-1 w-24 rounded-full gradient-gold" />
            </div>

            {/* Quick Takeaways Highlights */}
            <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs font-bold text-slate-700 shadow-xs hover:border-amber-400 transition-all"
                >
                  <h.icon className="h-4 w-4 text-[#d9a416] shrink-0" />
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
                  whileHover={{ y: -3, borderColor: 'rgba(249, 209, 65, 0.6)' }}
                  className="group rounded-3xl border border-slate-200/80 bg-white p-6 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div 
                      whileHover={{ rotate: -12, scale: 1.1 }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-[#F9D141] group-hover:text-slate-950 transition-all duration-300 shadow-xs"
                    >
                      <section.icon className="h-5.5 w-5.5" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                          {section.title}
                        </h2>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80">
                          {section.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-semibold">
                        {section.summary}
                      </p>
                    </div>
                  </div>

                  {/* Bullet Sub-Items */}
                  <div className="grid gap-2.5 pt-3 border-t border-slate-100">
                    {section.details.map((detail, dIdx) => (
                      <div 
                        key={dIdx}
                        className="flex items-start gap-3 rounded-2xl bg-slate-50/80 p-3.5 border border-slate-200/60 group-hover:bg-amber-50/20 transition-colors"
                      >
                        <div className="p-1 rounded-full bg-amber-500/10 text-amber-700 shrink-0 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-xs md:text-sm leading-relaxed">
                          <span className="font-bold text-slate-900 mr-1.5">{detail.head}:</span>
                          <span className="text-slate-600 font-medium">{detail.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer CTA & Acceptance Notice */}
            <div className="mt-10 border-t border-slate-200/80 pt-8 text-center">
              <p className="text-xs md:text-sm text-slate-600 mb-6 max-w-xl mx-auto leading-relaxed font-semibold">
                Dengan mencentang persetujuan saat mendaftar, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh kebijakan di atas.
              </p>
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-9 py-3.5 text-sm md:text-base font-extrabold text-slate-950 gradient-gold shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl cursor-pointer"
                >
                  Saya Setuju & Daftar Sekarang
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        <footer className="mt-8 text-center text-xs text-slate-500 font-bold">
          © {new Date().getFullYear()} FixMind DPRD Kota Semarang. Hak Cipta Dilindungi Undang-Undang.
        </footer>
      </div>
    </div>
  )
}
