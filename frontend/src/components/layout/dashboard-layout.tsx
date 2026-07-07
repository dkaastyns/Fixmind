import { useState } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3,
  Building2,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  Wrench,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutRequest } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/ui/notification-bell'
import { ChatWidget } from '@/components/ui/chat-widget'
import type { UserRole } from '@/types/api'

const navItems: Array<{
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles?: UserRole[]
}> = [
  { to: '/dashboard', label: 'Dasbor', icon: LayoutDashboard },
  { to: '/dashboard/reports', label: 'Laporan Masalah', icon: ClipboardList },
  { to: '/dashboard/rooms', label: 'Fasilitas & Ruangan', icon: Building2 },
  { to: '/dashboard/maintenance', label: 'Jadwal Pemeliharaan', icon: Calendar, roles: ['ADMIN', 'TECHNICIAN'] },
  { to: '/dashboard/users', label: 'Pengguna', icon: Users, roles: ['ADMIN'] },
  { to: '/dashboard/analytics', label: 'Analitik', icon: BarChart3, roles: ['ADMIN'] },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const { user, accessToken, clearSession } = useAuthStore()

  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const confirmLogout = async () => {
    if (accessToken) {
      try { await logoutRequest(accessToken) } catch { /* ignore */ }
    }
    clearSession()
    navigate('/login', { replace: true })
  }

  const visibleNav = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  )

  return (
    <>
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-[15px] leading-tight">E-Lapor DPRD</p>
            <p className="text-xs text-muted">Kota Semarang</p>
          </div>
        </div>
        <NotificationBell />
      </div>

      <nav className="flex flex-1 flex-col gap-1 relative">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'text-white'
                  : 'text-muted hover:bg-white/50 hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-xl gradient-primary shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    style={{ zIndex: 0 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <Button variant="ghost" className="justify-start mt-2" onClick={() => setShowLogoutModal(true)}>
        <LogOut className="h-4 w-4" />
        Keluar
      </Button>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showLogoutModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                onClick={() => setShowLogoutModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl border border-gray-100"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ef629f]/10">
                  <LogOut className="h-6 w-6 text-[#ef629f]" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Keluar dari Akun</h3>
                <p className="mb-6 text-sm text-gray-500">Apakah Anda yakin ingin keluar dari akun ini?</p>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200" onClick={() => setShowLogoutModal(false)}>
                    Batal
                  </Button>
                  <Button className="flex-1 rounded-xl bg-[#ef629f] text-white hover:bg-[#ef629f]/90" onClick={confirmLogout}>
                    Ya, Keluar
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <aside className="glass m-4 hidden w-64 shrink-0 flex-col p-4 lg:flex">
        <SidebarContent />
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="glass mx-4 mt-4 flex items-center justify-between px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#ef629f]" />
            <span className="font-semibold">E-Lapor DPRD</span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button onClick={() => setMobileOpen(true)} aria-label="Buka menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </header>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.2 }}
                className="glass fixed inset-y-0 left-0 z-50 flex w-72 flex-col p-4 lg:hidden"
              >
                <button className="mb-4 self-end" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 lg:p-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Global Chatbot AI */}
        <ChatWidget />
      </div>
    </div>
  )
}
