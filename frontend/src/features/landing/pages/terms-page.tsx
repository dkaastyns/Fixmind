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
    badge: 'UMUM',
    summary: 'Ketentuan dasar penggunaan platform FixMind di DPRD Kota Semarang.',
    details: [
      {
        num: '1.1',
        head: 'Persetujuan Layanan',
        desc: 'Dengan mengakses dan menggunakan platform FixMind, Anda secara otomatis menyatakan setuju untuk mematuhi dan terikat oleh seluruh Ketentuan Layanan ini.',
      },
      {
        num: '1.2',
        head: 'Tujuan Platform',
        desc: 'Aplikasi ini dirancang khusus untuk mempermudah pelaporan, pemantauan, dan pemeliharaan sarana dan prasarana di lingkungan Dewan Perwakilan Rakyat Daerah (DPRD) Kota Semarang.',
      },
    ],
  },
  {
    icon: Server,
    title: '2. Layanan yang Tersedia',
    badge: 'FITUR UTAMA',
    summary: 'Fasilitas dan modul utama yang dapat diakses pengguna.',
    details: [
      {
        num: '2.1',
        head: 'Sistem Pelaporan Cerdas',
        desc: 'Pengguna dapat mengunggah foto bukti, deskripsi kendala, lokasi ruangan, dan memilih kategori kerusakan secara langsung.',
      },
      {
        num: '2.2',
        head: 'Integrasi AI Priority Engine',
        desc: 'Asisten cerdas kami membantu menganalisis laporan, mengelompokkan kategori, serta merekomendasikan tingkat prioritas penanganan perbaikan.',
      },
      {
        num: '2.3',
        head: 'Pemantauan Real-Time',
        desc: 'Dashboard interaktif yang menyajikan status perbaikan dari pengajuan baru, proses pengerjaan, hingga laporan selesai.',
      },
      {
        num: '2.4',
        head: 'Layanan Notifikasi Instan',
        desc: 'Pembaruan status laporan dikirimkan secara langsung ke pihak pelapor dan admin terkait tanpa penundaan.',
      },
    ],
  },
  {
    icon: ShieldAlert,
    title: '3. Kebijakan & Kerahasiaan',
    badge: 'KEAMANAN DATA',
    summary: 'Komitmen perlindungan data dan privasi pengguna.',
    details: [
      {
        num: '3.1',
        head: 'Pengumpulan Data',
        desc: 'Kami hanya mengumpulkan data yang diperlukan untuk identifikasi laporan seperti Nama Lengkap, Email, Nomor Telepon, dan Kredensial Akun.',
      },
      {
        num: '3.2',
        head: 'Tujuan Penggunaan Data',
        desc: 'Data laporan digunakan sepenuhnya untuk tujuan koordinasi, analisis, dan perbaikan fasilitas sarana prasarana.',
      },
      {
        num: '3.3',
        head: 'Jaminan Privasi Pelapor',
        desc: 'FixMind menjamin kerahasiaan identitas pelapor dalam pelaporan isu internal tertentu demi menjaga kenyamanan bekerja.',
      },
    ],
  },
  {
    icon: UserCheck,
    title: '4. Kewajiban Pengguna',
    badge: 'TANGGUNG JAWAB',
    summary: 'Panduan tata tertib dan tanggung jawab pemilik akun.',
    details: [
      {
        num: '4.1',
        head: 'Informasi Akurat & Jujur',
        desc: 'Pengguna berkewajiban memberikan informasi laporan yang akurat, benar, dan dapat dipertanggungjawabkan.',
      },
      {
        num: '4.2',
        head: 'Larangan Penyalahgunaan',
        desc: 'Dilarang keras mengirimkan laporan palsu, spam, atau materi yang mengandung unsur SARA dan pornografi.',
      },
      {
        num: '4.3',
        head: 'Keamanan Kredensial Akun',
        desc: 'Pengguna wajib menjaga kerahasiaan kata sandi akun dan segera melaporkan jika mendeteksi aktivitas mencurigakan.',
      },
    ],
  },
  {
    icon: Building,
    title: '5. Batasan Tanggung Jawab',
    badge: 'PENUTUP',
    summary: 'Ketentuan operasional dan garansi sistem.',
    details: [
      {
        num: '5.1',
        head: 'Ketersediaan Layanan',
        desc: 'Layanan FixMind disediakan "sebagaimana adanya". Pengelola platform berusaha sebaik mungkin untuk meminimalkan downtime dan memperbaiki kendala teknis dengan cepat.',
      },
      {
        num: '5.2',
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
    <div className="relative min-h-screen py-8 md:py-12 px-4 font-sans selection:bg-[#d9a416]/30 overflow-x-hidden bg-slate-100">
      {/* Rich DPRD Background Image with soft bright backdrop blur overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/new-bg_dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
        {/* Bright Frosted Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-100/85 via-white/90 to-slate-100/95 backdrop-blur-[5px]" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-300/20 rounded-full filter blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-yellow-200/30 rounded-full filter blur-[110px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto max-w-4xl">
        {/* Header Navigation Toolbar */}
        <header className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Link to="/" className="inline-block">
            <div className="bg-white/95 border border-slate-200/90 shadow-md backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-3 transition-transform hover:scale-[1.02]">
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
              className="gap-2 bg-white/95 hover:bg-white text-slate-900 font-extrabold border border-slate-200/90 shadow-md backdrop-blur-md rounded-2xl px-5 py-2.5 transition-all cursor-pointer"
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
          {/* Main Bright Frosted White Card */}
          <div className="p-6 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-200/90 bg-white/95 backdrop-blur-2xl rounded-3xl relative overflow-hidden text-slate-900">
            
            {/* Unified Document Tab Switcher */}
            <div className="mb-8 flex justify-center">
              <div className="inline-flex p-1.5 rounded-full bg-slate-200/80 border border-slate-300/60 shadow-inner backdrop-blur-md">
                <Link 
                  to="/terms" 
                  className={`relative px-6 py-2.5 text-xs md:text-sm font-extrabold transition-all rounded-full cursor-pointer ${
                    location.pathname === '/terms' 
                      ? 'bg-[#d9a416] text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Ketentuan Layanan
                  </span>
                </Link>
                <Link 
                  to="/privacy" 
                  className={`relative px-6 py-2.5 text-xs md:text-sm font-extrabold transition-all rounded-full cursor-pointer ${
                    location.pathname === '/privacy' 
                      ? 'bg-[#d9a416] text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-900'
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
              <motion.div 
                whileHover={{ scale: 1.08, rotate: 6 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100/90 text-[#d9a416] shadow-sm border border-amber-200"
              >
                <FileText className="h-8 w-8 text-[#d9a416]" />
              </motion.div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
                Ketentuan Layanan
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-600 font-semibold max-w-lg mx-auto leading-relaxed">
                Pedoman resmi penggunaan dan tata tertib sistem manajemen sarana prasarana DPRD Kota Semarang.
              </p>
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#d9a416] text-white text-[11px] font-extrabold shadow-sm">
                <span>Terakhir Diperbarui: Juli 2026</span>
              </div>
            </div>

            {/* Quick Takeaways Highlights */}
            <div className="mb-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {highlights.map((h, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02, y: -2 }}
                  className="flex items-center gap-3 rounded-full bg-slate-50/90 border border-slate-200/80 px-4 py-2.5 text-xs md:text-sm font-bold text-slate-900 shadow-xs hover:border-amber-400 hover:bg-white transition-all"
                >
                  <div className="p-1.5 rounded-full bg-amber-100 text-[#d9a416] shrink-0 border border-amber-200">
                    <h.icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate">{h.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Document Sections */}
            <div className="space-y-8">
              {sections.map((section, idx) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ delay: idx * 0.06, duration: 0.35 }}
                  className="group space-y-3"
                >
                  {/* Section Title Bar with Number Badge */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#d9a416] text-white font-extrabold text-sm shadow-sm">
                        {idx + 1}.
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                        {section.title}
                      </h2>
                    </div>
                    <span className="text-[11px] font-extrabold uppercase px-3 py-1 rounded-full bg-[#d9a416] text-white shadow-xs">
                      {section.badge}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-slate-600 font-semibold pl-11">
                    {section.summary}
                  </p>

                  {/* Sub-Items Container Box */}
                  <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 md:p-5 space-y-3 shadow-xs group-hover:border-amber-300 transition-colors">
                    {section.details.map((detail, dIdx) => (
                      <div 
                        key={dIdx}
                        className="flex items-start gap-3.5 rounded-xl bg-white p-4 border border-slate-200/60 shadow-xs hover:border-amber-300 transition-colors"
                      >
                        <div className="p-1.5 rounded-full bg-slate-900 text-white shrink-0 mt-0.5 shadow-sm">
                          <CheckCircle2 className="h-4 w-4 text-[#F9D141]" />
                        </div>
                        <div className="text-xs md:text-sm leading-relaxed">
                          <span className="font-extrabold text-slate-900 mr-1.5">{detail.num} {detail.head}:</span>
                          <span className="text-slate-700 font-medium">{detail.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer CTA & Acceptance Notice */}
            <div className="mt-12 border-t border-slate-200/90 pt-8 text-center">
              <p className="text-xs md:text-sm text-slate-600 mb-6 max-w-xl mx-auto leading-relaxed font-semibold">
                Dengan mencentang persetujuan saat mendaftar, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan di atas.
              </p>
              <Link to="/signup">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-9 py-3.5 text-sm md:text-base font-extrabold text-white bg-[#d9a416] hover:bg-[#c49310] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl cursor-pointer"
                >
                  Saya Setuju & Daftar Sekarang
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        <footer className="mt-8 text-center text-xs text-slate-600 font-bold">
          © {new Date().getFullYear()} FixMind DPRD Kota Semarang. Hak Cipta Dilindungi Undang-Undang.
        </footer>
      </div>
    </div>
  )
}
