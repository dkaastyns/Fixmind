import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ClipboardList, ArrowRightLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleQuickReport = () => {
    navigate('/dashboard/reports')
    // Delay slightly to give page navigation time to complete before dispatching modal trigger
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-report-create-modal'))
    }, 150)
    setIsOpen(false)
  }

  const handleTransfer = () => {
    navigate('/dashboard/asset-transfers')
    setIsOpen(false)
  }


  return (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col items-center gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-2.5"
          >
            {/* Action 1: Lapor Kerusakan */}
            <button
              onClick={handleQuickReport}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-white hover:bg-slate-50 text-[#d9a416] shadow-lg border border-yellow-100 hover:scale-105 active:scale-95 transition-all group relative cursor-pointer"
              title="Lapor Kerusakan"
            >
              <ClipboardList className="h-4 w-4" />
              <span className="absolute right-full mr-3.5 px-2.5 py-1.5 bg-slate-950 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md font-semibold border border-white/10 leading-normal">
                Lapor Kerusakan
              </span>
            </button>

            {/* Action 2: Ajukan Transfer */}
            <button
              onClick={handleTransfer}
              className="flex items-center justify-center h-10 w-10 rounded-xl bg-white hover:bg-slate-50 text-blue-600 shadow-lg border border-blue-100 hover:scale-105 active:scale-95 transition-all group relative cursor-pointer"
              title="Ajukan Transfer"
            >
              <ArrowRightLeft className="h-4 w-4" />
              <span className="absolute right-full mr-3.5 px-2.5 py-1.5 bg-slate-950 text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-md font-semibold border border-white/10 leading-normal">
                Transfer Aset
              </span>
            </button>


          </motion.div>
        )}
      </AnimatePresence>

      {/* Main trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 text-white bg-gradient-to-tr from-[#F9D141] to-[#dbb31a] cursor-pointer",
          isOpen && "rotate-45"
        )}
        aria-label="Pilihan Cepat"
        title="Menu Pilihan Cepat"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  )
}
