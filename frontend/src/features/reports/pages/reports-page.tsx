import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, Filter, Plus, X, Loader2, Bot } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
import { TableSkeleton } from '@/components/ui/skeleton'
import {
  createReport,
  fetchReports,
  fetchRooms,
  fetchAssets,
  uploadAttachment,
} from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import type { ReportStatus } from '@/types/api'

type FilterState = {
  roomId: string
  dateFrom: string
  dateTo: string
}

export function ReportsPage() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [advFilter, setAdvFilter] = useState<FilterState>({ roomId: '', dateFrom: '', dateTo: '' })
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (searchParams.get('openForm') === 'true') {
      setShowForm(true)
    }
  }, [searchParams])

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token, true) })

  const hasAdvancedFilter = !!(advFilter.roomId || advFilter.dateFrom || advFilter.dateTo)

  const [page, setPage] = useState(1)
  const LIMIT = 10

  useEffect(() => {
    setPage(1)
  }, [statusFilter, advFilter])

  const { data, isLoading } = useQuery({
    queryKey: ['reports', statusFilter, advFilter, page],
    queryFn: () =>
      fetchReports(token, {
        status: statusFilter || undefined,
        roomId: advFilter.roomId || undefined,
        dateFrom: advFilter.dateFrom || undefined,
        dateTo: advFilter.dateTo || undefined,
        page,
        limit: LIMIT,
      }),
  })

  const reports = data?.data ?? []
  const meta = data?.meta
  const totalReports = meta?.total ?? 0
  const totalPages = Math.ceil(totalReports / LIMIT)
  const canCreate = user?.role === 'USER' || user?.role === 'ADMIN'

  const clearAdvancedFilter = () => {
    setAdvFilter({ roomId: '', dateFrom: '', dateTo: '' })
  }

  return (
    <div>
      <PageHeader
        title="Laporan Masalah"
        description="Lacak dan kelola laporan kerusakan fasilitas DPRD Kota Semarang"
        action={
          canCreate ? (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4" /> Buat Laporan Baru
            </Button>
          ) : undefined
        }
      />

      {/* Status filter tabs */}
      <div className="mb-3 flex flex-wrap gap-2">
        {(['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((s) => {
          const labels: Record<string, string> = {
            '': 'Semua',
            PENDING: 'MENUNGGU',
            IN_PROGRESS: 'DIPROSES',
            COMPLETED: 'SELESAI',
            CANCELLED: 'DIBATALKAN',
          }
          return (
            <button
              key={s || 'all'}
              onClick={() => setStatusFilter(s)}
              className={`rounded-xl px-3 py-1.5 text-sm transition-colors ${
                statusFilter === s ? 'gradient-primary text-white' : 'glass text-muted hover:text-foreground'
              }`}
            >
              {labels[s]}
            </button>
          )
        })}

        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className={`ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-colors ${
            hasAdvancedFilter ? 'gradient-primary text-white' : 'glass text-muted hover:text-foreground'
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Filter Lanjutan
          {showAdvanced ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {hasAdvancedFilter && (
            <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/30 text-[10px] font-bold">
              {[advFilter.roomId, advFilter.dateFrom, advFilter.dateTo].filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Collapsible advanced filter panel */}
      {showAdvanced && (
        <GlassCard className="mb-4 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Filter Lanjutan</h3>
            {hasAdvancedFilter && (
              <button
                onClick={clearAdvancedFilter}
                className="inline-flex items-center gap-1 text-xs text-muted hover:text-danger transition-colors"
              >
                <X className="h-3 w-3" /> Hapus Filter
              </button>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/70">Ruangan</label>
              <select
                className="flex h-9 w-full appearance-none rounded-xl border border-white/20 bg-white/40 px-3 text-sm backdrop-blur-md focus:border-[#ef629f]/50 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                value={advFilter.roomId}
                onChange={(e) => setAdvFilter((f) => ({ ...f, roomId: e.target.value }))}
              >
                <option value="">Semua Ruangan</option>
                {rooms.data?.data.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} — {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/70">Tanggal Dari</label>
              <input
                type="date"
                className="flex h-9 w-full rounded-xl border border-white/20 bg-white/40 px-3 text-sm backdrop-blur-md focus:border-[#ef629f]/50 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                value={advFilter.dateFrom}
                onChange={(e) => setAdvFilter((f) => ({ ...f, dateFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground/70">Tanggal Sampai</label>
              <input
                type="date"
                className="flex h-9 w-full rounded-xl border border-white/20 bg-white/40 px-3 text-sm backdrop-blur-md focus:border-[#ef629f]/50 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                value={advFilter.dateTo}
                onChange={(e) => setAdvFilter((f) => ({ ...f, dateTo: e.target.value }))}
              />
            </div>
          </div>
        </GlassCard>
      )}

      {showForm && (
        <CreateReportForm
          token={token}
          onClose={() => {
            setShowForm(false)
            navigate('/dashboard/reports', { replace: true })
          }}
          onSuccess={(id) => {
            qc.invalidateQueries({ queryKey: ['reports'] })
            setShowForm(false)
            toast.success('Laporan berhasil dikirim')
            navigate(`/dashboard/reports/${id}`)
          }}
          initialRoomId={searchParams.get('roomId') ?? ''}
          initialAssetId={searchParams.get('assetId') ?? ''}
        />
      )}

      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : reports.length === 0 ? (
          <EmptyState title="Belum ada laporan" description="Buat laporan jika Anda menemukan kerusakan fasilitas." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/40 text-left text-muted">
                    <th className="px-4 py-3 font-medium">Judul Laporan</th>
                    <th className="px-4 py-3 font-medium">Ruangan</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Prioritas</th>
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id} className="border-b border-white/20 hover:bg-white/30">
                      <td className="px-4 py-3">
                        <Link to={`/dashboard/reports/${r.id}`} className="font-medium hover:text-[#ef629f]">
                          {r.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">{r.roomName ?? r.roomCode}</td>
                      <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-3">
                        {r.priority ? <StatusBadge status={r.priority} /> : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {new Date(r.createdAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-white/20 bg-white/10">
                <p className="text-xs text-slate-500 font-semibold">
                  Menampilkan {Math.min((page - 1) * LIMIT + 1, totalReports)} - {Math.min(page * LIMIT, totalReports)} dari {totalReports} laporan
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs rounded-xl"
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    disabled={page === 1}
                  >
                    Sebelumnya
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const pNum = i + 1
                    if (
                      pNum === 1 ||
                      pNum === totalPages ||
                      Math.abs(pNum - page) <= 1
                    ) {
                      return (
                        <button
                          key={pNum}
                          onClick={() => setPage(pNum)}
                          className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                            page === pNum
                              ? 'gradient-primary text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-white/30'
                          }`}
                        >
                          {pNum}
                        </button>
                      )
                    }
                    if (
                      (pNum === 2 && page > 3) ||
                      (pNum === totalPages - 1 && page < totalPages - 2)
                    ) {
                      return (
                        <span key={pNum} className="text-slate-400 text-xs px-1 font-bold">
                          ...
                        </span>
                      )
                    }
                    return null
                  })}
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 text-xs rounded-xl"
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </GlassCard>
    </div>
  )
}

// ── Quick templates ──────────────────────────────────────────
const REPORT_TEMPLATES = [
  {
    label: '❄️ AC Tidak Dingin',
    title: 'AC Tidak Dingin',
    description:
      'Unit AC di ruangan ini tidak berfungsi dengan baik. AC menyala namun tidak menghasilkan udara dingin. Kondisi ini mengganggu kenyamanan dan produktivitas kerja.',
  },
  {
    label: '📽️ Proyektor Rusak',
    title: 'Proyektor Rusak / Tidak Bisa Menyala',
    description:
      'Proyektor di ruangan ini mengalami kerusakan dan tidak dapat digunakan. Proyektor tidak merespons saat dinyalakan atau gambar yang ditampilkan tidak jelas.',
  },
  {
    label: '🧹 Kebersihan Ruangan',
    title: 'Masalah Kebersihan Ruangan',
    description:
      'Ruangan dalam kondisi kurang bersih dan memerlukan perhatian segera. Terdapat sampah yang menumpuk atau noda yang perlu dibersihkan untuk menjaga kenyamanan.',
  },
  {
    label: '🪑 Kerusakan Furnitur',
    title: 'Furnitur Rusak / Tidak Layak Pakai',
    description:
      'Terdapat furnitur (kursi/meja/lemari) yang rusak dan tidak layak digunakan. Kerusakan dapat membahayakan pengguna dan perlu segera diperbaiki atau diganti.',
  },
]

function CreateReportForm({
  token,
  onClose,
  onSuccess,
  initialRoomId = '',
  initialAssetId = '',
}: {
  token: string
  onClose: () => void
  onSuccess: (id: string) => void
  initialRoomId?: string
  initialAssetId?: string
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [roomId, setRoomId] = useState(initialRoomId)
  const [assetId, setAssetId] = useState(initialAssetId)
  const [files, setFiles] = useState<File[]>([])

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token, true) })
  const assets = useQuery({
    queryKey: ['assets', roomId],
    queryFn: () => fetchAssets(token, { roomId }),
    enabled: !!roomId,
  })

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await createReport(token, { title, description, roomId, assetId: assetId || undefined })
      if (files.length > 0) {
        await Promise.all(files.map((f) => uploadAttachment(token, res.data.id, f, 'DAMAGE')))
      }
      return res.data.id
    },
    onSuccess,
    onError: (e: Error) => toast.error(e.message),
  })

  const applyTemplate = (t: (typeof REPORT_TEMPLATES)[0]) => {
    setTitle(t.title)
    setDescription(t.description)
  }

  return (
    <GlassCard className="mb-6 p-6 shadow-xl shadow-[#ef629f]/5 border-white/60">
      <h2 className="text-xl font-semibold text-slate-800">Formulir Laporan Kerusakan</h2>

      {/* Quick templates */}
      <div className="mt-3 space-y-2">
        <p className="text-xs font-medium text-foreground/60 uppercase tracking-wide">Template Cepat</p>
        <div className="flex flex-wrap gap-2">
          {REPORT_TEMPLATES.map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => applyTemplate(t)}
              className="inline-flex items-center rounded-full border border-[#ef629f]/30 bg-[#ef629f]/10 px-3 py-1 text-xs font-medium text-[#ef629f] transition-all hover:bg-[#ef629f]/20 hover:scale-105 active:scale-95"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium text-foreground/80">Judul Masalah</label>
          <input
            className="flex h-11 w-full rounded-xl border border-white/40 bg-white/60 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/80 focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: AC Paripurna tidak dingin"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Ruangan / Fasilitas</label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/40 bg-white/60 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/80 focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
            value={roomId}
            onChange={(e) => { setRoomId(e.target.value); setAssetId('') }}
          >
            <option value="">Pilih ruangan</option>
            {rooms.data?.data.map((r) => (
              <option key={r.id} value={r.id}>{r.code} — {r.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Aset (Opsional)</label>
          <select
            className="flex h-11 w-full rounded-xl border border-white/40 bg-white/60 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/80 focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10 disabled:opacity-50"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            disabled={!roomId}
          >
            <option value="">Tanpa Aset Spesifik</option>
            {assets.data?.data.map((a) => (
              <option key={a.id} value={a.id}>{a.kodeBarang} - {a.namaBarang}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium text-foreground/80">Deskripsi Lengkap</label>
          <textarea
            className="min-h-[120px] w-full resize-y rounded-xl border border-white/40 bg-white/60 px-4 py-3 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/80 focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan detail kerusakan yang terjadi secara jelas..."
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium text-foreground/80">Foto Bukti Kerusakan (Maks 3 foto, ukuran 1.5MB/foto)</label>
          <div className="relative rounded-xl border-2 border-dashed border-[#ef629f]/30 bg-white/50 p-6 transition-all hover:bg-white/80 hover:border-[#ef629f]/50 text-center">
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/jpg"
              onChange={(e) => {
                const selected = Array.from(e.target.files || [])
                if (selected.length > 3) {
                  toast.error('Maksimal 3 foto diizinkan')
                  return
                }
                const oversized = selected.find((f) => f.size > 1.5 * 1024 * 1024)
                if (oversized) {
                  toast.error('Ukuran maksimal setiap foto adalah 1.5MB')
                  return
                }
                setFiles(selected)
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ef629f]/10 text-[#ef629f]">
                <Plus className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium text-slate-700">Klik atau seret foto ke sini</p>
              <p className="text-xs text-muted">Format: JPG/PNG. Maks: 3 File.</p>
            </div>
          </div>
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {files.map((file, i) => (
                <div key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-white/80 border border-slate-200 px-3 py-1.5 text-xs font-medium shadow-sm">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <div className="flex gap-3">
          <Button onClick={() => mutation.mutate()} disabled={!title || !description || !roomId || mutation.isPending} className="min-w-[160px] shadow-[0_0_20px_rgba(239,98,159,0.3)] hover:shadow-[0_0_30px_rgba(239,98,159,0.5)] hover:-translate-y-1 transition-all duration-300">
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menganalisis...
              </>
            ) : (
              'Kirim Laporan'
            )}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending} className="bg-white/60 hover:bg-white border border-slate-300 shadow-sm transition-all duration-300">Batal</Button>
        </div>

        <AnimatePresence>
          {mutation.isPending && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 rounded-xl border border-[#ef629f]/20 bg-gradient-to-r from-[#ef629f]/5 to-purple-500/5 px-4 py-3">
                <div className="relative flex-shrink-0">
                  <Bot className="h-5 w-5 text-[#ef629f]" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef629f] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef629f]" />
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#ef629f]">AI sedang menganalisis laporan Anda...</p>
                  <p className="text-xs text-muted mt-0.5">Menentukan prioritas, estimasi waktu, dan rekomendasi perbaikan</p>
                </div>
                <Loader2 className="h-4 w-4 animate-spin text-[#ef629f]/60 flex-shrink-0" />
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#ef629f]/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#ef629f] to-purple-500"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '60%' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassCard>
  )
}
