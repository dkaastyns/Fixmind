import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  Bot,
  ClipboardList,
  Shield,
  Wrench,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

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
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Background Image with slow zoom animation */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 3, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/bg-dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[6px]" />
        
        {/* AI Glowing Orbs */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#ef629f]/20 rounded-full mix-blend-multiply filter blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }} 
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }} 
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-purple-400/15 rounded-full mix-blend-multiply filter blur-[120px]" 
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/95" />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="glass mx-4 mt-4 flex items-center justify-between px-6 py-4 lg:mx-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white shadow-sm p-1">
              <img src="/logo.png" alt="Logo Semarang" className="h-full w-full object-contain" />
            </div>
            <span className="text-lg font-semibold">FixMind</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Masuk
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Mulai</Button>
            </Link>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-4 py-16 text-center lg:py-24 flex-1">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[#ef629f]/30 bg-white/80 px-4 py-1.5 text-sm text-muted backdrop-blur-sm shadow-sm">
              <Shield className="h-4 w-4 text-[#ef629f]" />
              Pemeliharaan fasilitas tingkat perusahaan
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 drop-shadow-sm">
              Kelola fasilitas Anda
              <br />
              <span className="text-gradient">dengan lebih cerdas</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-700 font-medium">
              FixMind membantu organisasi mengelola laporan kerusakan, memprioritaskan perbaikan,
              dan menyederhanakan alur kerja melalui dukungan keputusan berbasis AI.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="min-w-[160px] shadow-[0_0_25px_rgba(239,98,159,0.35)] hover:shadow-[0_0_35px_rgba(239,98,159,0.55)] hover:-translate-y-1 hover:scale-105 transition-all duration-300">
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="min-w-[160px] bg-white/60 backdrop-blur-md border-slate-300 text-slate-700 shadow-sm hover:bg-white hover:text-[#ef629f] hover:border-[#ef629f]/50 transition-all duration-300 hover:-translate-y-1">
                  Masuk
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 relative z-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="h-full"
              >
                <GlassCard className="h-full p-6 bg-white/80 hover:bg-white/95 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-[#ef629f]/15 border-white/80">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl gradient-primary shadow-md">
                    <f.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="border-t border-slate-300/40 py-8 text-center text-sm text-slate-500 bg-white/30 backdrop-blur-sm">
          © {new Date().getFullYear()} FixMind. Pemeliharaan Fasilitas Cerdas.
        </footer>
      </div>
    </div>
  )
}
