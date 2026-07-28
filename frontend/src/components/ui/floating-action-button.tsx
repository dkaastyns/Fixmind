import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ClipboardList, ArrowRightLeft, CalendarClock, X } from 'lucide-react'
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
      {/* Light Backdrop Blur Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-slate-900/15 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Action Container */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end pointer-events-none select-none">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 15, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="mb-2.5 w-64 rounded-3xl bg-white/80 border border-white/60 backdrop-blur-2xl p-2.5 shadow-2xl shadow-slate-900/10 space-y-1 text-slate-800 pointer-events-auto"
            >
              {/* Card Header Title */}
              <div className="px-3 pt-1.5 pb-1 flex items-center justify-between border-b border-slate-200/50 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Menu Aksi Cepat
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 text-[#d9a416] border border-amber-200/60">
                  FixMind
                </span>
              </div>

              {/* Action 1: Lapor Kerusakan */}
              <button
                onClick={handleQuickReport}
                className="w-full flex items-center gap-3 p-2 rounded-2xl bg-white/50 hover:bg-amber-50/80 active:scale-98 transition-all group text-left cursor-pointer border border-white/60 hover:border-amber-200/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F9D141] text-slate-950 font-bold shadow-xs group-hover:scale-105 transition-transform">
                  <ClipboardList className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-800 group-hover:text-[#d9a416] transition-colors leading-tight">
                    Lapor Kerusakan
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    Buat aduan fasilitas baru
                  </p>
                </div>
              </button>

              {/* Action 2: Ajukan Transfer Aset */}
              <button
                onClick={handleTransfer}
                className="w-full flex items-center gap-3 p-2 rounded-2xl bg-white/50 hover:bg-blue-50/80 active:scale-98 transition-all group text-left cursor-pointer border border-white/60 hover:border-blue-200/60"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white font-bold shadow-xs group-hover:scale-105 transition-transform">
                  <ArrowRightLeft className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">
                    Transfer Aset
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    Permohonan pindah ruangan
                  </p>
                </div>
              </button>

              {/* Action 3: Jadwal Pemeliharaan (Admin Only) */}
              {user?.role === 'ADMIN' && (
                <button
                  onClick={handleMaintenance}
                  className="w-full flex items-center gap-3 p-2 rounded-2xl bg-white/50 hover:bg-emerald-50/80 active:scale-98 transition-all group text-left cursor-pointer border border-white/60 hover:border-emerald-200/60"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white font-bold shadow-xs group-hover:scale-105 transition-transform">
                    <CalendarClock className="h-4.5 w-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-extrabold text-slate-800 group-hover:text-emerald-600 transition-colors leading-tight">
                      Jadwal Pemeliharaan
                    </p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      Kelola agenda & vendor
                    </p>
                  </div>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Semi-Transparent Liquid Glass Capsule Trigger */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/40 hover:bg-white/60 text-slate-800 font-extrabold text-xs tracking-wide shadow-lg hover:shadow-xl border border-white/60 backdrop-blur-xl cursor-pointer pointer-events-auto transition-all duration-300 group shadow-slate-900/5"
          aria-label="Aksi Cepat"
          title="Menu Aksi Cepat"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="flex items-center justify-center h-5 w-5 rounded-full bg-[#F9D141] text-slate-950 shadow-xs"
          >
            {isOpen ? <X className="h-3 w-3 stroke-[3]" /> : <Plus className="h-3.5 w-3.5 stroke-[3]" />}
          </motion.div>
          <span className="text-slate-800 group-hover:text-slate-950 transition-colors font-extrabold">
            {isOpen ? 'Tutup Menu' : 'Aksi Cepat'}
          </span>
        </motion.button>
      </div>
    </>
  )
}
