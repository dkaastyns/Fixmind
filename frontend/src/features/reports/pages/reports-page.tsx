/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, Filter, Plus, X, Loader2, Bot, Building2, Calendar, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
import { TableSkeleton } from '@/components/ui/skeleton'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { HelpTooltip } from '@/components/ui/help-tooltip'
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
  const initialSearch = searchParams.get('search') ?? ''
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch)

  useEffect(() => {
    if (searchParams.get('openForm') === 'true') {
      setShowForm(true)
    }
  }, [searchParams])

  useEffect(() => {
    const handleOpenModal = () => setShowForm(true)
    window.addEventListener('open-report-create-modal', handleOpenModal)
    return () => window.removeEventListener('open-report-create-modal', handleOpenModal)
  }, [])

  useEffect(() => {
    const q = searchParams.get('search') ?? ''
    setSearchQuery(q)
  }, [searchParams])

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(handler)
  }, [searchQuery])

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token, { activeOnly: true }) })

  const hasAdvancedFilter = !!(advFilter.roomId || advFilter.dateFrom || advFilter.dateTo)

  const [page, setPage] = useState(1)
  const LIMIT = 10

  useEffect(() => {
    setPage(1)
  }, [statusFilter, advFilter, debouncedSearch])

  const { data, isLoading } = useQuery({
    queryKey: ['reports', statusFilter, advFilter, page, debouncedSearch],
    queryFn: () =>
      fetchReports(token, {
        status: statusFilter || undefined,
        roomId: advFilter.roomId || undefined,
        dateFrom: advFilter.dateFrom || undefined,
        dateTo: advFilter.dateTo || undefined,
        page,
        limit: LIMIT,
        search: debouncedSearch.trim() || undefined,
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
      <Breadcrumb items={[{ label: 'Laporan Masalah' }]} />
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

      {/* Filter and Search Section */}
      <div className="mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari judul, pelapor, deskripsi..."
            className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 pl-9 pr-3 text-sm shadow-sm transition-all focus:border-[#F9D141]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F9D141]/10 text-slate-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <button
          onClick={() => setShowAdvanced((v) => !v)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm transition-colors glass text-muted hover:text-foreground"
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
      </div>

      {/* Collapsible advanced filter panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden mb-4"
          >
            <GlassCard className="p-5 border-white/60 bg-white/70 shadow-lg shadow-[#F9D141]/5">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100/60 pb-2">
                <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-sm">
                  <Filter className="h-4 w-4 text-[#d9a416]" />
                  <span>Filter Lanjutan</span>
                </div>
                {hasAdvancedFilter && (
                  <button
                    onClick={clearAdvancedFilter}
                    className="inline-flex items-center gap-1 text-xs text-rose-500 font-semibold hover:text-rose-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" /> Bersihkan Filter
                  </button>
                )}
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Ruangan */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Ruangan / Lokasi</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <select
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 pl-9 pr-8 text-sm shadow-sm transition-all focus:border-[#F9D141]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F9D141]/10"
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
                </div>

                {/* Tanggal Dari */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Dari Tanggal</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 pl-9 pr-3 text-sm shadow-sm transition-all focus:border-[#F9D141]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F9D141]/10"
                      value={advFilter.dateFrom}
                      onChange={(e) => setAdvFilter((f) => ({ ...f, dateFrom: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Tanggal Sampai */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Sampai Tanggal</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 pl-9 pr-3 text-sm shadow-sm transition-all focus:border-[#F9D141]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F9D141]/10"
                      value={advFilter.dateTo}
                      onChange={(e) => setAdvFilter((f) => ({ ...f, dateTo: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
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
      </AnimatePresence>

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
                        <Link to={`/dashboard/reports/${r.id}`} className="font-medium hover:text-[#d9a416]">
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
              <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-4 px-4 pb-4">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Menampilkan halaman {page} dari {totalPages}
                </span>
                <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
                  <Button variant="secondary" size="sm" className="px-2 border-slate-200 bg-white hover:bg-slate-50" disabled={page === 1} onClick={() => setPage(1)} title="Halaman Pertama">
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" className="px-2 border-slate-200 bg-white hover:bg-slate-50" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} title="Sebelumnya">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <select 
                    value={page}
                    onChange={(e) => setPage(Number(e.target.value))}
                    className="mx-1 h-9 px-2 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 cursor-pointer"
                  >
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <option key={p} value={p}>Hal {p}</option>
                    ))}
                  </select>

                  <Button variant="secondary" size="sm" className="px-2 border-slate-200 bg-white hover:bg-slate-50" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} title="Selanjutnya">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="secondary" size="sm" className="px-2 border-slate-200 bg-white hover:bg-slate-50" disabled={page === totalPages} onClick={() => setPage(totalPages)} title="Halaman Terakhir">
                    <ChevronsRight className="h-4 w-4" />
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

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token, { activeOnly: true }) })
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-0 md:p-4">
      {/* Backdrop overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="relative w-full max-w-2xl bg-white/95 border border-slate-100 shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl overflow-hidden z-10"
      >
        {/* Loading Overlay */}
        <AnimatePresence>
          {mutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
            >
              <Loader2 className="h-14 w-14 animate-spin text-[#d9a416] mb-5" />
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="text-xl font-bold bg-gradient-to-r from-[#F9D141] to-[#dbb31a] bg-clip-text text-transparent"
              >
                Mengirim Laporan...
              </motion.p>
              <p className="text-sm font-medium text-gray-500 mt-2">Mohon tunggu, data sedang diunggah ke server.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Formulir Laporan Kerusakan</h2>
            <p className="text-xs text-muted mt-0.5">Lengkapi detail di bawah untuk mengirim laporan kerusakan</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Quick templates */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Template Cepat</p>
            <div className="flex flex-wrap gap-2">
              {REPORT_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => applyTemplate(t)}
                  className="inline-flex items-center rounded-full border border-[#F9D141]/30 bg-[#F9D141]/10 px-3 py-1 text-xs font-semibold text-[#d9a416] transition-all hover:bg-[#F9D141]/20 hover:scale-105 active:scale-95"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="report-title" className="text-xs font-semibold text-foreground/75">Judul Masalah</label>
              <input
                id="report-title"
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: AC Paripurna tidak dingin"
              />
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="report-room" className="text-xs font-semibold text-foreground/75">
                Ruangan / Fasilitas
                <HelpTooltip text="Lokasi ruangan tempat fasilitas yang bermasalah berada" />
              </label>
              <select
                id="report-room"
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                value={roomId}
                onChange={(e) => { setRoomId(e.target.value); setAssetId('') }}
              >
                <option value="">Pilih ruangan</option>
                {rooms.data?.data.map((r) => (
                  <option key={r.id} value={r.id}>{r.code} — {r.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label htmlFor="report-asset" className="text-xs font-semibold text-foreground/75">
                Aset (Opsional)
                <HelpTooltip text="Aset spesifik di dalam ruangan yang mengalami kerusakan" />
              </label>
              <select
                id="report-asset"
                className="flex h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3.5 text-sm shadow-sm transition-all focus:border-[#F9D141]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F9D141]/10 disabled:opacity-50"
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
            
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="report-desc" className="text-xs font-semibold text-foreground/75">Deskripsi Lengkap</label>
              <textarea
                id="report-desc"
                className="min-h-[100px] w-full resize-y rounded-xl border border-slate-200 bg-white/70 px-3.5 py-2.5 text-sm shadow-sm transition-all focus:border-[#F9D141]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#F9D141]/10"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan detail kerusakan yang terjadi secara jelas..."
              />
            </div>
            
            <div className="sm:col-span-2 space-y-1.5">
              <label htmlFor="report-file" className="text-xs font-semibold text-foreground/75">Foto Bukti Kerusakan (Maks 3 foto, ukuran 1.5MB/foto)</label>
              <div className="relative rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-slate-50 hover:border-[#F9D141]/40 text-center">
                <input
                  id="report-file"
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
                <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F9D141]/10 text-[#d9a416]">
                    <Plus className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-slate-700">Klik atau seret foto ke sini</p>
                  <p className="text-[10px] text-muted">Format: JPG/PNG. Maks: 3 File.</p>
                </div>
              </div>
              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {files.map((file, i) => (
                    <div key={i} className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium shadow-sm">
                      <span className="truncate max-w-[150px]">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-150 p-4 bg-slate-50/50 space-y-3">
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={mutation.isPending}
              className="bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all duration-200 rounded-xl"
            >
              Batal
            </Button>
            <Button
              onClick={() => mutation.mutate()}
              disabled={!title || !description || !roomId || mutation.isPending}
              className="min-w-[140px] shadow-[0_0_20px_rgba(239,98,159,0.15)] hover:shadow-[0_0_30px_rgba(239,98,159,0.35)] hover:-translate-y-0.5 transition-all duration-200 rounded-xl"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                'Kirim Laporan'
              )}
            </Button>
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
                <div className="flex items-center gap-3 rounded-xl border border-[#F9D141]/20 bg-gradient-to-r from-[#F9D141]/5 to-amber-500/5 px-4 py-2.5">
                  <div className="relative flex-shrink-0">
                    <Bot className="h-5 w-5 text-[#d9a416]" />
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F9D141] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#F9D141]" />
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#d9a416]">AI sedang menganalisis laporan Anda...</p>
                    <p className="text-xs text-muted mt-0.5">Menentukan prioritas, estimasi waktu, dan rekomendasi perbaikan</p>
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin text-[#d9a416]/60 flex-shrink-0" />
                </div>
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#F9D141]/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#F9D141] to-amber-500"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '60%' }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body
  )
}
