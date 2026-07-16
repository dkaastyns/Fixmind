import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { FileSpreadsheet, FileText, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { PageHeader } from '@/components/ui/feedback'
import { exportExcel, exportPdf, fetchAnalyticsSummary } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function AnalyticsPage() {
  const token = useAuthStore((s) => s.accessToken)!

  const [showExportModal, setShowExportModal] = useState(false)
  const [exportType, setExportType] = useState<'excel' | 'pdf' | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isAllTime, setIsAllTime] = useState(true)

  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => fetchAnalyticsSummary(token),
  })

  const stats = data?.data

  const confirmExport = async () => {
    const sDate = isAllTime ? undefined : (startDate ? new Date(startDate).toISOString() : undefined)
    const eDate = isAllTime ? undefined : (endDate ? new Date(endDate).toISOString() : undefined)

    setShowExportModal(false)

    try {
      if (exportType === 'excel') {
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

  const triggerExport = (type: 'excel' | 'pdf') => {
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
                      className="rounded border-gray-300 text-[#d9a416] focus:ring-[#F9D141]"
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
                            className="flex h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#F9D141] focus:ring-[#F9D141]"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Sampai Tanggal</label>
                          <input
                            type="date"
                            className="flex h-10 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:border-[#F9D141] focus:ring-[#F9D141]"
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
                  <Button className="flex-1 rounded-xl bg-[#F9D141] text-slate-900 font-bold hover:bg-[#d9a416]" onClick={confirmExport}>
                    Proses Ekspor
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body,
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
                    <span className="capitalize">
                      {priority === 'CRITICAL' ? 'Kritis' :
                       priority === 'HIGH' ? 'Tinggi' :
                       priority === 'MEDIUM' ? 'Sedang' :
                       priority === 'LOW' ? 'Rendah' : priority.toLowerCase()}
                    </span>
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
    </div>
  )
}
