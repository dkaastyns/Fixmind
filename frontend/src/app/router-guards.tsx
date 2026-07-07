import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

export function ProtectedRoute() {
  const { accessToken, isHydrated } = useAuthStore()

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#ef629f] border-t-transparent" />
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
