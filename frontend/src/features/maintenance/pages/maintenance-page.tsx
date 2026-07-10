import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
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
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface MaintenanceSchedule {
  id: string
  title: string
  description: string
  roomId: string
  roomCode: string
  roomName: string
  assetId: string | null
  assetKode: string | null
  assetName: string | null
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY' | 'ONE_TIME'
  scheduledDate: string
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  assigneeType: 'INTERNAL' | 'EXTERNAL_VENDOR'
  assigneeName: string // Technician name or Vendor Company name
  vendorContactName?: string
  vendorPhone?: string
  estimatedCost: number
  notes: string
  createdAt: string
}

const FREQUENCY_LABEL = {
  WEEKLY: 'Mingguan',
  MONTHLY: 'Bulanan',
  QUARTERLY: 'Triwulan',
  ANNUALLY: 'Tahunan',
  ONE_TIME: 'Sekali Saja',
}

const STATUS_COLOR = {
  SCHEDULED: 'bg-amber-50 text-amber-600 border-amber-200/50',
  IN_PROGRESS: 'bg-blue-50 text-blue-600 border-blue-200/50',
  DONE: 'bg-green-50 text-green-600 border-green-200/50',
  CANCELLED: 'bg-rose-50 text-rose-600 border-rose-200/50',
}

const STATUS_LABEL = {
  SCHEDULED: 'Terjadwal',
  IN_PROGRESS: 'Dikerjakan',
  DONE: 'Selesai',
  CANCELLED: 'Batal',
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function MaintenancePage() {
  const token = useAuthStore((s) => s.accessToken)!
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [roomId, setRoomId] = useState('')
  const [assetId, setAssetId] = useState('')
  const [frequency, setFrequency] = useState<MaintenanceSchedule['frequency']>('ONE_TIME')
  const [scheduledDate, setScheduledDate] = useState('')
  const [assigneeName, setAssigneeName] = useState('')
  const [vendorContactName, setVendorContactName] = useState('')
  const [vendorPhone, setVendorPhone] = useState('')
  const [estimatedCost, setEstimatedCost] = useState('0')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<MaintenanceSchedule['status']>('SCHEDULED')

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Load schedules from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('fixmind_maintenance_schedules')
    if (saved) {
      try {
        setSchedules(JSON.parse(saved))
      } catch {
        setSchedules([])
      }
    }
  }, [])

  // Save helper
  const saveSchedules = (newSchedules: MaintenanceSchedule[]) => {
    localStorage.setItem('fixmind_maintenance_schedules', JSON.stringify(newSchedules))
    setSchedules(newSchedules)
  }

  // Fetch Rooms & Assets (for forms)
  const roomsQuery = useQuery({
    queryKey: ['rooms-maintenance'],
    queryFn: () => fetchRooms(token, true),
  })

  const assetsQuery = useQuery({
    queryKey: ['assets-maintenance', roomId],
    queryFn: () => fetchAssets(token, { roomId }),
    enabled: !!roomId,
  })

  // Selected room details helper
  const selectedRoomObj = roomsQuery.data?.data.find((r) => r.id === roomId)
  const selectedAssetObj = assetsQuery.data?.data.find((a) => a.id === assetId)

  // Trigger modal for Create
  const handleCreateNew = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setRoomId('')
    setAssetId('')
    setFrequency('ONE_TIME')
    setScheduledDate('')
    setAssigneeName('')
    setVendorContactName('')
    setVendorPhone('')
    setEstimatedCost('0')
    setNotes('')
    setStatus('SCHEDULED')
    setShowModal(true)
  }

  // Trigger modal for Edit
  const handleEdit = (s: MaintenanceSchedule) => {
    setEditingId(s.id)
    setTitle(s.title)
    setDescription(s.description)
    setRoomId(s.roomId)
    setAssetId(s.assetId ?? '')
    setFrequency(s.frequency)
    setScheduledDate(s.scheduledDate)
    setAssigneeName(s.assigneeName)
    setVendorContactName(s.vendorContactName ?? '')
    setVendorPhone(s.vendorPhone ?? '')
    setEstimatedCost(s.estimatedCost.toString())
    setNotes(s.notes)
    setStatus(s.status)
    setShowModal(true)
  }

  // Handle Submit Create/Edit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !roomId || !scheduledDate || !assigneeName) {
      toast.error('Mohon lengkapi semua kolom wajib (*)')
      return
    }

    const roomCode = selectedRoomObj?.code ?? ''
    const roomName = selectedRoomObj?.name ?? ''
    const assetKode = selectedAssetObj?.kodeBarang ?? null
    const assetName = selectedAssetObj?.namaBarang ?? null

    const payload: MaintenanceSchedule = {
      id: editingId ?? crypto.randomUUID(),
      title,
      description,
      roomId,
      roomCode,
      roomName,
      assetId: assetId || null,
      assetKode,
      assetName,
      frequency,
      scheduledDate,
      status,
      assigneeType: 'EXTERNAL_VENDOR',
      assigneeName,
      vendorContactName: vendorContactName || undefined,
      vendorPhone: vendorPhone || undefined,
      estimatedCost: Number(estimatedCost) || 0,
      notes,
      createdAt: editingId
        ? schedules.find((s) => s.id === editingId)?.createdAt ?? new Date().toISOString()
        : new Date().toISOString(),
    }

    let updatedList: MaintenanceSchedule[]
    if (editingId) {
      updatedList = schedules.map((s) => (s.id === editingId ? payload : s))
      toast.success('Jadwal pemeliharaan berhasil diperbarui')
    } else {
      updatedList = [payload, ...schedules]
      toast.success('Jadwal pemeliharaan baru berhasil dibuat')
    }

    saveSchedules(updatedList)
    setShowModal(false)
  }

  // Quick status update from list
  const handleUpdateStatus = (id: string, newStatus: MaintenanceSchedule['status']) => {
    const updated = schedules.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    saveSchedules(updated)
    toast.success(`Status jadwal berhasil diubah ke ${STATUS_LABEL[newStatus]}`)
  }

  // Handle Delete
  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jadwal pemeliharaan ini?')) {
      const updated = schedules.filter((s) => s.id !== id)
      saveSchedules(updated)
      toast.success('Jadwal pemeliharaan berhasil dihapus')
    }
  }

  // Statistics
  const stats = {
    total: schedules.length,
    scheduled: schedules.filter((s) => s.status === 'SCHEDULED').length,
    inProgress: schedules.filter((s) => s.status === 'IN_PROGRESS').length,
    done: schedules.filter((s) => s.status === 'DONE').length,
  }

  // Filtered schedules list
  const filteredSchedules = schedules.filter((s) => {
    const matchQuery =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roomName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter
    return matchQuery && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Jadwal Pemeliharaan Rutin"
        description="Kelola jadwal pemeliharaan fasilitas berkala dan monitoring vendor luar/teknisi"
        action={
          <Button onClick={handleCreateNew} className="rounded-xl bg-[#ef629f] text-white hover:bg-[#ef629f]/90">
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
          {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'DONE', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold border transition-all ${
                statusFilter === st
                  ? 'gradient-primary text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'Semua Status' : STATUS_LABEL[st as MaintenanceSchedule['status']]}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Schedule List */}
      {filteredSchedules.length === 0 ? (
        <GlassCard className="p-12 text-center text-slate-400">
          <AlertCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-semibold text-slate-700">Tidak ada jadwal pemeliharaan</h3>
          <p className="text-xs text-muted mt-1">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Coba ganti filter atau pencarian Anda'
              : 'Klik "Tambah Jadwal Baru" untuk mulai menjadwalkan.'}
          </p>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {filteredSchedules.map((s) => (
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
                      {s.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>}
                    </div>

                    {/* Room & Asset Info */}
                    <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">
                          {s.roomCode} — {s.roomName}
                        </span>
                      </div>
                      {s.assetName && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-slate-600">
                            Aset: <span className="font-medium">{s.assetName}</span> ({s.assetKode})
                          </span>
                        </div>
                      )}
                      <div className="text-[10px] text-[#ef629f] font-semibold bg-[#ef629f]/5 px-2 py-0.5 rounded w-max">
                        Frekuensi: {FREQUENCY_LABEL[s.frequency]}
                      </div>
                    </div>

                    {/* Vendor Details */}
                    <div className="border-t border-slate-100 pt-3 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500">Vendor Pelaksana:</span>
                      </div>

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
                              <a href={`tel:${s.vendorPhone}`} className="text-blue-500 hover:underline">
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
                          onClick={() => handleUpdateStatus(s.id, 'IN_PROGRESS')}
                        >
                          Mulai Kerja
                        </Button>
                      )}
                      {s.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          className="h-8 rounded-lg text-xs bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleUpdateStatus(s.id, 'DONE')}
                        >
                          Selesai
                        </Button>
                      )}
                      {(s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 rounded-lg text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 border-transparent"
                          onClick={() => handleUpdateStatus(s.id, 'CANCELLED')}
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
                        onClick={() => handleEdit(s)}
                      >
                        <Wrench className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 rounded-lg hover:bg-rose-100 hover:border-rose-200 border-slate-200 group"
                        onClick={() => handleDelete(s.id)}
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

      {/* Modal Dialog */}
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
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Contoh: Servis Rutin AC Ruang Sidang Utama"
                      />
                    </div>

                    {/* Room select */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Ruangan / Fasilitas *</label>
                      <select
                        required
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={roomId}
                        onChange={(e) => {
                          setRoomId(e.target.value)
                          setAssetId('')
                        }}
                      >
                        <option value="">Pilih Ruangan</option>
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
                        value={assetId}
                        onChange={(e) => setAssetId(e.target.value)}
                        disabled={!roomId}
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
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>

                    {/* Frequency */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Frekuensi Pemeliharaan *</label>
                      <select
                        required
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value as MaintenanceSchedule['frequency'])}
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
                      <label className="text-xs font-semibold text-foreground/75">
                        Nama Vendor / Perusahaan *
                      </label>
                      <input
                        required
                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={assigneeName}
                        onChange={(e) => setAssigneeName(e.target.value)}
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
                          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                          value={estimatedCost}
                          onChange={(e) => setEstimatedCost(e.target.value)}
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
                          value={vendorContactName}
                          onChange={(e) => setVendorContactName(e.target.value)}
                          placeholder="Contoh: Pak Budi"
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-semibold text-foreground/75">Nomor Telepon Vendor</label>
                        <input
                          className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-sm focus:border-[#ef629f]/50 focus:outline-none"
                          value={vendorPhone}
                          onChange={(e) => setVendorPhone(e.target.value)}
                          placeholder="Contoh: 081234567890"
                        />
                      </div>
                    </div>

                    {/* Description / Notes */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-semibold text-foreground/75">Deskripsi Pekerjaan / Catatan</label>
                      <textarea
                        className="min-h-[80px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all focus:border-[#ef629f]/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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
                          value={status}
                          onChange={(e) => setStatus(e.target.value as MaintenanceSchedule['status'])}
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
                    className="min-w-[120px] bg-[#ef629f] text-white hover:bg-[#ef629f]/90 shadow-md shadow-pink-200 rounded-xl"
                  >
                    Simpan Jadwal
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
