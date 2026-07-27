import { motion } from 'framer-motion'

export function FullPageLoading({ text = 'Menghubungkan ke layanan' }: { text?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-gradient-to-tr from-white via-slate-50 to-amber-50/40 font-sans select-none">
      
      {/* Subtle Background Image Overlay */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.07]">
        <img
          src="/new-bg_dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
      </div>

      {/* Ambient Floating Glow Orbs */}
      <motion.div
        animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-[#F9D141]/20 blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.3, 0.5, 0.3] }}
        transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl pointer-events-none"
      />

      {/* Main Bright Frosted White Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center p-8 sm:p-10 rounded-[28px] border border-white/90 bg-white/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.08)] max-w-sm w-full text-center space-y-4"
      >
        {/* Pulsing Logo Container */}
        <div className="relative mb-1">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#F9D141] via-amber-400 to-[#F9D141] opacity-75 blur-xs animate-pulse" />
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="relative flex items-center justify-center rounded-2xl bg-white shadow-md border border-amber-200/80 px-6 py-3.5"
          >
            <img 
              src="/jdih-logo.png" 
              alt="JDIH Kota Semarang" 
              className="h-10 w-auto object-contain" 
            />
          </motion.div>
        </div>

        {/* App Title & Subtitle */}
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">
            <span className="text-[#d9a416]">Fix</span>Mind
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-500 flex items-center gap-1.5 justify-center">
            <span>{text}</span>
            <span className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9a416] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9a416] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9a416] animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </p>
        </div>

        {/* Indeterminate Gold Progress Bar */}
        <div className="w-44 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80 shadow-inner relative mt-2">
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="w-1/2 h-full rounded-full gradient-gold shadow-xs"
          />
        </div>
      </motion.div>
    </div>
  )
}
