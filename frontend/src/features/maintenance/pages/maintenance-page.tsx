import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { AnimatedGlassCard } from '@/components/ui/animated-glass-card'
import { EmptyState, PageHeader } from '@/components/ui/feedback'
import {
  createMaintenanceSchedule,
  deleteMaintenanceSchedule,
  fetchAssets,
  fetchMaintenanceSchedules,
  fetchRooms,
  fetchTechnicians,
  updateMaintenanceStatus,
} from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import type { MaintenanceSchedule, MaintenanceStatus } from '@/types/api'

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  SCHEDULED: 'bg-blue-100/60 text-blue-600',
  IN_PROGRESS: 'bg-yellow-100/60 text-yellow-600',
  DONE: 'bg-green-100/60 text-green-600',
  OVERDUE: 'bg-red-100/60 text-red-600',
}

const STATUS_LABELS: Record<MaintenanceStatus, string> = {
  SCHEDULED: 'Terjadwal',
  IN_PROGRESS: 'Sedang Dikerjakan',
  DONE: 'Selesai',
  OVERDUE: 'Terlambat',
}

const FREQUENCY_LABELS: Record<string, string> = {
  ONCE: 'Sekali',
  DAILY: 'Harian',
  WEEKLY: 'Mingguan',
  MONTHLY: 'Bulanan',
}

function DateBadge({ dateStr }: { dateStr: string }) {
  const d = new Date(dateStr)
  const day = d.toLocaleDateString('id-ID', { day: '2-digit' })
  const month = d.toLocaleDateString('id-ID', { month: 'short' })
  const year = d.getFullYear()
  return (
    <div className="inline-flex flex-col items-center justify-center rounded-xl border border-white/30 bg-white/50 px-3 py-1.5 text-center shadow-sm min-w-[52px]">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#ef629f]">{month}</span>
      <span className="text-xl font-bold leading-tight">{day}</span>
      <span className="text-[10px] text-muted">{year}</span>
    </div>
  )
}

export function MaintenancePage() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const isAdmin = user?.role === 'ADMIN'
  const [showForm, setShowForm] = useState(false)
  const [statusDropdown, setStatusDropdown] = useState<string | null>(null)

  const queryParams = isAdmin ? {} : { technicianId: user?.id }
  const { data, isLoading } = useQuery({
    queryKey: ['maintenance', queryParams],
    queryFn: () => fetchMaintenanceSchedules(token, queryParams),
  })
  const schedules = data?.data ?? []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMaintenanceSchedule(token, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Jadwal berhasil dihapus')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MaintenanceStatus }) =>
      updateMaintenanceStatus(token, id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['maintenance'] })
      setStatusDropdown(null)
      toast.success('Status jadwal diperbarui')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Pemeliharaan"
        description="Kelola jadwal pemeliharaan rutin fasilitas DPRD Kota Semarang"
        action={
          isAdmin ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4" /> Jadwal Baru
            </Button>
          ) : undefined
        }
      />

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(STATUS_COLORS) as MaintenanceStatus[]).map((s) => {
          const count = schedules.filter((sc) => sc.status === s).length
          return (
            <AnimatedGlassCard key={s} className="p-5">
              <p className="text-xs font-medium text-muted uppercase tracking-wide">{STATUS_LABELS[s]}</p>
              <p className="mt-2 text-3xl font-semibold text-gradient">{count}</p>
            </AnimatedGlassCard>
          )
        })}
      </div>

      <AnimatePresence>
        {showForm && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CreateMaintenanceForm
              token={token}
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                qc.invalidateQueries({ queryKey: ['maintenance'] })
                setShowForm(false)
                toast.success('Jadwal pemeliharaan berhasil dibuat')
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <p className="p-6 text-sm text-muted">Memuat jadwal...</p>
        ) : schedules.length === 0 ? (
          <EmptyState
            title="Belum ada jadwal pemeliharaan"
            description="Buat jadwal pemeliharaan untuk ruangan dan aset yang perlu dirawat secara berkala."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/40 text-left text-muted">
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Judul</th>
                  <th className="px-4 py-3 font-medium">Ruangan</th>
                  <th className="px-4 py-3 font-medium">Teknisi</th>
                  <th className="px-4 py-3 font-medium">Frekuensi</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((sc) => (
                  <tr key={sc.id} className="border-b border-white/20 hover:bg-white/30">
                    <td className="px-4 py-3">
                      <DateBadge dateStr={sc.scheduledDate} />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{sc.title}</p>
                      {sc.assetName && (
                        <p className="text-xs text-muted mt-0.5">Aset: {sc.assetName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{sc.roomName ?? '—'}</td>
                    <td className="px-4 py-3 text-muted">{sc.technicianName ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-white/50 px-2 py-0.5 text-xs">
                        {FREQUENCY_LABELS[sc.frequency] ?? sc.frequency}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[sc.status]}`}>
                        {STATUS_LABELS[sc.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* Status update dropdown */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setStatusDropdown(statusDropdown === sc.id ? null : sc.id)
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-white/40 px-2 py-1 text-xs hover:bg-white/60 transition-colors"
                          >
                            Ubah Status <ChevronDown className="h-3 w-3" />
                          </button>
                          <AnimatePresence>
                            {statusDropdown === sc.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-xl border border-white/30 bg-white/90 shadow-lg backdrop-blur-md"
                              >
                                {(Object.keys(STATUS_LABELS) as MaintenanceStatus[]).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => statusMutation.mutate({ id: sc.id, status: s })}
                                    className={`block w-full px-3 py-2 text-left text-xs hover:bg-white/50 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                                      sc.status === s ? 'font-semibold' : ''
                                    }`}
                                  >
                                    {STATUS_LABELS[s]}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              if (confirm('Hapus jadwal ini?')) {
                                deleteMutation.mutate(sc.id)
                              }
                            }}
                            className="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Hapus jadwal"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
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

// ── Create Maintenance Form ──────────────────────────────────────────
type FormState = {
  title: string
  description: string
  roomId: string
  assetId: string
  technicianId: string
  scheduledDate: string
  frequency: MaintenanceSchedule['frequency']
}

function CreateMaintenanceForm({
  token,
  onClose,
  onSuccess,
}: {
  token: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    roomId: '',
    assetId: '',
    technicianId: '',
    scheduledDate: '',
    frequency: 'ONCE',
  })

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token, true) })
  const assets = useQuery({
    queryKey: ['assets', form.roomId],
    queryFn: () => fetchAssets(token, form.roomId),
    enabled: !!form.roomId,
  })
  const technicians = useQuery({
    queryKey: ['technicians'],
    queryFn: () => fetchTechnicians(token),
  })

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }))

  const mutation = useMutation({
    mutationFn: () =>
      createMaintenanceSchedule(token, {
        title: form.title,
        description: form.description || undefined,
        roomId: form.roomId,
        assetId: form.assetId || undefined,
        technicianId: form.technicianId,
        scheduledDate: form.scheduledDate,
        frequency: form.frequency,
      }),
    onSuccess,
    onError: (e: Error) => toast.error(e.message),
  })

  const inputCls =
    'flex h-11 w-full rounded-xl border border-white/20 bg-white/40 px-4 text-sm shadow-sm backdrop-blur-md transition-all hover:bg-white/50 focus:border-[#ef629f]/50 focus:bg-white/60 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10'
  const selectCls = inputCls + ' appearance-none'

  const isValid = form.title && form.roomId && form.technicianId && form.scheduledDate

  return (
    <GlassCard className="mb-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="h-5 w-5 text-[#ef629f]" />
        <h2 className="text-lg font-semibold">Buat Jadwal Pemeliharaan</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium text-foreground/80">Judul Jadwal</label>
          <input className={inputCls} value={form.title} onChange={set('title')} placeholder="Contoh: Servis AC Ruang Rapat" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Ruangan</label>
          <select className={selectCls} value={form.roomId} onChange={(e) => { set('roomId')(e); setForm((f) => ({ ...f, assetId: '' })) }}>
            <option value="">Pilih ruangan</option>
            {rooms.data?.data.map((r) => (
              <option key={r.id} value={r.id}>{r.code} — {r.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Aset (Opsional)</label>
          <select className={selectCls} value={form.assetId} onChange={set('assetId')} disabled={!form.roomId}>
            <option value="">Tanpa Aset Spesifik</option>
            {assets.data?.data.map((a) => (
              <option key={a.id} value={a.id}>{a.kodeBarang} - {a.namaBarang}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Teknisi</label>
          <select className={selectCls} value={form.technicianId} onChange={set('technicianId')}>
            <option value="">Pilih teknisi</option>
            {technicians.data?.data.map((t) => (
              <option key={t.id} value={t.id}>{t.fullName}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Tanggal Jadwal</label>
          <input type="date" className={inputCls} value={form.scheduledDate} onChange={set('scheduledDate')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">Frekuensi</label>
          <select className={selectCls} value={form.frequency} onChange={set('frequency')}>
            <option value="ONCE">Sekali</option>
            <option value="DAILY">Harian</option>
            <option value="WEEKLY">Mingguan</option>
            <option value="MONTHLY">Bulanan</option>
          </select>
        </div>
        <div className="sm:col-span-2 space-y-2">
          <label className="text-sm font-medium text-foreground/80">Deskripsi (Opsional)</label>
          <textarea
            className="min-h-[90px] w-full resize-y rounded-xl border border-white/20 bg-white/40 px-4 py-3 text-sm shadow-sm backdrop-blur-md focus:border-[#ef629f]/50 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
            value={form.description}
            onChange={set('description')}
            placeholder="Detail pekerjaan yang perlu dilakukan..."
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!isValid || mutation.isPending}>
          Simpan Jadwal
        </Button>
        <Button variant="ghost" onClick={onClose}>Batal</Button>
      </div>
    </GlassCard>
  )
}
