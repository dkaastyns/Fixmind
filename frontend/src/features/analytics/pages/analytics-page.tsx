import { useQuery } from '@tanstack/react-query'
import { Download, FileSpreadsheet, FileText, Medal, Star } from 'lucide-react'
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

export function AnalyticsPage() {
  const token = useAuthStore((s) => s.accessToken)!

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

  const handleExport = async () => {
    try {
      const res = await exportReports(token)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'fixmind-reports.csv'
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Export berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor data')
    }
  }

  const handleExportExcel = async () => {
    try {
      await exportExcel(token)
      toast.success('File Excel berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor Excel')
    }
  }

  const handleExportPdf = async () => {
    try {
      await exportPdf(token)
      toast.success('File PDF berhasil diunduh')
    } catch {
      toast.error('Gagal mengekspor PDF')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analitik & Laporan"
        description="Performa pemeliharaan dan statistik laporan fasilitas"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="secondary" onClick={handleExportExcel}>
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
            <Button variant="secondary" onClick={handleExportPdf}>
              <FileText className="h-4 w-4" /> Export PDF
            </Button>
          </div>
        }
      />

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
