import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  exportExcel,
  exportPdf,
  exportTransfersExcel,
  exportTransfersPdf,
  exportMaintenanceExcel,
  exportMaintenancePdf,
  fetchAnalyticsSummary,
  fetchAssetTransfers,
  fetchMaintenanceSchedules,
} from '@/lib/api-client'
import { AnimatedGlassCard } from '@/components/ui/animated-glass-card'
import { GlassCard } from '@/components/ui/glass-card'
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
  Wrench,
  X,
  Menu,
  Search,
  Download,
} from 'lucide-react'
import { NotificationBell } from '@/components/ui/notification-bell'
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
  CRITICAL: '#D42115',
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
  REJECTED: '#D42115',
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
type ExportFormat = 'excel' | 'pdf'
type ReportKind = 'masalah' | 'transfer' | 'maintenance'

interface ExportModalProps {
  open: boolean
  onClose: () => void
}

function ExportModal({ open, onClose }: ExportModalProps) {
  const token = useAuthStore((s) => s.accessToken)!
  const [kind, setKind] = useState<ReportKind>('masalah')
  const [isAllTime, setIsAllTime] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const handleExport = async (format: ExportFormat) => {
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
      } else if (kind === 'transfer') {
        if (format === 'excel') {
          await exportTransfersExcel(token, sDate, eDate)
          toast.success('File Excel Transfer Aset berhasil diunduh')
        } else {
          await exportTransfersPdf(token, sDate, eDate)
          toast.success('File PDF Transfer Aset berhasil diunduh')
        }
      } else {
        if (format === 'excel') {
          await exportMaintenanceExcel(token, sDate, eDate)
          toast.success('File Excel Jadwal Pemeliharaan berhasil diunduh')
        } else {
          await exportMaintenancePdf(token, sDate, eDate)
          toast.success('File PDF Jadwal Pemeliharaan berhasil diunduh')
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
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#d9a416]">
                      <Download className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Export Data Aplikasi</h3>
                      <p className="text-[11px] text-slate-400">Pilih jenis dan format dokumen</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Bagian Jenis Laporan */}
                <div className="mb-4 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Jenis Laporan
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { val: 'masalah' as ReportKind, label: 'Laporan Masalah', icon: ClipboardList, color: 'text-blue-500 bg-blue-50 border-blue-200' },
                      { val: 'transfer' as ReportKind, label: 'Transfer Aset', icon: ArrowRightLeft, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                      { val: 'maintenance' as ReportKind, label: 'Jadwal Pemeliharaan', icon: Wrench, color: 'text-green-600 bg-green-50 border-green-200' },
                    ] as const).map(({ val, label, icon: Icon, color }) => (
                      <button
                        key={val}
                        onClick={() => setKind(val)}
                        className={`group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95 ${
                          kind === val ? color + ' shadow-sm ring-2 ring-offset-1 ' + color.split(' ')[0].replace('text-', 'ring-') : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon className={`h-4 w-4 transition-colors ${kind === val ? '' : 'text-slate-400 group-hover:text-slate-600'}`} />
                        <span className={`text-[9px] font-bold text-center leading-tight transition-colors ${kind === val ? '' : 'text-slate-500 group-hover:text-slate-700'}`}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bagian Rentang Waktu */}
                <div className="mb-5 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                    Rentang Waktu Data
                  </label>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setIsAllTime(true)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        isAllTime ? 'bg-amber-50 border-amber-300 text-[#d9a416] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Semua Waktu
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAllTime(false)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        !isAllTime ? 'bg-amber-50 border-amber-300 text-[#d9a416] shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Pilih Tanggal
                    </button>
                  </div>

                  {!isAllTime && (
                    <div className="grid grid-cols-2 gap-2 animate-fadeIn">
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Tanggal Mulai</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white focus:border-[#d9a416] focus:outline-none text-slate-700 font-medium"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-slate-400 block mb-0.5">Tanggal Selesai</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-200 bg-white focus:border-[#d9a416] focus:outline-none text-slate-700 font-medium"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Selection Grid (Format Excel/PDF) */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleExport('excel')}
                    className="flex flex-col items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-lg transition-all text-center cursor-pointer group"
                  >
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-110 transition-transform duration-300">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Format Excel</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Spreadsheet</p>
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleExport('pdf')}
                    className="flex flex-col items-center gap-2.5 p-3 rounded-xl border border-slate-100 hover:border-rose-300 hover:bg-rose-50 hover:shadow-lg transition-all text-center cursor-pointer group"
                  >
                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">Format PDF</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">Siap cetak</p>
                    </div>
                  </motion.button>
                </div>

                <div className="mt-2">
                  <Button
                    variant="secondary"
                    className="w-full text-slate-500 hover:bg-slate-50 hover:text-slate-700 border-slate-200 shadow-none font-bold bg-white"
                    onClick={onClose}
                  >
                    Batal
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
  const navigate = useNavigate()

  const [showExportModal, setShowExportModal] = useState(false)
  const { data: maintenanceData, isLoading: maintenanceLoading } = useQuery({
    queryKey: ['admin-dashboard-maintenance'],
    queryFn: () => fetchMaintenanceSchedules(token, { limit: 10 }),
  })

  const maintenanceAgenda = maintenanceData?.data 
    ? maintenanceData.data
        .filter((s) => s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
        .slice(0, 4)
    : []

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

  const todayStr = new Date().toLocaleDateString('id-ID', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <>
      <ExportModal
        open={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      <motion.div
        className="space-y-6 pb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Hero Cover Banner Card (Matching User Dashboard & Profile Aesthetic) */}
        <motion.div 
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-20 w-full pt-6 pb-8 px-5 md:py-8 md:px-8 text-white min-h-[300px] md:min-h-[260px] flex flex-col justify-between group"
        >
          {/* Background & Overlay Wrapper to clip rounded corners */}
          <div className="absolute inset-0 rounded-b-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl z-0">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: 'url("/new-bg_dprd.jpg")' }}
            />
            {/* Ambient Glow & Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/75" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#F9D141]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#F9D141]/20 transition-all duration-700" />
          </div>

          {/* Mobile Header Toolbar */}
          <div className="relative z-30 flex items-center justify-between md:hidden w-full mb-4">
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-menu'))}
              className="p-1 text-[#ffd043] hover:text-yellow-300 transition-colors cursor-pointer"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-extrabold text-xl tracking-tight text-white">ASETKITA Semarang</span>
            <div>
              <NotificationBell 
                align="right" 
                className="bg-transparent border-transparent text-[#ffd043] hover:bg-white/10 hover:text-[#ffd043] p-1 shadow-none" 
              />
            </div>
          </div>

          {/* Hero Main Info & Actions */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <p className="text-xs md:text-sm font-semibold opacity-90 tracking-wide text-slate-300">
                {todayStr}
              </p>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-md">
                Halo, {user?.fullName ?? 'Administrator'}
              </h1>
              <p className="text-xs md:text-sm text-slate-200 max-w-xl font-medium leading-relaxed opacity-95 drop-shadow-sm">
                Ringkasan global aktivitas pemeliharaan fasilitas & pemindahan aset DPRD Kota Semarang.
              </p>
            </div>

            {/* Export Button Desktop & Tablet */}
            <div className="flex items-center justify-center md:justify-end gap-3 shrink-0">
              <Button 
                variant="secondary" 
                onClick={() => setShowExportModal(true)}
                className="hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-[#F9D141]/30 transition-all duration-200 bg-white/90 backdrop-blur-md text-slate-800 font-extrabold rounded-2xl px-4 py-5 text-xs sm:text-sm border border-white/40 cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#d9a416] stroke-[2.5]" /> Export Data
              </Button>
            </div>
          </div>

          {/* Quick Search Action Bar Pill (Matching User Dashboard Style) */}
          <div className="relative z-10 w-full max-w-lg mx-auto mt-6">
            <motion.div 
              whileHover={{ scale: 1.025, y: -2 }}
              whileTap={{ scale: 0.975 }}
              onClick={() => window.dispatchEvent(new CustomEvent('open-global-search'))}
              className="cursor-pointer flex items-center gap-4 bg-[#f4f4f4]/15 hover:bg-[#f4f4f4]/25 border border-[#f4f4f4]/25 rounded-2xl px-5 py-3.5 shadow-md transition-all group duration-200 text-left backdrop-blur-md"
            >
              <motion.div whileHover={{ rotate: 15, scale: 1.15 }} transition={{ duration: 0.2 }}>
                <Search className="w-5.5 h-5.5 text-[#ffd043] shrink-0" />
              </motion.div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-bold text-white leading-tight">
                  Cari aset, laporan, atau pemeliharaan?
                </p>
                <p className="text-[10px] text-white/85 font-semibold mt-1 tracking-wide">
                  Apapun • Kapanpun • Dimanapun
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

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
              <AnimatedGlassCard key={c.label} className="p-5 flex items-center justify-between cursor-pointer hover:ring-2 hover:ring-[#F9D141]/50 transition-all hover:-translate-y-1" variants={itemVariants} onClick={() => navigate('/dashboard/reports')}>
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
              <AnimatedGlassCard key={c.label} className="p-5 flex items-center justify-between cursor-pointer hover:ring-2 hover:ring-[#F9D141]/50 transition-all hover:-translate-y-1" variants={itemVariants} onClick={() => navigate('/dashboard/asset-transfers/review')}>
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
          {Boolean(stats?.byStatus) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <AnimatedGlassCard className="h-full flex flex-col">
                <h2 className="text-base font-semibold mb-4">Laporan Masalah — Status</h2>
                <div className="flex-1 min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={Object.entries(stats?.byStatus ?? {}).map(([name, value]) => {
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
                          <stop offset="0%" stopColor="#F9D141" />
                          <stop offset="100%" stopColor="#1A1A1A" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AnimatedGlassCard>
            </motion.div>
          )}

          {/* Laporan berdasarkan Prioritas — Donut */}
          {Boolean(stats?.byPriority) && Object.keys(stats?.byPriority ?? {}).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <AnimatedGlassCard className="h-full flex flex-col">
                <h2 className="text-base font-semibold mb-4">Laporan Masalah — Prioritas</h2>
                <div className="flex-1 min-h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(stats?.byPriority ?? {}).map(([name, value]) => ({
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
                        {Object.keys(stats?.byPriority ?? {}).map((key) => (
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
          {Boolean(stats?.byPriority) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <GlassCard className="cursor-pointer hover:shadow-lg transition-shadow hover:border-[#F9D141]/50" onClick={() => navigate('/dashboard/reports')}>
                <h2 className="text-base font-semibold mb-4">Detail Prioritas Laporan</h2>
                <div className="space-y-3">
                  {Object.entries(stats?.byPriority ?? {}).map(([priority, count]) => {
                    const priorityValues = Object.values(stats?.byPriority ?? {}) as number[]
                    const max = Math.max(...(priorityValues.length ? priorityValues : [1]), 1)
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
          {Boolean(stats?.byRoom && stats.byRoom.length > 0) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <GlassCard className="cursor-pointer hover:shadow-lg transition-shadow hover:border-[#F9D141]/50" onClick={() => navigate('/dashboard/reports')}>
                <h2 className="text-base font-semibold mb-4">Ruangan dengan Laporan Terbanyak</h2>
                <div className="space-y-3">
                  {stats?.byRoom?.map((r) => {
                    const max = stats?.byRoom?.[0]?.count ?? 1
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
          <GlassCard className="p-5 sm:p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">Agenda Pemeliharaan Rutin Terdekat</h2>
              </div>
              <Link to="/dashboard/maintenance" className="text-sm font-bold text-[#d9a416] hover:text-[#c29410] flex items-center gap-1 transition-colors">
                Lihat Semua <ArrowRightLeft className="w-3.5 h-3.5" />
              </Link>
            </div>
            
            {maintenanceLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-[140px] rounded-2xl" />
                ))}
              </div>
            ) : maintenanceAgenda.length === 0 ? (
              <div className="py-10 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
                <p className="text-sm font-semibold text-slate-500">
                  Tidak ada jadwal pemeliharaan rutin terdekat yang aktif.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {maintenanceAgenda.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/dashboard/maintenance')}
                    className="group relative p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 overflow-hidden cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
                          {item.frequency === 'ONE_TIME' ? 'Sekali' : 'Rutin'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold shadow-sm ${
                          item.status === 'IN_PROGRESS' 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {item.status === 'IN_PROGRESS' ? 'Dikerjakan' : 'Terjadwal'}
                        </span>
                      </div>
                      
                      <div>
                        <h4 className="font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-amber-600 transition-colors">{item.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span className="truncate">{item.roomCode} — {item.roomName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative border-t border-slate-100 pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(item.scheduledDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium truncate max-w-[50%]">
                        <span className="truncate">{item.assigneeName}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </>
  )
}
