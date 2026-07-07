import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { Download, FileSpreadsheet, FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { PageHeader } from '@/components/ui/feedback'
import {
  exportExcel,
  exportPdf,
  exportReports,
  fetchAnalyticsSummary,
  fetchTechnicianStats,
} from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

const RANK_COLORS = [
  'text-yellow-500',   // 1st gold
  'text-slate-400',    // 2nd silver
  'text-amber-600',    // 3rd bronze
]

function StarRating({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted text-xs">—</span>
  const rounded = Math.round(value * 2) / 2
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rounded ? 'fill-yellow-400 text-yellow-400' : 'text-white/30'}`}
        />
      ))}
      <span className="ml-1 text-xs text-muted">({value.toFixed(1)})</span>
    </span>
  )
}

function Star({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function Medal({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
      <path d="M11 12 5.12 2.2" />
      <path d="m13 12 5.88-9.8" />
      <path d="M8 7h8" />
      <circle cx="12" cy="17" r="5" />
      <path d="M12 18v-2h-.5" />
    </svg>
  )
}


export function AnalyticsPage() {
  const token = useAuthStore((s) => s.accessToken)!

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportType, setExportType] = useState<'csv' | 'excel' | 'pdf' | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isAllTime, setIsAllTime] = useState(true)

  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => fetchAnalyticsSummary(token),
  })

  const { data: statsData } = useQuery({
    queryKey: ['technician-stats'],
    queryFn: () => fetchTechnicianStats(token),
  })

  const stats = data?.data
  const techStats = statsData?.data ?? []

  const confirmExport = async () => {
    const sDate = isAllTime ? undefined : (startDate ? new Date(startDate).toISOString() : undefined)
    const eDate = isAllTime ? undefined : (endDate ? new Date(endDate).toISOString() : undefined)

    setShowExportModal(false)

    try {
      if (exportType === 'csv') {
        const res = await exportReports(token, sDate, eDate)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'fixmind-reports.csv'
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Export CSV berhasil diunduh')
      } else if (exportType === 'excel') {
        await exportExcel(token, sDate, eDate)
        toast.success('File Excel berhasil diunduh')
      } else if (exportType === 'pdf') {
        await exportPdf(token, sDate, eDate)
        toast.success('File PDF berhasil diunduh')
      }
    } catch {
      toast.error('Gagal mengekspor data')
    }
  }

  const triggerExport = (type: 'csv' | 'excel' | 'pdf') => {
    setExportType(type)
    setShowExportModal(true)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analitik & Laporan"
        description="Performa pemeliharaan dan statistik laporan fasilitas"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => triggerExport('csv')}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="secondary" onClick={() => triggerExport('excel')}>
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
            <Button variant="secondary" onClick={() => triggerExport('pdf')}>
              <FileText className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        }
      />

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showExportModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
                onClick={() => setShowExportModal(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Opsi Ekspor Data</h3>
                  <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="space-y-4 mb-6 text-left">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-[#ef629f] focus:ring-[#ef629f]"
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
                        className="grid grid-cols-2 gap-4 overflow-hidden"
                      >
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Dari Tanggal</label>
                          <input
                            type="date"
                            className="flex h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#ef629f] focus:ring-[#ef629f]"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
                          <input
                            type="date"
                            className="flex h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#ef629f] focus:ring-[#ef629f]"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200" onClick={() => setShowExportModal(false)}>
                    Batal
                  </Button>
                  <Button className="flex-1 rounded-xl bg-[#ef629f] text-white hover:bg-[#ef629f]/90" onClick={confirmExport}>
                    Proses Ekspor
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Laporan Terbuka', value: stats?.openReports },
          { label: 'Sedang Dikerjakan', value: stats?.inProgress },
          { label: 'Selesai (30 Hari)', value: stats?.completedLast30Days },
          { label: 'Rating Rata-rata', value: stats?.avgRating?.toFixed(1) ?? '—' },
        ].map((s) => (
          <GlassCard key={s.label} className="p-5">
            <p className="text-sm text-muted">{s.label}</p>
            <p className="mt-2 text-3xl font-semibold text-gradient">
              {isLoading ? '...' : (s.value ?? '—')}
            </p>
          </GlassCard>
        ))}
      </div>

      {stats?.byPriority && (
        <GlassCard>
          <h2 className="text-lg font-medium">Laporan berdasarkan Prioritas</h2>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.byPriority).map(([priority, count]) => {
              const max = Math.max(...Object.values(stats.byPriority!), 1)
              const pct = (count / max) * 100
              return (
                <div key={priority}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize">{priority.toLowerCase()}</span>
                    <span className="text-muted">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/50">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      )}

      {stats?.byRoom && stats.byRoom.length > 0 && (
        <GlassCard>
          <h2 className="text-lg font-medium">Ruangan dengan Laporan Terbanyak</h2>
          <div className="mt-4 space-y-3">
            {stats.byRoom.map((r) => {
              const max = stats.byRoom![0].count
              const pct = (r.count / max) * 100
              return (
                <div key={r.room}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{r.room}</span>
                    <span className="text-muted">{r.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/50">
                    <div className="h-full gradient-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </GlassCard>
      )}

      {/* Technician Leaderboard */}
      <GlassCard className="overflow-hidden p-0">
        <div className="p-5 border-b border-white/20">
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-[#ef629f]" />
            <h2 className="text-lg font-medium">Performa Teknisi</h2>
          </div>
          <p className="mt-1 text-sm text-muted">Peringkat teknisi berdasarkan tugas selesai dan rating pengguna</p>
        </div>

        {techStats.length === 0 ? (
          <p className="p-6 text-sm text-muted">Belum ada data performa teknisi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/30 text-left text-muted">
                  <th className="px-5 py-3 font-medium">Peringkat</th>
                  <th className="px-5 py-3 font-medium">Nama Teknisi</th>
                  <th className="px-5 py-3 font-medium text-center">Tugas Selesai</th>
                  <th className="px-5 py-3 font-medium">Rating</th>
                  <th className="px-5 py-3 font-medium text-center">Rata-rata Waktu (jam)</th>
                </tr>
              </thead>
              <tbody>
                {techStats.map((t, idx) => (
                  <tr key={t.technicianId} className="border-b border-white/20 hover:bg-white/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {idx < 3 ? (
                          <span className={`text-lg font-bold ${RANK_COLORS[idx]}`}>
                            #{idx + 1}
                          </span>
                        ) : (
                          <span className="text-sm text-muted font-medium">#{idx + 1}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium">{t.technicianName}</td>
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-lg bg-green-100/60 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                        {t.completedTasks}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <StarRating value={t.avgRating} />
                    </td>
                    <td className="px-5 py-3 text-center text-muted">
                      {t.avgCompletionHours !== null ? `${t.avgCompletionHours.toFixed(1)} jam` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
