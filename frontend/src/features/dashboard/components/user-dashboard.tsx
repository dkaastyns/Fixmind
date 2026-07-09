import { useQuery } from '@tanstack/react-query'
import { fetchOverview, fetchReports, fetchAssetTransfers } from '@/lib/api-client'
import { AnimatedGlassCard } from '@/components/ui/animated-glass-card'
import { StatusBadge, EmptyState } from '@/components/ui/feedback'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { ClipboardList, PlusCircle, CheckCircle2, ArrowRightLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton, ListSkeleton } from '@/components/ui/skeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
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

  const { data: transfersData, isLoading: loadingTransfers } = useQuery({
    queryKey: ['asset-transfers', 'mine-dashboard'],
    queryFn: () => fetchAssetTransfers(token, { mineOnly: true, limit: 5 }),
  })

  const stats = statsData?.data
  const recentReports = reportsData?.data?.slice(0, 4) || []
  const recentTransfers = transfersData?.data?.slice(0, 4) || []
  const pendingTransfersCount = transfersData?.data?.filter(t => t.status === 'PENDING').length || 0

  const todayStr = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Premium Welcome Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 border border-white/50 rounded-2xl p-6 shadow-sm backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Selamat Datang, <span className="text-gradient font-extrabold">{user?.fullName ?? 'Pengguna'}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-1.5">
            <span>📅</span> {todayStr}
          </p>
          <p className="text-sm text-slate-600 mt-2 max-w-xl">
            Pantau status laporan kerusakan fasilitas dan pengajuan perpindahan aset Anda secara real-time dari panel kontrol ini.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/60 p-3 rounded-xl border border-white/50 shadow-sm">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {user?.fullName?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">{user?.fullName}</p>
            <p className="text-xs text-slate-500 capitalize font-semibold">{user?.role?.toLowerCase() ?? 'User'}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-3.5 rounded bg-[#ef629f]"></span>
          Aksi Cepat
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Action 1: Laporkan Masalah */}
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/dashboard/reports')}
            className="cursor-pointer rounded-2xl gradient-primary p-6 flex flex-col justify-between text-white shadow-md hover:shadow-xl transition-all relative overflow-hidden group min-h-[140px]"
          >
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <PlusCircle className="w-36 h-36" />
            </div>
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4 relative z-10">
              <h3 className="text-lg font-bold">Laporkan Masalah Baru</h3>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">
                Temukan kerusakan fasilitas atau ruangan? Laporkan segera ke tim pemeliharaan.
              </p>
            </div>
          </motion.div>

          {/* Action 2: Ajukan Transfer Aset */}
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/dashboard/asset-transfers')}
            className="cursor-pointer rounded-2xl bg-slate-800 text-white p-6 flex flex-col justify-between shadow-md hover:shadow-xl transition-all relative overflow-hidden group min-h-[140px]"
          >
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <ArrowRightLeft className="w-36 h-36" />
            </div>
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md">
                <ArrowRightLeft className="w-6 h-6 text-white" />
              </div>
              <ChevronRight className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="mt-4 relative z-10">
              <h3 className="text-lg font-bold">Ajukan Perpindahan Aset</h3>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">
                Ingin memindahkan aset/inventaris ke ruangan lain? Ajukan approval transfer di sini.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <AnimatedGlassCard className="p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 shadow-inner">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Laporan Saya</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">
              {loadingStats ? <Skeleton className="h-8 w-12" /> : (stats?.total ?? '0')}
            </p>
          </div>
        </AnimatedGlassCard>

        <AnimatedGlassCard className="p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 rounded-xl bg-green-500/10 text-green-500 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Laporan Selesai</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">
              {loadingStats ? <Skeleton className="h-8 w-12" /> : (stats?.completedLast30Days ?? '0')}
            </p>
          </div>
        </AnimatedGlassCard>

        <AnimatedGlassCard className="p-5 flex items-center gap-4 relative overflow-hidden">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 shadow-inner">
            <ArrowRightLeft className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transfer Menunggu</p>
            <p className="text-3xl font-extrabold text-slate-800 mt-1">
              {loadingTransfers ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                pendingTransfersCount
              )}
            </p>
          </div>
        </AnimatedGlassCard>
      </div>

      {/* Split Lists: Reports & Transfers */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Reports */}
        <AnimatedGlassCard className="p-0 overflow-hidden flex flex-col h-full border border-white/40">
          <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/20">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              <h2 className="text-sm font-bold text-slate-800">Laporan Masalah Terbaru</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/reports')} className="text-xs hover:bg-white/40 text-blue-600 font-semibold">
              Lihat Semua
            </Button>
          </div>
          
          <div className="flex-1 p-3">
            {loadingReports ? (
              <ListSkeleton count={4} />
            ) : recentReports.length === 0 ? (
              <EmptyState title="Belum ada laporan" description="Laporan yang Anda ajukan akan muncul di sini." />
            ) : (
              <motion.ul 
                className="space-y-1.5"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {recentReports.map((report) => (
                  <motion.li 
                    key={report.id} 
                    variants={itemVariants} 
                    className="p-3.5 rounded-xl hover:bg-white/45 border border-transparent hover:border-white/50 transition-all cursor-pointer"
                    onClick={() => navigate(`/dashboard/reports/${report.id}`)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-800 text-sm hover:text-[#ef629f] transition-colors block truncate">
                          {report.title}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <span>{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                          <span>•</span>
                          <span className="truncate">{report.roomName ?? report.roomCode}</span>
                        </p>
                      </div>
                      <StatusBadge status={report.status} />
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </AnimatedGlassCard>

        {/* Recent Transfers */}
        <AnimatedGlassCard className="p-0 overflow-hidden flex flex-col h-full border border-white/40">
          <div className="p-4 border-b border-white/20 flex justify-between items-center bg-white/20">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-500" />
              <h2 className="text-sm font-bold text-slate-800">Pengajuan Transfer Terbaru</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/asset-transfers')} className="text-xs hover:bg-white/40 text-amber-600 font-semibold">
              Lihat Semua
            </Button>
          </div>
          
          <div className="flex-1 p-3">
            {loadingTransfers ? (
              <ListSkeleton count={4} />
            ) : recentTransfers.length === 0 ? (
              <EmptyState title="Belum ada pengajuan" description="Pengajuan transfer aset Anda akan muncul di sini." />
            ) : (
              <motion.ul 
                className="space-y-1.5"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {recentTransfers.map((transfer) => (
                  <motion.li 
                    key={transfer.id} 
                    variants={itemVariants} 
                    className="p-3.5 rounded-xl hover:bg-white/45 border border-transparent hover:border-white/50 transition-all cursor-pointer"
                    onClick={() => navigate('/dashboard/asset-transfers')}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-800 text-sm hover:text-[#ef629f] transition-colors block truncate">
                          {transfer.assetName ?? transfer.assetKode ?? 'Aset'}
                        </span>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="bg-slate-100/80 border border-slate-200/50 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700">{transfer.assetKode}</span>
                          <span className="font-medium">{transfer.fromRoomCode}</span>
                          <span className="text-slate-400">→</span>
                          <span className="font-medium text-slate-700">{transfer.toRoomCode}</span>
                        </div>
                      </div>
                      <StatusBadge status={transfer.status} />
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </AnimatedGlassCard>
      </div>
    </motion.div>
  )
}
