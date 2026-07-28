import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ClipboardList, ArrowRightLeft, CalendarClock, Zap, X } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  const handleQuickReport = () => {
    navigate('/dashboard/reports')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-report-create-modal'))
    }, 150)
    setIsOpen(false)
  }

  const handleTransfer = () => {
    navigate('/dashboard/asset-transfers')
    setIsOpen(false)
  }

  const handleMaintenance = () => {
    navigate('/dashboard/maintenance')
    setIsOpen(false)
  }

  return (
    <>
      {/* iOS Backdrop Blur Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[3px] pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Container */}
      <div className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-50 flex flex-col items-end pointer-events-none select-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 15, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="mb-3 w-64 rounded-3xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl p-2.5 shadow-2xl space-y-1 pointer-events-auto"
            >
              {/* Card Header Title */}
              <div className="px-3 pt-2 pb-1 flex items-center justify-between border-b border-white/10 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Menu Aksi Cepat
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-[#F9D141] border border-amber-500/30">
                  FixMind iOS
                </span>
              </div>

              {/* Action 1: Lapor Kerusakan */}
              <button
                onClick={handleQuickReport}
                className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white/10 active:scale-98 transition-all group text-left cursor-pointer border border-transparent hover:border-white/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold shadow-md group-hover:scale-105 transition-transform">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white group-hover:text-[#F9D141] transition-colors leading-tight">
                    Lapor Kerusakan
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Buat aduan fasilitas baru
                  </p>
                </div>
              </button>

              {/* Action 2: Ajukan Transfer Aset */}
              <button
                onClick={handleTransfer}
                className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white/10 active:scale-98 transition-all group text-left cursor-pointer border border-transparent hover:border-white/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white font-bold shadow-md group-hover:scale-105 transition-transform">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-white group-hover:text-blue-300 transition-colors leading-tight">
                    Transfer Aset
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    Permohonan pindah ruangan
                  </p>
                </div>
              </button>

              {/* Action 3: Jadwal Pemeliharaan (Admin Only) */}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={handleMaintenance}
                  className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white/10 active:scale-98 transition-all group text-left cursor-pointer border border-transparent hover:border-white/10"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white font-bold shadow-md group-hover:scale-105 transition-transform">
                    <CalendarClock className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-tight">
                      Jadwal Pemeliharaan
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      Kelola agenda & vendor
                    </p>
                  </div>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* iOS Floating Glass Capsule Trigger */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white font-extrabold text-xs tracking-wide shadow-2xl border border-white/20 backdrop-blur-xl cursor-pointer pointer-events-auto transition-all duration-300 group"
          aria-label="Aksi Cepat"
          title="Menu Aksi Cepat"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="flex items-center justify-center h-6 w-6 rounded-full bg-[#F9D141] text-slate-950 shadow-sm"
          >
            {isOpen ? <X className="h-3.5 w-3.5" /> : <Plus className="h-4 w-4 stroke-[3]" />}
          </motion.div>
          <span className="text-white group-hover:text-[#F9D141] transition-colors">
            {isOpen ? 'Tutup Menu' : 'Aksi Cepat'}
          </span>
          {!isOpen && (
            <Zap className="h-3.5 w-3.5 text-[#F9D141] animate-pulse" />
          )}
        </motion.button>
      </div>
    </>
  )
}
