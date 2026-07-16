import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  exportExcel,
  exportPdf,
  exportTransfersExcel,
  exportTransfersPdf,
  fetchAnalyticsSummary,
  fetchAssetTransfers,
} from '@/lib/api-client'
import { AnimatedGlassCard } from '@/components/ui/animated-glass-card'
import { GlassCard } from '@/components/ui/glass-card'
import { PageHeader } from '@/components/ui/feedback'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import {
  ArrowRightLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  Star,
  Timer,
  X,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

// ─── Priority Colors ─────────────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#EF4444',
  HIGH: '#F97316',
  MEDIUM: '#EAB308',
  LOW: '#22C55E',
}
const PRIORITY_LABEL: Record<string, string> = {
  CRITICAL: 'Kritis',
  HIGH: 'Tinggi',
  MEDIUM: 'Sedang',
  LOW: 'Rendah',
}

// ─── Transfer Status Colors ───────────────────────────────────────────────────
const TRANSFER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#F97316',
  APPROVED: '#22C55E',
  REJECTED: '#EF4444',
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
type ExportFormat = 'excel' | 'pdf'
type ReportKind = 'masalah' | 'transfer'

interface ExportModalProps {
  open: boolean
  format: ExportFormat | null
  onClose: () => void
}

function ExportModal({ open, format, onClose }: ExportModalProps) {
  const token = useAuthStore((s) => s.accessToken)!
  const [kind, setKind] = useState<ReportKind>('masalah')
  const [isAllTime, setIsAllTime] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleExport = async () => {
    const sDate = isAllTime ? undefined : (startDate ? new Date(startDate).toISOString() : undefined)
    const eDate = isAllTime ? undefined : (endDate ? new Date(endDate).toISOString() : undefined)
    onClose()
    try {
      if (kind === 'masalah') {
        if (format === 'excel') {
          await exportExcel(token, sDate, eDate)
          toast.success('File Excel Laporan Masalah berhasil diunduh')
        } else {
          await exportPdf(token, sDate, eDate)
          toast.success('File PDF Laporan Masalah berhasil diunduh')
        }
      } else {
        if (format === 'excel') {
          await exportTransfersExcel(token, sDate, eDate)
          toast.success('File Excel Transfer Aset berhasil diunduh')
        } else {
          await exportTransfersPdf(token, sDate, eDate)
          toast.success('File PDF Transfer Aset berhasil diunduh')
        }
      }
    } catch {
      toast.error('Gagal mengekspor data. Coba lagi.')
    }
  }

  return typeof document !== 'undefined'
    ? createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
                onClick={onClose}
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    {format === 'excel'
                      ? <FileSpreadsheet className="h-5 w-5 text-green-500" />
                      : <FileText className="h-5 w-5 text-red-400" />}
                    <h3 className="text-base font-semibold text-gray-900">
                      Export {format === 'excel' ? 'Excel' : 'PDF'}
                    </h3>
                  </div>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {/* Step 1 — Pilih Jenis Laporan */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Jenis Laporan
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { val: 'masalah' as ReportKind, label: 'Laporan Masalah', icon: ClipboardList, color: 'text-blue-500 bg-blue-50 border-blue-200' },
                        { val: 'transfer' as ReportKind, label: 'Transfer Aset', icon: ArrowRightLeft, color: 'text-pink-500 bg-pink-50 border-pink-200' },
                      ] as const).map(({ val, label, icon: Icon, color }) => (
                        <button
                          key={val}
                          onClick={() => setKind(val)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                            kind === val ? color + ' shadow-sm' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${kind === val ? '' : 'text-gray-400'}`} />
                          <span className={`text-xs font-medium ${kind === val ? '' : 'text-gray-500'}`}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2 — Pilih Rentang Waktu */}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      Rentang Waktu
                    </p>
                    <label className="flex items-center gap-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-[#F9D141] focus:ring-[#F9D141]"
                        checked={isAllTime}
                        onChange={(e) => setIsAllTime(e.target.checked)}
                      />
                      <span className="text-sm font-medium text-gray-700">Semua Waktu (Tanpa Filter)</span>
                    </label>

                    <AnimatePresence>
                      {!isAllTime && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="grid grid-cols-2 gap-3 overflow-hidden"
                        >
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
                            <input
                              type="date"
                              className="flex h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#F9D141] focus:ring-[#F9D141] focus:outline-none"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
                            <input
                              type="date"
                              className="flex h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#F9D141] focus:ring-[#F9D141] focus:outline-none"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-3 px-6 pb-5">
                  <Button
                    variant="secondary"
                    className="flex-1 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200"
                    onClick={onClose}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#F9D141] to-[#737373] text-white hover:opacity-90 transition-all font-semibold shadow-sm"
                    onClick={handleExport}
                  >
                    Unduh {format === 'excel' ? 'Excel' : 'PDF'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
      )
    : null
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function AdminDashboard() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportFormat, setExportFormat] = useState<ExportFormat | null>(null)
  const [maintenanceAgenda, setMaintenanceAgenda] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('fixmind_maintenance_schedules')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const active = parsed
          .filter((s: any) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS')
          .sort((a: any, b: any) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
          .slice(0, 3)
        setMaintenanceAgenda(active)
      } catch {
        setMaintenanceAgenda([])
      }
    }
  }, [])

  const triggerExport = (fmt: ExportFormat) => {
    setExportFormat(fmt)
    setShowExportModal(true)
  }

  // ── Queries ────────────────────────────────────────────────────────────────
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => fetchAnalyticsSummary(token),
  })

  const { data: transfersData, isLoading: transfersLoading } = useQuery({
    queryKey: ['asset-transfers', 'all-dashboard'],
    queryFn: () => fetchAssetTransfers(token, { limit: 1000 }),
  })

  const stats = analyticsData?.data
  const transfers = transfersData?.data ?? []

  // ── Transfer stats derived ──────────────────────────────────────────────────
  const transferStats = {
    total: transfers.length,
    pending: transfers.filter((t) => t.status === 'PENDING').length,
    approved: transfers.filter((t) => t.status === 'APPROVED').length,
    rejected: transfers.filter((t) => t.status === 'REJECTED').length,
  }

  const transferChartData = [
    { name: 'Menunggu', value: transferStats.pending, fill: TRANSFER_STATUS_COLORS.PENDING },
    { name: 'Disetujui', value: transferStats.approved, fill: TRANSFER_STATUS_COLORS.APPROVED },
    { name: 'Ditolak', value: transferStats.rejected, fill: TRANSFER_STATUS_COLORS.REJECTED },
  ]

  // ── Report stat cards ───────────────────────────────────────────────────────
  const reportCards = [
    { label: 'Laporan Terbuka', value: stats?.openReports, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Sedang Dikerjakan', value: stats?.inProgress, icon: Building2, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Selesai (30h)', value: stats?.completedLast30Days, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
    {
      label: 'Rata-rata Penilaian',
      value: stats?.avgRating != null ? stats.avgRating.toFixed(1) : null,
      icon: Star,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
  ]

  // ── Transfer stat cards ─────────────────────────────────────────────────────
  const transferCards = [
    { label: 'Total Transfer', value: transferStats.total, icon: ArrowRightLeft, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Menunggu Review', value: transferStats.pending, icon: Timer, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Transfer Disetujui', value: transferStats.approved, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
  ]

  return (
    <>
      <ExportModal
        open={showExportModal}
        format={exportFormat}
        onClose={() => setShowExportModal(false)}
      />

      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <PageHeader
          title={`Selamat datang kembali, ${user?.fullName?.split(' ')[0] ?? 'Admin'}`}
          description="Ringkasan global aktivitas pemeliharaan fasilitas & transfer aset"
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => triggerExport('excel')}>
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </Button>
              <Button variant="secondary" onClick={() => triggerExport('pdf')}>
                <FileText className="h-4 w-4" /> Export PDF
              </Button>
            </div>
          }
        />

        {/* ── Report Stats ────────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Statistik Laporan Masalah</p>
          <motion.div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {reportCards.map((c) => (
              <AnimatedGlassCard key={c.label} className="p-5 flex items-center justify-between" variants={itemVariants}>
                <div>
                  <p className="text-sm text-muted">{c.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-gradient-admin">
                    {analyticsLoading ? <Skeleton className="h-9 w-16" /> : (c.value ?? '—')}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${c.bg} ${c.color}`}>
                  <c.icon className="w-6 h-6" />
                </div>
              </AnimatedGlassCard>
            ))}
          </motion.div>
        </div>

        {/* ── Transfer Stats ──────────────────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Statistik Transfer Aset</p>
          <motion.div
            className="grid gap-4 sm:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {transferCards.map((c) => (
              <AnimatedGlassCard key={c.label} className="p-5 flex items-center justify-between" variants={itemVariants}>
                <div>
                  <p className="text-sm text-muted">{c.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-gradient-admin">
                    {transfersLoading ? <Skeleton className="h-9 w-16" /> : c.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${c.bg} ${c.color}`}>
                  <c.icon className="w-6 h-6" />
                </div>
              </AnimatedGlassCard>
            ))}
          </motion.div>
        </div>

        {/* ── Charts Row 1: Report Status + Priority Donut ────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Laporan berdasarkan Status */}
          {stats?.byStatus && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <AnimatedGlassCard className="h-full flex flex-col">
                <h2 className="text-base font-semibold mb-4">Laporan Masalah — Status</h2>
                <div className="flex-1 min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(stats.byStatus).map(([name, value]) => {
                        const m: Record<string, string> = {
                          PENDING: 'Menunggu', AI_ANALYSIS: 'AI', REVIEWED: 'Ditinjau',
                          ASSIGNED: 'Ditugaskan', IN_PROGRESS: 'Proses',
                          COMPLETED: 'Selesai', CANCELLED: 'Batal', REJECTED: 'Ditolak',
                        }
                        return { name: m[name] ?? name.replace(/_/g, ' '), value }
                      })}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} cursor={{ fill: 'rgba(255,255,255,0.3)' }} />
                      <Bar dataKey="value" fill="url(#reportGrad)" radius={[6, 6, 0, 0]} barSize={32} />
                      <defs>
                        <linearGradient id="reportGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#EF629F" />
                          <stop offset="100%" stopColor="#EECDA3" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedGlassCard>
            </motion.div>
          )}

          {/* Laporan berdasarkan Prioritas — Donut */}
          {stats?.byPriority && Object.keys(stats.byPriority).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <AnimatedGlassCard className="h-full flex flex-col">
                <h2 className="text-base font-semibold mb-4">Laporan Masalah — Prioritas</h2>
                <div className="flex-1 min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(stats.byPriority).map(([name, value]) => ({
                          name: PRIORITY_LABEL[name] ?? name,
                          value,
                          key: name,
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {Object.keys(stats.byPriority).map((key) => (
                          <Cell key={key} fill={PRIORITY_COLORS[key] ?? '#8B5CF6'} stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedGlassCard>
            </motion.div>
          )}
        </div>

        {/* ── Charts Row 2: Transfer Status Bar ───────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <AnimatedGlassCard>
            <h2 className="text-base font-semibold mb-4">Transfer Aset — Status</h2>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transferChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  barSize={60}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} cursor={{ fill: 'rgba(255,255,255,0.3)' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {transferChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </AnimatedGlassCard>
        </motion.div>

        {/* ── Bottom Row: Priority Bars + Top Rooms ──────────────────────── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Progress bars — Prioritas */}
          {stats?.byPriority && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <GlassCard>
                <h2 className="text-base font-semibold mb-4">Detail Prioritas Laporan</h2>
                <div className="space-y-3">
                  {Object.entries(stats.byPriority).map(([priority, count]) => {
                    const max = Math.max(...Object.values(stats.byPriority!), 1)
                    const pct = (count / max) * 100
                    return (
                      <div key={priority}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium" style={{ color: PRIORITY_COLORS[priority] }}>
                            {PRIORITY_LABEL[priority] ?? priority}
                          </span>
                          <span className="text-muted">{count} laporan</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/50">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: PRIORITY_COLORS[priority] ?? '#8B5CF6' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Progress bars — Ruangan Terbanyak */}
          {stats?.byRoom && stats.byRoom.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <GlassCard>
                <h2 className="text-base font-semibold mb-4">Ruangan dengan Laporan Terbanyak</h2>
                <div className="space-y-3">
                  {stats.byRoom.map((r) => {
                    const max = stats.byRoom![0].count
                    const pct = (r.count / max) * 100
                    return (
                      <div key={r.room}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium truncate max-w-[60%]">{r.room}</span>
                          <span className="text-muted">{r.count} laporan</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/50">
                          <motion.div
                            className="h-full gradient-admin rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* ── Agenda Pemeliharaan Terdekat ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <GlassCard className="p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-slate-800">Agenda Pemeliharaan Rutin Terdekat</h2>
              <Link to="/dashboard/maintenance" className="text-xs font-semibold text-[#d9a416] hover:text-[#c29410] hover:underline">
                Lihat Semua Jadwal
              </Link>
            </div>
            
            {maintenanceAgenda.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">
                Tidak ada jadwal pemeliharaan rutin terdekat yang aktif.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {maintenanceAgenda.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between text-xs space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {item.frequency === 'ONE_TIME' ? 'Sekali' : 'Rutin'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status === 'IN_PROGRESS' ? 'Dikerjakan' : 'Terjadwal'}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-slate-800 line-clamp-1">{item.title}</h4>
                      
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-[#F9D141]" />
                        <span>{new Date(item.scheduledDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="truncate">{item.roomCode} — {item.roomName}</span>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Petugas:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[70%]">{item.assigneeName}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </>
  )
}
