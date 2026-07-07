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
    title: 'Alur Kerja Teknisi',
    description: 'Menugaskan, memantau kemajuan, unggah foto perbaikan, dan menutup laporan dengan efisien.',
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
    <div className="min-h-screen">
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

      <section className="mx-auto max-w-6xl px-4 py-16 text-center lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-4 py-1.5 text-sm text-muted backdrop-blur-sm">
            <Shield className="h-4 w-4 text-[#ef629f]" />
            Pemeliharaan fasilitas tingkat perusahaan
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Kelola fasilitas Anda
            <br />
            <span className="text-gradient">dengan lebih cerdas</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted">
            FixMind membantu organisasi mengelola laporan kerusakan, menugaskan teknisi,
            dan memprioritaskan perbaikan melalui dukungan keputusan berbasis AI.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="min-w-[160px]">
                Daftar Sekarang
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg" className="min-w-[160px]">
                Masuk
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.08 }}
            >
              <GlassCard className="h-full p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                  <f.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/40 py-8 text-center text-sm text-muted">
        © {new Date().getFullYear()} FixMind. Pemeliharaan Fasilitas Cerdas.
      </footer>
    </div>
  )
}
