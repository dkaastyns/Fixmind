import { useQuery } from '@tanstack/react-query'
import { fetchOverview, fetchReports, fetchAssetTransfers } from '@/lib/api-client'
import { StatusBadge, EmptyState } from '@/components/ui/feedback'
import { useAuthStore } from '@/stores/auth-store'
import { motion } from 'framer-motion'
import { ArrowRightLeft, Menu, Search, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Skeleton, ListSkeleton } from '@/components/ui/skeleton'
import { NotificationBell } from '@/components/ui/notification-bell'

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
  const recentReports = reportsData?.data?.slice(0, 3) || []
  const recentTransfers = transfersData?.data?.slice(0, 3) || []
  const pendingTransfersCount = transfersData?.data?.filter(t => t.status === 'PENDING').length || 0

  const todayStr = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <motion.div 
      className="space-y-6 pb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Banner Container */}
      <div 
        className="relative overflow-hidden w-full bg-cover bg-center rounded-b-[2.5rem] md:rounded-3xl shadow-md pt-6 pb-8 px-5 md:py-8 md:px-8 text-white min-h-[320px] flex flex-col justify-between"
        style={{ backgroundImage: 'url("/new-bg_dprd.jpg")' }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-slate-950/70 z-0" />
        
        {/* Mobile Header Toolbar */}
        <div className="relative z-10 flex items-center justify-between md:hidden w-full">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-menu'))}
            className="p-1 text-[#ffd043] hover:text-yellow-300 transition-colors cursor-pointer"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-extrabold text-xl tracking-tight text-white">FixMind</span>
          <div>
            <NotificationBell 
              align="right" 
              className="bg-transparent border-transparent text-[#ffd043] hover:bg-white/10 hover:text-[#ffd043] p-1 shadow-none" 
            />
          </div>
        </div>

        {/* Banner Details */}
        <div className="relative z-10 flex flex-col justify-end flex-grow mt-6 md:mt-0">
          <div>
            <p className="text-xs md:text-sm font-semibold opacity-90 tracking-wide text-slate-300">
              {todayStr}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1 text-white leading-tight">
              Halo, {user?.fullName ?? 'Pengguna'}
            </h1>
            <p className="text-xs md:text-sm mt-1.5 text-slate-200 max-w-xl font-medium leading-relaxed opacity-90">
              Pantau status laporan kerusakan fasilitas dan pengajuan perpindahan aset
            </p>
          </div>

          {/* Search Bar pill */}
          <div className="mt-6">
            <div 
              onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
              className="cursor-pointer flex items-center gap-3.5 bg-black/35 hover:bg-black/45 border border-white/10 rounded-2xl px-4 py-3.5 shadow-inner backdrop-blur-md transition-all group duration-200"
            >
              <div className="p-2 rounded-xl bg-[#ffd043]/15 text-[#ffd043]">
                <Search className="w-5 h-5" />
              </div>
              <div className="flex-grow text-left min-w-0">
                <p className="text-sm font-bold text-white group-hover:text-[#ffd043] transition-colors leading-tight">
                  Cari aset yang seperti apa?
                </p>
                <p className="text-[10px] text-slate-300 font-semibold mt-1 tracking-wide">
                  Apapun • Kapanpun • Dimanapun
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (Padded on mobile) */}
      <div className="px-5 md:px-0 space-y-6">
        
        {/* Quick Actions Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {/* Action 1: Laporkan Masalah */}
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/dashboard/reports')}
            className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#d94a26] via-[#e25329] to-[#b32b0f] p-6 flex flex-col justify-between text-white shadow-md hover:shadow-lg transition-all relative overflow-hidden group min-h-[140px]"
          >
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
              <AlertCircle className="w-36 h-36" />
            </div>
            
            <div className="p-2 rounded-xl bg-white/20 border border-white/30 backdrop-blur-md w-fit">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>

            <div className="mt-4 relative z-10">
              <h3 className="text-lg font-bold leading-tight">Laporkan Masalah Baru</h3>
              <p className="text-xs opacity-90 mt-1 font-medium leading-normal">
                Temukan kerusakan fasilitas? Segera laporkan!
              </p>
            </div>
          </motion.div>

          {/* Action 2: Ajukan Transfer Aset */}
          <motion.div
            whileHover={{ scale: 1.01, y: -2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate('/dashboard/asset-transfers')}
            className="cursor-pointer rounded-2xl bg-gradient-to-br from-[#dbb633] to-[#937b26] p-6 flex flex-col justify-between text-white shadow-md hover:shadow-lg transition-all relative overflow-hidden group min-h-[140px]"
          >
            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 group-hover:scale-105 transition-transform duration-300 pointer-events-none">
              <ArrowRightLeft className="w-36 h-36" />
            </div>
            
            <div className="p-2 rounded-xl bg-[#f7cf41]/40 border border-[#f7cf41]/20 backdrop-blur-md w-fit">
              <ArrowRightLeft className="w-6 h-6 text-white" />
            </div>

            <div className="mt-4 relative z-10">
              <h3 className="text-lg font-bold leading-tight">Ajukan Perpindahan Aset</h3>
              <p className="text-xs opacity-90 mt-1 font-medium leading-normal">
                Ingin memindahkan aset ke ruangan lain?
              </p>
            </div>
          </motion.div>
        </div>

        {/* Stats Counter Grid */}
        <div className="grid gap-3 grid-cols-3">
          {/* Stat 1 */}
          <div className="bg-slate-100/95 border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between min-h-[105px] shadow-sm">
            <span className="text-[11px] md:text-xs font-bold text-slate-700 leading-tight">
              Total Laporan Saya
            </span>
            <span className="text-3xl md:text-4xl font-extrabold text-slate-800 text-center mt-auto block">
              {loadingStats ? <Skeleton className="h-8 w-12 mx-auto" /> : (stats?.total ?? '0')}
            </span>
          </div>

          {/* Stat 2 */}
          <div className="bg-slate-100/95 border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between min-h-[105px] shadow-sm">
            <span className="text-[11px] md:text-xs font-bold text-slate-700 leading-tight">
              Laporan Selesai
            </span>
            <span className="text-3xl md:text-4xl font-extrabold text-slate-800 text-center mt-auto block">
              {loadingStats ? <Skeleton className="h-8 w-12 mx-auto" /> : (stats?.completedLast30Days ?? '0')}
            </span>
          </div>

          {/* Stat 3 */}
          <div className="bg-slate-100/95 border border-slate-200/50 rounded-2xl p-3 flex flex-col justify-between min-h-[105px] shadow-sm">
            <span className="text-[11px] md:text-xs font-bold text-slate-700 leading-tight">
              Transfer Menunggu
            </span>
            <span className="text-3xl md:text-4xl font-extrabold text-slate-800 text-center mt-auto block">
              {loadingTransfers ? (
                <Skeleton className="h-8 w-12 mx-auto" />
              ) : (
                pendingTransfersCount
              )}
            </span>
          </div>
        </div>

        {/* Split Lists: Reports & Transfers */}
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2 pt-2">
          
          {/* Recent Reports */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-base font-extrabold text-slate-800">Laporan Masalah Terbaru</h2>
              <button 
                onClick={() => navigate('/dashboard/reports')} 
                className="text-xs font-bold text-slate-700 hover:text-[#d9a416] cursor-pointer transition-colors"
              >
                Lihat Semua
              </button>
            </div>
            
            <div className="mt-2 bg-[#e5e5e5] rounded-[24px] p-5 shadow-inner">
              {loadingReports ? (
                <ListSkeleton count={3} />
              ) : recentReports.length === 0 ? (
                <EmptyState title="Belum ada laporan" description="Laporan yang Anda ajukan akan muncul di sini." />
              ) : (
                <motion.ul 
                  className="divide-y divide-slate-300/30"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {recentReports.map((report) => (
                    <motion.li 
                      key={report.id} 
                      variants={itemVariants} 
                      className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:opacity-80 transition-opacity first:pt-1 last:pb-1"
                      onClick={() => navigate(`/dashboard/reports/${report.id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-800 text-sm hover:text-[#d9a416] transition-colors block truncate">
                          {report.title}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1.5">
                          <span>{new Date(report.createdAt).toLocaleDateString('id-ID')}</span>
                          <span>•</span>
                          <span className="truncate">{report.roomName ?? report.roomCode}</span>
                        </p>
                      </div>
                      <StatusBadge status={report.status} />
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>
          </div>

          {/* Recent Transfers */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center pb-2">
              <h2 className="text-base font-extrabold text-slate-800">Pengajuan Transfer Terbaru</h2>
              <button 
                onClick={() => navigate('/dashboard/asset-transfers')} 
                className="text-xs font-bold text-slate-700 hover:text-[#d9a416] cursor-pointer transition-colors"
              >
                Lihat Semua
              </button>
            </div>
            
            <div className="mt-2 bg-[#e5e5e5] rounded-[24px] p-5 shadow-inner">
              {loadingTransfers ? (
                <ListSkeleton count={3} />
              ) : recentTransfers.length === 0 ? (
                <EmptyState title="Belum ada pengajuan" description="Pengajuan transfer aset Anda akan muncul di sini." />
              ) : (
                <motion.ul 
                  className="divide-y divide-slate-300/30"
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {recentTransfers.map((transfer) => (
                    <motion.li 
                      key={transfer.id} 
                      variants={itemVariants} 
                      className="py-3 flex items-center justify-between gap-4 cursor-pointer hover:opacity-80 transition-opacity first:pt-1 last:pb-1"
                      onClick={() => navigate('/dashboard/asset-transfers')}
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-800 text-sm hover:text-[#d9a416] transition-colors block truncate">
                          {transfer.assetName ?? transfer.assetKode ?? 'Aset'}
                        </span>
                        <p className="text-xs text-slate-500 mt-1 font-semibold flex items-center gap-1.5">
                          <span>{new Date(transfer.createdAt).toLocaleDateString('id-ID')}</span>
                          <span>•</span>
                          <span className="truncate">{transfer.fromRoomCode} → {transfer.toRoomCode}</span>
                        </p>
                      </div>
                      <StatusBadge status={transfer.status} />
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  )
}
