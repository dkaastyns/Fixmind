import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Wrench,
  Calendar,
  User,
  Phone,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  Building2,
  Tag,
  X,
  AlertCircle,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { AnimatedGlassCard } from '@/components/ui/animated-glass-card'
import { PageHeader } from '@/components/ui/feedback'
import { fetchRooms, fetchAssets } from '@/lib/api-client'
import {
  fetchMaintenanceSchedules,
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  updateMaintenanceStatus,
  deleteMaintenanceSchedule,
  type MaintenanceSchedule,
  type MaintenanceFrequency,
  type MaintenanceScheduleStatus,
  type MaintenanceAssigneeType,
} from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

// ─── Constants ────────────────────────────────────────────────────────────────

const FREQUENCY_LABEL: Record<MaintenanceFrequency, string> = {
  WEEKLY: 'Mingguan',
  MONTHLY: 'Bulanan',
  QUARTERLY: 'Triwulan',
  ANNUALLY: 'Tahunan',
  ONE_TIME: 'Sekali Saja',
}

const STATUS_COLOR: Record<MaintenanceScheduleStatus, string> = {
  SCHEDULED: 'bg-amber-50 text-amber-600 border-amber-200/50',
  IN_PROGRESS: 'bg-blue-50 text-blue-600 border-blue-200/50',
  DONE: 'bg-green-50 text-green-600 border-green-200/50',
  CANCELLED: 'bg-rose-50 text-rose-600 border-rose-200/50',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200/50',
}

const STATUS_LABEL: Record<MaintenanceScheduleStatus, string> = {
  SCHEDULED: 'Terjadwal',
  IN_PROGRESS: 'Dikerjakan',
  DONE: 'Selesai',
  CANCELLED: 'Batal',
  OVERDUE: 'Terlambat',
}

// ─── Form initial state ───────────────────────────────────────────────────────

const EMPTY_FORM = {
  title: '',
  description: '',
  roomId: '',
  assetId: '',
  frequency: 'ONE_TIME' as MaintenanceFrequency,
  scheduledDate: '',
  assigneeType: 'EXTERNAL_VENDOR' as MaintenanceAssigneeType,
  assigneeName: '',
  vendorContactName: '',
  vendorPhone: '',
  estimatedCost: '0',
  notes: '',
  status: 'SCHEDULED' as MaintenanceScheduleStatus,
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function MaintenancePage() {
  const token = useAuthStore((s) => s.accessToken)!
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form fields
  const [form, setForm] = useState(EMPTY_FORM)
  const set = (k: keyof typeof EMPTY_FORM) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // ─── Queries ─────────────────────────────────────────────────────────────

  const schedulesQuery = useQuery({
    queryKey: ['maintenance-schedules', statusFilter, searchQuery],
    queryFn: () =>
      fetchMaintenanceSchedules(token, {
        limit: 200,
        status: statusFilter !== 'ALL' ? (statusFilter as MaintenanceScheduleStatus) : undefined,
        search: searchQuery.trim() || undefined,
      }),
    staleTime: 30_000,
  })

  const schedules = schedulesQuery.data?.data ?? []

  const roomsQuery = useQuery({
    queryKey: ['rooms-maintenance'],
    queryFn: () => fetchRooms(token, true),
  })

  const assetsQuery = useQuery({
    queryKey: ['assets-maintenance', form.roomId],
    queryFn: () => fetchAssets(token, { roomId: form.roomId }),
    enabled: !!form.roomId,
  })

  // ─── Stats ───────────────────────────────────────────────────────────────

  const allQuery = useQuery({
    queryKey: ['maintenance-schedules-all'],
    queryFn: () => fetchMaintenanceSchedules(token, { limit: 1000 }),
    staleTime: 60_000,
  })

  const allData = allQuery.data?.data ?? []
  const stats = {
    total: allQuery.data?.meta?.total ?? allData.length,
    scheduled: allData.filter((s) => s.status === 'SCHEDULED').length,
    inProgress: allData.filter((s) => s.status === 'IN_PROGRESS').length,
    done: allData.filter((s) => s.status === 'DONE').length,
  }

  // ─── Mutations ───────────────────────────────────────────────────────────

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['maintenance-schedules'] })
    queryClient.invalidateQueries({ queryKey: ['maintenance-schedules-all'] })
  }

  const createMutation = useMutation({
    mutationFn: (data: object) => createMaintenanceSchedule(token, data),
    onSuccess: () => {
      toast.success('Jadwal pemeliharaan berhasil dibuat')
      invalidateAll()
      setShowModal(false)
    },
    onError: (err: Error) => toast.error(err.message ?? 'Gagal membuat jadwal'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => updateMaintenanceSchedule(token, id, data),
    onSuccess: () => {
      toast.success('Jadwal pemeliharaan berhasil diperbarui')
      invalidateAll()
      setShowModal(false)
    },
    onError: (err: Error) => toast.error(err.message ?? 'Gagal memperbarui jadwal'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MaintenanceScheduleStatus }) =>
      updateMaintenanceStatus(token, id, { status }),
    onSuccess: (_, { status }) => {
      toast.success(`Status berhasil diubah ke ${STATUS_LABEL[status]}`)
      invalidateAll()
    },
    onError: (err: Error) => toast.error(err.message ?? 'Gagal mengubah status'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMaintenanceSchedule(token, id),
    onSuccess: () => {
      toast.success('Jadwal pemeliharaan berhasil dihapus')
      invalidateAll()
      setDeletingId(null)
    },
    onError: (err: Error) => toast.error(err.message ?? 'Gagal menghapus jadwal'),
  })

  // ─── Modal handlers ───────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  const openEdit = (s: MaintenanceSchedule) => {
    setEditingId(s.id)
    setForm({
      title: s.title,
      description: s.description ?? '',
      roomId: s.roomId ?? '',
      assetId: s.assetId ?? '',
      frequency: s.frequency,
      scheduledDate: s.scheduledDate
        ? String(s.scheduledDate).slice(0, 10)
        : '',
      assigneeType: s.assigneeType,
      assigneeName: s.assigneeName,
      vendorContactName: s.vendorContactName ?? '',
      vendorPhone: s.vendorPhone ?? '',
      estimatedCost: String(s.estimatedCost ?? 0),
      notes: s.notes ?? '',
      status: s.status,
    })
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.scheduledDate || !form.assigneeName) {
      toast.error('Mohon lengkapi semua kolom wajib (*)')
      return
    }

    const payload = {
      title: form.title,
      description: form.description || undefined,
      roomId: form.roomId || undefined,
      assetId: form.assetId || undefined,
      frequency: form.frequency,
      scheduledDate: form.scheduledDate,
      status: form.status,
      assigneeType: form.assigneeType,
      assigneeName: form.assigneeName,
      vendorContactName: form.vendorContactName || undefined,
      vendorPhone: form.vendorPhone || undefined,
      estimatedCost: Number(form.estimatedCost) || 0,
      notes: form.notes || undefined,
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Jadwal Pemeliharaan Rutin"
        description="Kelola jadwal pemeliharaan fasilitas berkala dan monitoring vendor luar/teknisi"
        action={
          <Button
            onClick={openCreate}
            className="rounded-xl bg-[#ef629f] text-white hover:bg-[#ef629f]/90"
          >
            <Plus className="h-4 w-4 mr-2" /> Tambah Jadwal Baru
          </Button>
        }
      />

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Agenda', value: stats.total, icon: Wrench, color: 'text-purple-500 bg-purple-50' },
          { label: 'Terjadwal', value: stats.scheduled, icon: Calendar, color: 'text-amber-500 bg-amber-50' },
          { label: 'Sedang Dikerjakan', value: stats.inProgress, icon: Clock, color: 'text-blue-500 bg-blue-50' },
          { label: 'Selesai', value: stats.done, icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
        ].map((s) => (
          <AnimatedGlassCard key={s.label} className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">{s.label}</p>
              <p className="mt-2 text-3xl font-semibold text-gradient">{s.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
          </AnimatedGlassCard>
        ))}
      </div>

      {/* Filter and Search Section */}
      <GlassCard className="p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-white/60">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari agenda, vendor, atau ruangan..."
            className="flex h-9 w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm focus:border-[#ef629f]/50 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          {(['ALL', 'SCHEDULED', 'IN_PROGRESS', 'DONE', 'CANCELLED', 'OVERDUE'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? 'gradient-primary text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'Semua Status' : STATUS_LABEL[st]}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Loading */}
      {schedulesQuery.isLoading && (
        <GlassCard className="p-12 text-center text-slate-400">
          <Clock className="h-12 w-12 mx-auto text-slate-200 mb-3 animate-spin" />
          <p className="text-sm">Memuat jadwal pemeliharaan...</p>
        </GlassCard>
      )}

      {/* Schedule List */}
      {!schedulesQuery.isLoading && schedules.length === 0 && (
        <GlassCard className="p-12 text-center text-slate-400">
          <AlertCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Tidak ada jadwal pemeliharaan</h3>
          <p className="text-xs text-muted mt-1">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Coba ganti filter atau pencarian Anda'
              : 'Klik "Tambah Jadwal Baru" untuk mulai menjadwalkan.'}
          </p>
        </GlassCard>
      )}

      {!schedulesQuery.isLoading && schedules.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {schedules.map((s) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                layout
              >
                <GlassCard className="h-full border-white/60 p-5 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
                  <div className="space-y-3">
                    {/* Badge & Date Header */}
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLOR[s.status]}`}>
                        {STATUS_LABEL[s.status]}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-[#ef629f]" />
                        {new Date(s.scheduledDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-semibold text-slate-800 text-base">{s.title}</h3>
                      {s.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                      )}
                    </div>

                    {/* Room & Asset Info */}
                    <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      {s.roomName && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium text-slate-700">
                            {s.roomCode} — {s.roomName}
                          </span>
                        </div>
                      )}
                      {s.assetName && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-600">
                            Aset: <span className="font-medium">{s.assetName}</span>{' '}
                            {s.assetKode && `(${s.assetKode})`}
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-[#ef629f] font-semibold bg-[#ef629f]/5 px-2 py-0.5 rounded w-max">
                        Frekuensi: {FREQUENCY_LABEL[s.frequency]}
                      </div>
                    </div>

                    {/* Vendor Details */}
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs">
                          <User className="h-3.5 w-3.5 text-[#ef629f]" />
                          <span className="font-medium text-slate-800">{s.assigneeName}</span>
                        </div>
                        {s.estimatedCost > 0 && (
                          <div className="text-xs font-semibold text-[#ef629f]">
                            Rp {s.estimatedCost.toLocaleString('id-ID')}
                          </div>
                        )}
                      </div>

                      {(s.vendorContactName || s.vendorPhone) && (
                        <div className="bg-[#ef629f]/5 p-2 rounded-lg border border-[#ef629f]/10 text-[11px] space-y-1">
                          {s.vendorContactName && (
                            <div>
                              CP: <span className="font-medium text-slate-700">{s.vendorContactName}</span>
                            </div>
                          )}
                          {s.vendorPhone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-slate-400" />
                              <a
                                href={`tel:${s.vendorPhone}`}
                                className="text-blue-500 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {s.vendorPhone}
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {s.notes && (
                      <div className="bg-slate-100/50 p-2 rounded-lg text-slate-600 text-[11px] italic">
                        Catatan: {s.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-4 gap-2">
                    <div className="flex gap-1.5">
                      {s.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          className="h-8 rounded-lg text-xs bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={() => statusMutation.mutate({ id: s.id, status: 'IN_PROGRESS' })}
                          disabled={statusMutation.isPending}
                        >
                          Mulai Kerja
                        </Button>
                      )}
                      {s.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          className="h-8 rounded-lg text-xs bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => statusMutation.mutate({ id: s.id, status: 'DONE' })}
                          disabled={statusMutation.isPending}
                        >
                          Selesai
                        </Button>
                      )}
                      {(s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 rounded-lg text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 border-transparent"
                          onClick={() => statusMutation.mutate({ id: s.id, status: 'CANCELLED' })}
                          disabled={statusMutation.isPending}
                        >
                          Batal
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-slate-150 border-slate-200"
                        onClick={() => openEdit(s)}
                      >
                        <Wrench className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-rose-100 hover:border-rose-200 border-slate-200 group"
                        onClick={() => setDeletingId(s.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
                      </Button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) deleteMutation.mutate(deletingId)
        }}
        isLoading={deleteMutation.isPending}
        title="Hapus Jadwal Pemeliharaan"
        description="Apakah Anda yakin ingin menghapus jadwal pemeliharaan ini? Tindakan ini tidak dapat dibatalkan."
      />

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-0 md:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-2xl bg-white/95 border border-slate-100 shadow-2xl flex flex-col h-full md:h-auto md:max-h-[90vh] rounded-none md:rounded-2xl overflow-hidden z-10"
            >
              <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-150 px-6 py-4 bg-slate-50/50">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">
                      {editingId ? 'Ubah Jadwal Pemeliharaan' : 'Tambah Jadwal Pemeliharaan'}
                    </h2>
                    <p className="text-xs text-muted mt-0.5">Lengkapi kolom untuk menyimpan agenda pemeliharaan rutin</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Title */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Judul Kegiatan *</label>
                      <input
                        required
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={form.title}
                        onChange={(e) => set('title')(e.target.value)}
                        placeholder="Contoh: Servis Rutin AC Ruang Sidang Utama"
                      />
                    </div>

                    {/* Room select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Ruangan / Fasilitas</label>
                      <select
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={form.roomId}
                        onChange={(e) => {
                          set('roomId')(e.target.value)
                          set('assetId')('')
                        }}
                      >
                        <option value="">Pilih Ruangan (Opsional)</option>
                        {roomsQuery.data?.data.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.code} — {r.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Asset select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Aset Terkait (Opsional)</label>
                      <select
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10 disabled:opacity-50"
                        value={form.assetId}
                        onChange={(e) => set('assetId')(e.target.value)}
                        disabled={!form.roomId}
                      >
                        <option value="">Tanpa Aset Spesifik</option>
                        {assetsQuery.data?.data.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.kodeBarang} - {a.namaBarang}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date picker */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Tanggal Pelaksanaan *</label>
                      <input
                        type="date"
                        required
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={form.scheduledDate}
                        onChange={(e) => set('scheduledDate')(e.target.value)}
                      />
                    </div>

                    {/* Frequency */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Frekuensi Pemeliharaan *</label>
                      <select
                        required
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={form.frequency}
                        onChange={(e) => set('frequency')(e.target.value as MaintenanceFrequency)}
                      >
                        <option value="ONE_TIME">Sekali Saja (One Time)</option>
                        <option value="WEEKLY">Mingguan (Weekly)</option>
                        <option value="MONTHLY">Bulanan (Monthly)</option>
                        <option value="QUARTERLY">Triwulan (Quarterly)</option>
                        <option value="ANNUALLY">Tahunan (Annually)</option>
                      </select>
                    </div>

                    {/* Name input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Nama Vendor / Perusahaan *</label>
                      <input
                        required
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={form.assigneeName}
                        onChange={(e) => set('assigneeName')(e.target.value)}
                        placeholder="Contoh: CV Maju Jaya Teknik"
                      />
                    </div>

                    {/* Estimated cost */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Estimasi Biaya (Rupiah)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-semibold">Rp</span>
                        <input
                          type="number"
                          min="0"
                          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                          value={form.estimatedCost}
                          onChange={(e) => set('estimatedCost')(e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Vendor Contact details */}
                    <div className="sm:col-span-2 grid gap-3 grid-cols-2 bg-pink-50/20 border border-pink-100/50 p-4 rounded-xl">
                      <div className="space-y-1.5 col-span-2">
                        <p className="text-[10px] font-bold text-[#ef629f] uppercase tracking-wider">
                          Informasi Kontak Vendor Luar
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/75">Nama Kontak Person</label>
                        <input
                          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm focus:border-[#ef629f]/50 focus:outline-none"
                          value={form.vendorContactName}
                          onChange={(e) => set('vendorContactName')(e.target.value)}
                          placeholder="Contoh: Pak Budi"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/75">Nomor Telepon Vendor</label>
                        <input
                          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm focus:border-[#ef629f]/50 focus:outline-none"
                          value={form.vendorPhone}
                          onChange={(e) => set('vendorPhone')(e.target.value)}
                          placeholder="Contoh: 081234567890"
                        />
                      </div>
                    </div>

                    {/* Description / Notes */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Deskripsi Pekerjaan / Catatan</label>
                      <textarea
                        className="min-h-[80px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={form.description}
                        onChange={(e) => set('description')(e.target.value)}
                        placeholder="Detail pekerjaan pemeliharaan berkala..."
                      />
                    </div>

                    {/* Status (only on editing) */}
                    {editingId && (
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/75">Status Jadwal *</label>
                        <select
                          required
                          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm focus:border-[#ef629f]/50 focus:outline-none"
                          value={form.status}
                          onChange={(e) => set('status')(e.target.value as MaintenanceScheduleStatus)}
                        >
                          <option value="SCHEDULED">Terjadwal (Scheduled)</option>
                          <option value="IN_PROGRESS">Sedang Dikerjakan (In Progress)</option>
                          <option value="DONE">Selesai (Done)</option>
                          <option value="CANCELLED">Batal (Cancelled)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-150 p-4 bg-slate-50/50 flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-xl"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="min-w-[120px] bg-[#ef629f] text-white hover:bg-[#ef629f]/90 shadow-md shadow-pink-200 rounded-xl"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Modal konfirmasi hapus ───────────────────────────────────────────────────

function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  title,
  description,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
  title: string
  description: string
}) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl border border-slate-100 z-10"
          >
            <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-base font-bold text-slate-800">{title}</h3>
            <p className="mb-5 text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 border-none rounded-xl text-slate-700 text-xs font-semibold h-9"
              >
                Batalkan
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold h-9"
              >
                {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
