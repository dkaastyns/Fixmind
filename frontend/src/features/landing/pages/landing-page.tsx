import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BarChart3,
  Bot,
  ClipboardList,
  Wrench,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

const features = [
  {
    icon: ClipboardList,
    title: 'Pelaporan Cerdas',
    description: 'Pegawai dapat melaporkan masalah fasilitas dengan foto dan memantau status secara langsung.',
  },
  {
    icon: Bot,
    title: 'Prioritas Berbasis AI',
    description: 'Sistem menganalisis laporan dan merekomendasikan prioritas perbaikan.',
  },
  {
    icon: Wrench,
    title: 'Alur Kerja Ringkas',
    description: 'Admin dan pengguna bisa memantau progres laporan tanpa alur teknisi yang rumit.',
  },
  {
    icon: BarChart3,
    title: 'Dasbor Analitik',
    description: 'Pantau kinerja pemeliharaan, aktivitas ruangan, dan ekspor laporan untuk kepatuhan.',
  },
]

export function LandingPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  if (isHydrated && accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] flex flex-col justify-between">
      
      {/* Hero Background Image Section */}
      <div className="relative w-full min-h-[90vh] sm:min-h-[85vh] flex flex-col justify-between pb-12">
        <div className="absolute inset-0 z-0">
          <img
            src="/new-bg_dprd.jpg"
            alt="Latar Belakang DPRD"
            className="h-full w-full object-cover"
          />
          {/* Dark Overlay to ensure readability and contrast */}
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
          {/* Fading bottom overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-[#f8fafc]" />
        </div>

        {/* Header/Nav inside Hero */}
        <header className="relative z-10 w-full px-4 pt-6 sm:px-8 max-w-6xl mx-auto flex justify-center">
          <div className="w-full flex justify-center">
            {/* Center Logo banner */}
            <div className="max-w-[280px] sm:max-w-[420px] transition-transform hover:scale-105 duration-300">
              <img src="/jdih-logo.png" alt="JDIH Kota Semarang" className="w-full h-auto object-contain" />
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 mt-8 sm:mt-12 text-center flex-grow flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full"
          >
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-wider mb-2 drop-shadow-sm font-sans">
              FixMind
            </h2>
            
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mt-4 max-w-3xl mx-auto">
              Kelola aset Sekretariat
              <span className="text-gradient-gold block mt-1 sm:mt-2">
                dengan lebih cerdas.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
              FixMind membantu mengelola laporan kerusakan, meprioritaskan perbaikan dan menyederhanakan alur kerja melalui dukungan keputusan berbasis AI.
            </p>

            {/* Buttons stacked on mobile, inline on desktop */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-md mx-auto">
              <Link to="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-bold gradient-gold shadow-[0_4px_20px_rgba(228,181,43,0.35)] hover:shadow-[0_6px_25px_rgba(228,181,43,0.5)] active:scale-[0.98] transition-all duration-200 cursor-pointer">
                  Daftar sekarang!
                </button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-bold bg-black hover:bg-slate-900 border border-white/10 active:scale-[0.98] transition-all duration-200 cursor-pointer">
                  Masuk
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* "Mengapa FixMind???" Section */}
      <section className="relative z-10 bg-[#f8fafc] px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span className="text-gradient-orange-red mr-2">Mengapa</span>
            <span className="text-slate-900">FixMind???</span>
          </h2>
        </div>

        {/* Feature Cards Grid (Stacked on mobile, side-by-side on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="w-full h-full"
              >
                <div
                  className="p-6 rounded-3xl bg-white flex flex-col items-start gap-4 border border-slate-100/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] hover:border-[#3b82f6] hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)] hover:ring-4 hover:ring-[#3b82f6]/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
                >
                  {/* Icon Container with custom accent background */}
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl shadow-sm text-white bg-gradient-to-br from-orange-500 to-red-600">
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-800 text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full border-t border-slate-200/60 py-6 text-center text-xs text-slate-500 bg-white">
        © 2026 FixMind. Pemeliharaan Fasilitas Cerdas.
      </footer>
    </div>
  )
}

