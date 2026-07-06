import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/api'

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
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export function RoleRoute({ roles }: { roles: UserRole[] }) {
  const { user, accessToken, isHydrated } = useAuthStore()

  if (!isHydrated) return null
  if (!accessToken) return <Navigate to="/login" replace />
  if (!user || !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
