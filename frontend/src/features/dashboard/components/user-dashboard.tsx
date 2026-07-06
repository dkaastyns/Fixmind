import { useQuery } from '@tanstack/react-query'
import { fetchOverview, fetchReports } from '@/lib/api-client'
import { AnimatedGlassCard } from '@/components/ui/animated-glass-card'
import { PageHeader, StatusBadge, EmptyState } from '@/components/ui/feedback'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { ClipboardList, PlusCircle, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function UserDashboard() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['overview'],
    queryFn: () => fetchOverview(token),
  })

  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ['reports', 'my-reports'],
    queryFn: () => fetchReports(token),
  })

  const stats = statsData?.data
  const recentReports = reportsData?.data?.slice(0, 5) || []

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <PageHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0] ?? 'User'}`}
        description="Track your reported issues or submit a new one."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="sm:col-span-3 lg:col-span-1"
        >
          <div 
            onClick={() => navigate('/dashboard/reports')}
            className="cursor-pointer h-full rounded-xl gradient-primary p-6 flex flex-col items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <PlusCircle className="w-12 h-12 mb-3 opacity-90" />
            </motion.div>
            <h3 className="text-xl font-semibold">Report Damage</h3>
            <p className="text-sm opacity-80 mt-1 text-center">Found an issue? Let us know immediately.</p>
          </div>
        </motion.div>

        <AnimatedGlassCard className="p-5 flex flex-col justify-center sm:col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <ClipboardList className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted">My Reports</p>
          </div>
          <p className="text-3xl font-semibold text-gradient">
            {loadingStats ? '...' : (stats?.total ?? '0')}
          </p>
        </AnimatedGlassCard>

        <AnimatedGlassCard className="p-5 flex flex-col justify-center sm:col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-muted">Resolved</p>
          </div>
          <p className="text-3xl font-semibold text-gradient">
            {loadingStats ? '...' : (stats?.completedLast30Days ?? '0')}
          </p>
        </AnimatedGlassCard>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <AnimatedGlassCard className="p-0 overflow-hidden">
          <div className="p-5 border-b border-white/20 flex justify-between items-center">
            <h2 className="text-lg font-medium">Recent Activity</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/reports')}>
              View All
            </Button>
          </div>
          
          {loadingReports ? (
            <p className="p-6 text-sm text-muted">Loading recent reports...</p>
          ) : recentReports.length === 0 ? (
            <EmptyState title="No reports yet" description="Your submitted reports will appear here." />
          ) : (
            <motion.ul 
              className="divide-y divide-white/20"
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {recentReports.map((report) => (
                <motion.li key={report.id} variants={itemVariants} className="p-5 hover:bg-white/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <Link to={`/dashboard/reports/${report.id}`} className="font-medium hover:text-[#ef629f] transition-colors">
                        {report.title}
                      </Link>
                      <p className="text-sm text-muted mt-1">
                        {new Date(report.createdAt).toLocaleDateString()} — {report.roomName ?? report.roomCode}
                      </p>
                    </div>
                    <div>
                      <StatusBadge status={report.status} />
                    </div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatedGlassCard>
      </motion.div>
    </motion.div>
  )
}
