import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ClipboardList, ArrowRightLeft, CalendarClock } from 'lucide-react'
import { cn } from '@/lib/utils'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.5 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 20
    }
  },
  exit: { opacity: 0, y: 10, scale: 0.8, transition: { duration: 0.2 } }
}

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
  
  const handleMaintenance = () => {
    navigate('/dashboard/maintenance')
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-8 right-6 md:bottom-10 md:right-10 z-40 flex flex-col items-center gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col items-center gap-3"
          >
            {/* Action 1: Lapor Kerusakan */}
            <motion.button
              variants={itemVariants}
              onClick={handleQuickReport}
              className="flex items-center justify-center h-11 w-11 rounded-xl bg-white hover:bg-slate-50 text-[#d9a416] shadow-lg border border-yellow-100 hover:scale-105 active:scale-95 transition-all group relative cursor-pointer"
              title="Lapor Kerusakan"
            >
              <ClipboardList className="h-5 w-5" />
              <span className="absolute right-full mr-3.5 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-md font-medium border border-white/10">
                Lapor Kerusakan
              </span>
            </motion.button>

            {/* Action 2: Ajukan Transfer */}
            <motion.button
              variants={itemVariants}
              onClick={handleTransfer}
              className="flex items-center justify-center h-11 w-11 rounded-xl bg-white hover:bg-slate-50 text-blue-600 shadow-lg border border-blue-100 hover:scale-105 active:scale-95 transition-all group relative cursor-pointer"
              title="Ajukan Transfer"
            >
              <ArrowRightLeft className="h-5 w-5" />
              <span className="absolute right-full mr-3.5 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-md font-medium border border-white/10">
                Transfer Aset
              </span>
            </motion.button>
            
            {/* Action 3: Jadwal Pemeliharaan */}
            <motion.button
              variants={itemVariants}
              onClick={handleMaintenance}
              className="flex items-center justify-center h-11 w-11 rounded-xl bg-white hover:bg-slate-50 text-emerald-600 shadow-lg border border-emerald-100 hover:scale-105 active:scale-95 transition-all group relative cursor-pointer"
              title="Jadwal Pemeliharaan"
            >
              <CalendarClock className="h-5 w-5" />
              <span className="absolute right-full mr-3.5 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-md font-medium border border-white/10">
                Jadwal Pemeliharaan
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl shadow-xl transition-colors duration-300 text-white bg-gradient-to-tr from-[#F9D141] to-[#dbb31a] hover:from-[#dbb31a] hover:to-[#c29c13] cursor-pointer"
        )}
        aria-label="Pilihan Cepat"
        title="Menu Pilihan Cepat"
      >
        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Plus className="h-7 w-7" />
        </motion.div>
      </motion.button>
    </div>
  )
}
