import { useQuery } from '@tanstack/react-query'
import { fetchReports } from '@/lib/api-client'
import { AnimatedGlassCard } from '@/components/ui/animated-glass-card'
import { PageHeader, StatusBadge } from '@/components/ui/feedback'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Report } from '@/types/api'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

export function TechnicianDashboard() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)

  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['reports', 'my-assigned'],
    queryFn: () => fetchReports(token),
  })

  const activeTasks: Report[] = reportsData?.data?.filter((r: Report) => r.status === 'ASSIGNED' || r.status === 'IN_PROGRESS') || []

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title={`Halo, ${user?.fullName?.split(' ')[0] ?? 'Teknisi'}`}
        description="Berikut adalah daftar tugas perbaikan fasilitas yang ditugaskan kepada Anda"
      />

      <AnimatedGlassCard>
        <h2 className="text-lg font-medium mb-4">Tugas Berjalan ({activeTasks.length})</h2>
        
        {isLoading ? (
          <p className="text-sm text-muted">Memuat tugas...</p>
        ) : activeTasks.length === 0 ? (
          <div className="py-8 text-center text-muted border border-dashed border-white/20 rounded-xl">
            <p>Anda tidak memiliki tugas yang ditugaskan saat ini.</p>
          </div>
        ) : (
          <motion.div 
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {activeTasks.map((t: Report) => (
              <motion.div key={t.id} variants={itemVariants}>
                <Link to={`/dashboard/reports/${t.id}`}>
                  <div className="p-4 rounded-xl bg-white/40 hover:bg-white/60 transition-colors border border-white/40 flex flex-col h-full cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 line-clamp-1" title={t.title}>{t.title}</h3>
                      <StatusBadge status={t.status} />
                    </div>
                    <p className="text-sm text-muted mb-4 line-clamp-2">{t.description}</p>
                    <div className="mt-auto flex justify-between items-end">
                      <p className="text-xs text-muted font-medium bg-white/50 px-2 py-1 rounded-md">{t.roomCode}</p>
                      {t.priority && <StatusBadge status={t.priority} />}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatedGlassCard>
    </motion.div>
  )
}
