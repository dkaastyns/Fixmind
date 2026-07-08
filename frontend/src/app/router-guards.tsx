import { Navigate, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth-store'

export function ProtectedRoute() {
  const { accessToken, isHydrated } = useAuthStore()

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-white via-gray-50/50 to-white/90 relative overflow-hidden">
        {/* Soft floating glow background */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-[#ef629f]/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-[#eecda3]/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 flex flex-col items-center p-8 rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl max-w-sm text-center"
        >
          {/* Pulsing logo container */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-md p-2 overflow-hidden border border-white/60 mb-5"
          >
            <img src="/logo.png" alt="Logo Semarang" className="h-full w-full object-contain" />
          </motion.div>

          <h2 className="text-lg font-semibold text-slate-800 tracking-tight">FixMind</h2>
          <p className="mt-1.5 text-xs text-muted font-medium flex items-center gap-1.5 justify-center">
            Menghubungkan ke layanan
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ef629f] animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-[#ef629f] animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="h-1.5 w-1.5 rounded-full bg-[#ef629f] animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </p>
        </motion.div>
      </div>
    )
  }

  if (!accessToken) return <Navigate to="/login" replace />
  return <Outlet />
}

export function GuestRoute() {
  const { accessToken, isHydrated } = useAuthStore()

  if (!isHydrated) return null
  if (accessToken) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function AdminRoute() {
  const { user, accessToken, isHydrated } = useAuthStore()

  if (!isHydrated) return null
  if (!accessToken) return <Navigate to="/login" replace />
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
