import { useAuthStore } from '@/stores/auth-store'
import { AdminDashboard } from '../components/admin-dashboard'
import { TechnicianDashboard } from '../components/technician-dashboard'
import { UserDashboard } from '../components/user-dashboard'

export function DashboardHomePage() {
  const user = useAuthStore((s) => s.user)

  if (user?.role === 'ADMIN') {
    return <AdminDashboard />
  }

  if (user?.role === 'TECHNICIAN') {
    return <TechnicianDashboard />
  }

  return <UserDashboard />
}
