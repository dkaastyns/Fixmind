import { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
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

const IntroScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [currentWord, setCurrentWord] = useState(0)
  const words = ["Sederhana.", "Cerdas.", "FixMind."]

  useEffect(() => {
    if (currentWord < words.length - 1) {
      const timer = setTimeout(() => {
        setCurrentWord(prev => prev + 1)
      }, 800)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        onComplete()
      }, 1200)
      return () => clearTimeout(timer)
    }
  }, [currentWord, onComplete])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950"
    >
      <AnimatePresence mode="wait">
        <motion.h1
          key={currentWord}
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.4 }}
          className={`text-4xl sm:text-6xl font-extrabold tracking-tight ${
            currentWord === words.length - 1 ? "text-gradient-gold drop-shadow-[0_0_15px_rgba(255,214,65,0.3)]" : "text-white"
          }`}
        >
          {words[currentWord]}
        </motion.h1>
      </AnimatePresence>
    </motion.div>
  )
}

export function LandingPage() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  if (isHydrated && accessToken) {
    return <Navigate to="/dashboard" replace />
  }

  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('hasSeenIntro')
  })

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true')
    setShowIntro(false)
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f8fafc] flex flex-col justify-between">
      <AnimatePresence>
        {showIntro && <IntroScreen onComplete={handleIntroComplete} />}
      </AnimatePresence>

      
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
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: showIntro ? 0 : 0.2 }}
              className="max-w-[280px] sm:max-w-[420px] transition-transform hover:scale-105 duration-300"
            >
              <img src="/jdih-logo.png" alt="JDIH Kota Semarang" className="w-full h-auto object-contain [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.8))]" />
            </motion.div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 mt-8 sm:mt-12 text-center flex-grow flex flex-col justify-center items-center">
          <motion.div
            initial="hidden"
            animate={showIntro ? "hidden" : "show"}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.2
                }
              }
            }}
            className="w-full"
          >
            <motion.h2 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="text-xl sm:text-2xl font-extrabold text-white tracking-wider mb-2 drop-shadow-sm font-sans"
            >
              FixMind
            </motion.h2>
            
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight mt-4 max-w-3xl mx-auto"
            >
              Kelola aset Sekretariat
              <span className="text-gradient-gold block mt-1 sm:mt-2">
                dengan lebih cerdas.
              </span>
            </motion.h1>

            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="mt-6 max-w-2xl mx-auto text-sm sm:text-base text-slate-200 font-medium leading-relaxed"
            >
              FixMind membantu mengelola laporan kerusakan, meprioritaskan perbaikan dan menyederhanakan alur kerja melalui dukungan keputusan berbasis AI.
            </motion.p>

            {/* Buttons stacked on mobile, inline on desktop */}
            <motion.div 
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-xs sm:max-w-md mx-auto"
            >
              <Link to="/signup" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-bold gradient-gold shadow-[0_4px_20px_rgba(255,214,65,0.25)] hover:shadow-[0_6px_25px_rgba(255,214,65,0.4)] transition-all duration-200 cursor-pointer"
                >
                  Daftar sekarang!
                </motion.button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <motion.button 
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-bold bg-black hover:bg-slate-900 border border-white/10 transition-all duration-200 cursor-pointer"
                >
                  Masuk
                </motion.button>
              </Link>
            </motion.div>
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
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 80 }}
                whileHover={{ y: -8, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-[22px] bg-white flex flex-col items-start gap-4 border border-slate-200/40 shadow-[0_20px_35px_rgba(0,0,0,0.22)] hover:shadow-[0_28px_50px_rgba(0,0,0,0.28)] transition-all duration-300 cursor-pointer h-full group"
              >
                {/* Icon Container with glowing figma gradient background and drop shadow */}
                <div className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] text-white bg-gradient-to-br from-[#F9D141] via-[#D42115] to-[#737373] shadow-[0_6px_15px_rgba(0,0,0,0.45)] group-hover:scale-105 transition-transform duration-300">
                  <Icon className="h-5 w-5 text-white" />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">
                    {feature.title}
                  </h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-normal">
                    {feature.description}
                  </p>
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

