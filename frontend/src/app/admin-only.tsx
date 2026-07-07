import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user?.isAdmin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
