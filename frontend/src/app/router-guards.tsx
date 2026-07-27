import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { FullPageLoading } from '@/components/ui/full-page-loading'

export function ProtectedRoute() {
  const { accessToken, isHydrated } = useAuthStore()

  if (!isHydrated) {
    return <FullPageLoading text="Menghubungkan ke layanan" />
  }

  if (!accessToken) return <Navigate to="/login" replace />
  return <Outlet />
}

export function GuestRoute() {
  const { accessToken, isHydrated } = useAuthStore()

  if (!isHydrated) return <FullPageLoading text="Menyiapkan sesi" />
  if (accessToken) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function AdminRoute() {
  const { user, accessToken, isHydrated } = useAuthStore()

  if (!isHydrated) return <FullPageLoading text="Memeriksa akses admin" />
  if (!accessToken) return <Navigate to="/login" replace />
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
