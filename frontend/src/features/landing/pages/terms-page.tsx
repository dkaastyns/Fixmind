import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BookOpen,
  FileText,
  ShieldAlert,
  Server,
  UserCheck,
  Building,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Clock,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const sections = [
  {
    icon: BookOpen,
    title: '1. Pendahuluan',
    badge: 'Umum',
    summary: 'Ketentuan dasar penggunaan platform FixMind di DPRD Kota Semarang.',
    details: [
      {
        head: 'Persetujuan Layanan',
        desc: 'Dengan mengakses dan menggunakan platform FixMind, Anda secara otomatis menyatakan setuju untuk mematuhi dan terikat oleh seluruh Ketentuan Layanan ini.',
      },
      {
        head: 'Tujuan Platform',
        desc: 'Aplikasi ini dirancang khusus untuk mempermudah pelaporan, pemantauan, dan pemeliharaan sarana dan prasarana di lingkungan Dewan Perwakilan Rakyat Daerah (DPRD) Kota Semarang.',
      },
    ],
  },
  {
    icon: Server,
    title: '2. Layanan yang Tersedia',
    badge: 'Fitur Utama',
    summary: 'Fasilitas dan modul utama yang dapat diakses pengguna.',
    details: [
      {
        head: 'Sistem Pelaporan Cerdas',
        desc: 'Pengguna dapat mengunggah foto bukti, deskripsi kendala, lokasi ruangan, dan memilih kategori kerusakan secara langsung.',
      },
      {
        head: 'Integrasi AI Priority Engine',
        desc: 'Asisten cerdas kami membantu menganalisis laporan, mengelompokkan kategori, serta merekomendasikan tingkat prioritas penanganan perbaikan.',
      },
      {
        head: 'Pemantauan Real-Time',
        desc: 'Dashboard interaktif yang menyajikan status perbaikan dari pengajuan baru, proses pengerjaan, hingga laporan selesai.',
      },
      {
        head: 'Layanan Notifikasi Instan',
        desc: 'Pembaruan status laporan dikirimkan secara langsung ke pihak pelapor dan admin terkait tanpa penundaan.',
      },
    ],
  },
  {
    icon: ShieldAlert,
    title: '3. Kebijakan & Kerahasiaan',
    badge: 'Keamanan Data',
    summary: 'Komitmen perlindungan data dan privasi pengguna.',
    details: [
      {
        head: 'Pengumpulan Data',
        desc: 'Kami hanya mengumpulkan data yang diperlukan untuk identifikasi laporan seperti Nama Lengkap, Email, Nomor Telepon, dan Kredensial Akun.',
      },
      {
        head: 'Tujuan Penggunaan Data',
        desc: 'Data laporan digunakan sepenuhnya untuk tujuan koordinasi, analisis, dan perbaikan fasilitas sarana prasarana.',
      },
      {
        head: 'Jaminan Privasi Pelapor',
        desc: 'FixMind menjamin kerahasiaan identitas pelapor dalam pelaporan isu internal tertentu demi menjaga kenyamanan bekerja.',
      },
    ],
  },
  {
    icon: UserCheck,
    title: '4. Kewajiban Pengguna',
    badge: 'Etika & Tanggung Jawab',
    summary: 'Panduan tata tertib dan tanggung jawab pemilik akun.',
    details: [
      {
        head: 'Informasi Akurat & Jujur',
        desc: 'Pengguna berkewajiban memberikan informasi laporan yang akurat, benar, dan dapat dipertanggungjawabkan.',
      },
      {
        head: 'Larangan Penyalahgunaan',
        desc: 'Dilarang keras mengirimkan laporan palsu, spam, atau materi yang mengandung unsur SARA dan pornografi.',
      },
      {
        head: 'Keamanan Kredensial Akun',
        desc: 'Pengguna wajib menjaga kerahasiaan kata sandi akun dan segera melaporkan jika mendeteksi aktivitas mencurigakan.',
      },
    ],
  },
  {
    icon: Building,
    title: '5. Batasan Tanggung Jawab',
    badge: 'Penutup',
    summary: 'Ketentuan operasional dan garansi sistem.',
    details: [
      {
        head: 'Ketersediaan Layanan',
        desc: 'Layanan FixMind disediakan "sebagaimana adanya". Pengelola platform berusaha sebaik mungkin untuk meminimalkan downtime dan memperbaiki kendala teknis dengan cepat.',
      },
      {
        head: 'Pengecualian Kerugian',
        desc: 'Pengelola tidak bertanggung jawab atas kerugian tidak langsung yang disebabkan oleh gangguan teknis sistem di luar kendali wajar.',
      },
    ],
  },
]

const highlights = [
  { icon: Sparkles, text: 'Fitur Cerdas AI Priority' },
  { icon: ShieldCheck, text: 'Privasi Pelapor Terjamin' },
  { icon: Clock, text: 'Notifikasi Real-time' },
  { icon: Lock, text: 'Enkripsi Data Kredensial' },
]

export function TermsPage() {
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
    <div className="relative min-h-screen overflow-hidden bg-slate-950 py-8 md:py-12 px-4 font-sans selection:bg-[#F9D141]/30">
      {/* Background Image with slow zoom animation & dark overlay */}
      <motion.div
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.5, ease: 'easeOut' }}
        className="fixed inset-0 z-0 pointer-events-none"
      >
        <img
          src="/new-bg_dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />
        
        {/* Ambient AI Glowing Orbs */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#F9D141]/15 rounded-full filter blur-[130px] pointer-events-none" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }} 
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-amber-500/12 rounded-full filter blur-[110px] pointer-events-none" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950" />
      </motion.div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Header Navigation Toolbar */}
        <header className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link to="/" className="inline-block">
            <div className="bg-slate-950/80 border border-[#ffd043]/35 backdrop-blur-md shadow-[0_0_20px_rgba(249,209,65,0.25)] rounded-2xl px-4 py-2 flex items-center transition-all hover:scale-[1.02] hover:border-[#ffd043]/60">
              <img 
                src="/jdih-logo.png" 
                alt="JDIH Kota Semarang" 
                className="h-9 w-auto object-contain [filter:drop-shadow(0_0_10px_rgba(249,209,65,0.5))]" 
              />
            </div>
          </Link>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBack}
              className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md rounded-xl transition-all cursor-pointer shadow-sm"
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
          {/* Main Dark Glass Card */}
          <div className="p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/15 bg-slate-950/45 backdrop-blur-2xl rounded-3xl relative overflow-hidden">
            
            {/* Unified Document Tab Switcher */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-950/90 border border-white/15 backdrop-blur-xl shadow-inner">
                <Link to="/terms" className="relative px-5 py-2.5 text-xs md:text-sm font-bold transition-colors cursor-pointer text-slate-950">
                  {location.pathname === '/terms' && (
                    <motion.div
                      layoutId="activeLegalTabPill"
                      className="absolute inset-0 rounded-xl gradient-gold shadow-md z-0"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2 text-slate-950 font-extrabold">
                    <FileText className="h-4 w-4 text-slate-950" /> Ketentuan Layanan
                  </span>
                </Link>
                <Link to="/privacy" className="relative px-5 py-2.5 text-xs md:text-sm font-bold transition-colors cursor-pointer text-slate-300 hover:text-white">
                  {location.pathname === '/privacy' && (
                    <motion.div
                      layoutId="activeLegalTabPill"
                      className="absolute inset-0 rounded-xl gradient-gold shadow-md z-0"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" /> Kebijakan Pengguna
                  </span>
                </Link>
              </div>
            </div>

            {/* Document Hero */}
            <div className="mb-8 text-center relative">
              <motion.div 
                whileHover={{ scale: 1.08, rotate: 6 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl gradient-gold shadow-[0_0_25px_rgba(249,209,65,0.4)] border border-amber-300/50"
              >
                <FileText className="h-8 w-8 text-slate-950" />
              </motion.div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Ketentuan Layanan
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-200 font-medium max-w-lg mx-auto leading-relaxed">
                Pedoman resmi penggunaan dan tata tertib sistem manajemen sarana prasarana DPRD Kota Semarang
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold text-[#ffd043] shadow-xs">
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
                  className="flex items-center gap-2.5 rounded-xl bg-slate-900/70 border border-white/10 p-3 text-xs font-bold text-slate-100 shadow-sm hover:border-[#ffd043]/60 hover:bg-slate-900 transition-all"
                >
                  <h.icon className="h-4 w-4 text-[#ffd043] shrink-0" />
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
                  whileHover={{ y: -3, borderColor: 'rgba(249, 209, 65, 0.5)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}
                  className="group rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-md p-6 transition-all duration-300 shadow-lg"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <motion.div 
                      whileHover={{ rotate: 12, scale: 1.1 }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ffd043]/15 text-[#ffd043] border border-[#ffd043]/30 group-hover:bg-[#ffd043] group-hover:text-slate-950 transition-all duration-300 shadow-xs"
                    >
                      <section.icon className="h-5.5 w-5.5" />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                          {section.title}
                        </h2>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-white/10 text-[#ffd043] border border-[#ffd043]/30">
                          {section.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {section.summary}
                      </p>
                    </div>
                  </div>

                  {/* Bullet Sub-Items */}
                  <div className="grid gap-2.5 pt-3 border-t border-white/10">
                    {section.details.map((detail, dIdx) => (
                      <div 
                        key={dIdx}
                        className="flex items-start gap-3.5 rounded-2xl bg-slate-950/60 p-4 border border-white/10 group-hover:border-white/20 transition-colors"
                      >
                        <div className="p-1 rounded-full bg-[#ffd043]/20 text-[#ffd043] border border-[#ffd043]/30 shrink-0 mt-0.5">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <div className="text-xs md:text-sm leading-relaxed">
                          <span className="font-bold text-amber-300 mr-1.5">{detail.head}:</span>
                          <span className="text-slate-200 font-medium">{detail.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer CTA & Acceptance Notice */}
            <div className="mt-10 border-t border-white/15 pt-8 text-center">
              <p className="text-xs md:text-sm text-slate-300 mb-6 max-w-xl mx-auto leading-relaxed font-semibold">
                Dengan mencentang persetujuan saat mendaftar, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan di atas.
              </p>
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-9 py-3.5 text-sm md:text-base font-extrabold text-slate-950 gradient-gold shadow-[0_4px_20px_rgba(249,209,65,0.35)] hover:brightness-110 transition-all duration-300 rounded-xl cursor-pointer"
                >
                  Saya Setuju & Daftar Sekarang
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        <footer className="mt-8 text-center text-xs text-slate-400 font-bold">
          © {new Date().getFullYear()} FixMind DPRD Kota Semarang. Hak Cipta Dilindungi Undang-Undang.
        </footer>
      </div>
    </div>
  )
}
