import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRightLeft,
  Building2,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  User,
  Users,
  Wrench,
  X,
  WifiOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutRequest } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'
import { NotificationBell } from '@/components/ui/notification-bell'
import { ChatWidget } from '@/components/ui/chat-widget'
import { GlobalSearchModal } from '@/components/ui/global-search-modal'
import type { UserRole } from '@/types/api'
import { useOfflineSync } from '@/components/providers/offline-sync-provider'

const navItems: Array<{
  to: string
  label: string
  icon: typeof LayoutDashboard
  roles?: UserRole[]
  end?: boolean
}> = [
  { to: '/dashboard', label: 'Dasbor', icon: LayoutDashboard, end: true },
  { to: '/dashboard/reports', label: 'Laporan Masalah', icon: ClipboardList },
  { to: '/dashboard/rooms', label: 'Fasilitas & Ruangan', icon: Building2 },
  { to: '/dashboard/asset-transfers', label: 'Pengajuan Transfer', icon: ArrowRightLeft, end: true },
  { to: '/dashboard/asset-transfers/review', label: 'Approval Transfer', icon: ClipboardCheck, roles: ['ADMIN'] },
  { to: '/dashboard/users', label: 'Pengguna', icon: Users, roles: ['ADMIN'] },
  { to: '/dashboard/maintenance', label: 'Jadwal Pemeliharaan', icon: Wrench, roles: ['ADMIN'] },
  { to: '/dashboard/profile', label: 'Profil Saya', icon: User, end: true },
]

function SidebarContent({
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
}: {
  onNavigate?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}) {
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
      <div className={cn("mb-8 flex flex-col gap-4 items-center px-2", !isCollapsed && "flex-row justify-between")}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden bg-white shadow-sm p-1 shrink-0">
            <img src="/logo.png" alt="Logo Semarang" className="h-full w-full object-contain" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-semibold text-[15px] leading-tight truncate">E-Lapor DPRD</p>
              <p className="text-xs text-muted truncate">Kota Semarang</p>
            </div>
          )}
        </div>
        <div className={cn("flex items-center gap-1.5 shrink-0", isCollapsed && "flex-col")}>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white hover:bg-white/80 text-muted hover:text-foreground shadow-sm border border-white/50 transition-colors"
            title="Cari Aset"
          >
            <Search className="h-4 w-4" />
          </button>
          <NotificationBell align={isCollapsed ? "right" : "left"} />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 relative">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors group',
                isActive
                  ? 'text-white font-semibold'
                  : 'text-slate-500 hover:bg-white/50 hover:text-slate-800',
                isCollapsed && 'justify-center px-0 w-10 h-10 mx-auto'
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 rounded-xl gradient-primary shadow-sm"
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{ zIndex: 0 }}
                  />
                )}
                <div className={cn("relative z-10 flex items-center gap-3", isCollapsed && "justify-center")}>
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                  
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 z-50 shadow-md font-normal">
                      {item.label}
                    </div>
                  )}
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-2 border-t border-slate-100/50 flex flex-col gap-1.5">
        {onToggleCollapse && (
          <Button
            variant="ghost"
            className={cn(
              "justify-start group relative text-slate-400 hover:text-slate-600 hover:bg-white/50",
              isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "px-3"
            )}
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronLeft className="h-4 w-4 shrink-0" />
            )}
            {!isCollapsed && "Sembunyikan Menu"}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 z-50 shadow-md font-normal">
                Buka Menu
              </div>
            )}
          </Button>
        )}

        <Button
          variant="ghost"
          className={cn(
            "justify-start group relative text-rose-500 hover:text-rose-600 hover:bg-rose-50/50",
            isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "px-3"
          )}
          onClick={() => setShowLogoutModal(true)}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && "Keluar"}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 z-50 shadow-md font-normal">
              Keluar
            </div>
          )}
        </Button>
      </div>

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
  const [searchOpen, setSearchOpen] = useState(false)
  const location = useLocation()
  const { isOnline, queueLength } = useOfflineSync()

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed')
    if (saved !== null) {
      return saved === 'true'
    }
    return window.innerWidth < 1280
  })

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed))
  }, [isCollapsed])

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true)
    window.addEventListener('open-global-search', handleOpenSearch)
    return () => window.removeEventListener('open-global-search', handleOpenSearch)
  }, [])

  return (
    <div className="flex min-h-screen">
      <aside className={cn(
        "glass relative z-40 m-4 hidden shrink-0 flex-col p-4 md:flex transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}>
        <SidebarContent
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="glass relative z-40 mx-4 mt-4 flex items-center justify-between px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
            <span className="font-semibold text-sm">E-Lapor DPRD</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-white hover:bg-white/80 text-muted hover:text-foreground shadow-sm border border-white/50 transition-colors"
              title="Cari Aset"
            >
              <Search className="h-4 w-4" />
            </button>
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
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ duration: 0.2 }}
                className="glass fixed inset-y-0 left-0 z-50 flex w-72 flex-col p-4 md:hidden"
              >
                <button className="mb-4 self-end" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                  <X className="h-6 w-6" />
                </button>
                <SidebarContent onNavigate={() => setMobileOpen(false)} />
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {!isOnline && (
          <div className="mx-4 mt-4 flex items-center justify-between gap-3 bg-amber-500 text-white px-4 py-3 rounded-2xl shadow-md border border-amber-400/25">
            <div className="flex items-center gap-2">
              <WifiOff className="h-4 w-4 shrink-0 animate-bounce" />
              <span className="text-xs font-semibold">
                Mode Offline: Anda sedang offline. Tindakan perubahan akan disimpan lokal dan disinkronkan saat kembali online.
              </span>
            </div>
            {queueLength > 0 && (
              <span className="bg-amber-600/60 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase shrink-0">
                {queueLength} Tertunda
              </span>
            )}
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.99 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        <ChatWidget />
      </div>

      <AnimatePresence>
        {searchOpen && (
          <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
