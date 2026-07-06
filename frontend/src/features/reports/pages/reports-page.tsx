import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronUp, Filter, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
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

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token, true) })

  const hasAdvancedFilter = !!(advFilter.roomId || advFilter.dateFrom || advFilter.dateTo)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', statusFilter, advFilter],
    queryFn: () =>
      fetchReports(token, {
        status: statusFilter || undefined,
        roomId: advFilter.roomId || undefined,
        dateFrom: advFilter.dateFrom || undefined,
        dateTo: advFilter.dateTo || undefined,
      }),
  })

  const reports = data?.data ?? []
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
        {(['', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-xl px-3 py-1.5 text-sm transition-colors ${
              statusFilter === s ? 'gradient-primary text-white' : 'glass text-muted hover:text-foreground'
            }`}
          >
            {s ? s.replace(/_/g, ' ') : 'Semua'}
          </button>
        ))}

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
          onClose={() => setShowForm(false)}
          onSuccess={(id) => {
            qc.invalidateQueries({ queryKey: ['reports'] })
            setShowForm(false)
            toast.success('Laporan berhasil dikirim')
            navigate(`/dashboard/reports/${id}`)
          }}
        />
      )}

      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <p className="p-6 text-sm text-muted">Memuat data...</p>
        ) : reports.length === 0 ? (
          <EmptyState title="Belum ada laporan" description="Buat laporan jika Anda menemukan kerusakan fasilitas." />
        ) : (
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
}: {
  token: string
  onClose: () => void
  onSuccess: (id: string) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [roomId, setRoomId] = useState('')
  const [assetId, setAssetId] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token, true) })
  const assets = useQuery({
    queryKey: ['assets', roomId],
    queryFn: () => fetchAssets(token, roomId),
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
    <GlassCard className="mb-6">
      <h2 className="text-lg font-medium">Formulir Laporan Kerusakan</h2>

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
            className="flex h-11 w-full rounded-xl border border-white/20 bg-white/40 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/50 focus:border-[#ef629f]/50 focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: AC Paripurna tidak dingin"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Ruangan / Fasilitas</label>
          <select
            className="flex h-11 w-full appearance-none rounded-xl border border-white/20 bg-white/40 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/50 focus:border-[#ef629f]/50 focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
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
            className="flex h-11 w-full appearance-none rounded-xl border border-white/20 bg-white/40 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/50 focus:border-[#ef629f]/50 focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            disabled={!roomId}
          >
            <option value="">Tanpa Aset Spesifik</option>
            {assets.data?.data.map((a) => (
              <option key={a.id} value={a.id}>{a.assetCode} — {a.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium text-foreground/80">Deskripsi Lengkap</label>
          <textarea
            className="min-h-[120px] w-full resize-y rounded-xl border border-white/20 bg-white/40 px-4 py-3 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/50 focus:border-[#ef629f]/50 focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan detail kerusakan yang terjadi secara jelas..."
          />
        </div>
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium text-foreground/80">Foto Bukti Kerusakan (Maks 3 foto, ukuran 1.5MB/foto)</label>
          <div className="rounded-xl border border-dashed border-white/40 bg-white/20 p-4 transition-all hover:bg-white/30 text-center">
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
              className="mx-auto flex w-full max-w-sm cursor-pointer text-sm file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-[#ef629f] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#ef629f]/90"
            />
          </div>
          {files.length > 0 && (
            <p className="text-xs text-muted mt-2">{files.length} foto dipilih.</p>
          )}
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!title || !description || !roomId || mutation.isPending}>
          Kirim Laporan
        </Button>
        <Button variant="ghost" onClick={onClose}>Batal</Button>
      </div>
    </GlassCard>
  )
}
