import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRightLeft, Send, Sparkles, Package, Building, ArrowRight, ClipboardList, HelpCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
import { ListSkeleton } from '@/components/ui/skeleton'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import {
  createAssetTransfer,
  fetchAssetTransfers,
  fetchAssets,
  fetchRooms,
  updateAsset,
} from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function AssetTransferPage() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [searchParams] = useSearchParams()

  const [roomId, setRoomId] = useState(searchParams.get('roomId') ?? '')
  const [assetId, setAssetId] = useState(searchParams.get('assetId') ?? '')
  const [toRoomId, setToRoomId] = useState('')
  const [reason, setReason] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  // Local state for filtering history
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [page, setPage] = useState(1)
  const LIMIT = 2

  useEffect(() => {
    setPage(1)
  }, [historyStatusFilter])

  const rooms = useQuery({
    queryKey: ['asset-transfer-rooms'],
    queryFn: () => fetchRooms(token, { activeOnly: true }),
  })

  const assets = useQuery({
    queryKey: ['asset-transfer-assets', roomId],
    queryFn: () => fetchAssets(token, { roomId, limit: 100 }),
    enabled: Boolean(roomId),
  })

  const myTransfers = useQuery({
    queryKey: ['asset-transfers', 'mine', page, historyStatusFilter],
    queryFn: () => fetchAssetTransfers(token, { 
      mineOnly: true, 
      limit: LIMIT, 
      page,
      status: historyStatusFilter === 'ALL' ? undefined : historyStatusFilter
    }),
  })

  const filteredTransfers = myTransfers.data?.data ?? []
  const totalTransfers = myTransfers.data?.meta?.total ?? 0
  const totalPages = Math.ceil(totalTransfers / LIMIT)

  const selectedAsset = useMemo(
    () => assets.data?.data.find((asset) => asset.id === assetId),
    [assets.data?.data, assetId],
  )

  const selectedSourceRoom = useMemo(
    () => rooms.data?.data.find((r) => r.id === roomId),
    [rooms.data?.data, roomId],
  )

  const selectedTargetRoom = useMemo(
    () => rooms.data?.data.find((r) => r.id === toRoomId),
    [rooms.data?.data, toRoomId],
  )

  const availableTargetRooms = useMemo(() => {
    const sourceRoomId = selectedAsset?.roomId ?? roomId
    return (rooms.data?.data ?? []).filter((room) => room.id !== sourceRoomId)
  }, [rooms.data?.data, roomId, selectedAsset?.roomId])

  const createMutation = useMutation({
    mutationFn: () => createAssetTransfer(token, { assetId, toRoomId, reason: reason.trim() }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset-transfers'] })
      toast.success('Pengajuan pemindahan aset berhasil dikirim')
      setAssetId('')
      setToRoomId('')
      setReason('')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const directMoveMutation = useMutation({
    mutationFn: () => updateAsset(token, assetId, { roomId: toRoomId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['asset-transfer-assets'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
      qc.invalidateQueries({ queryKey: ['asset-transfers'] })
      toast.success('Aset berhasil dipindahkan secara langsung')
      setAssetId('')
      setToRoomId('')
      setReason('')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const isAdmin = user?.role === 'ADMIN'
  const canSubmit = isAdmin
    ? Boolean(roomId && assetId && toRoomId)
    : Boolean(roomId && assetId && toRoomId && reason.trim().length >= 10)

  useEffect(() => {
    const paramRoom = searchParams.get('roomId') ?? ''
    const paramAsset = searchParams.get('assetId') ?? ''
    if (paramRoom && paramRoom !== roomId) setRoomId(paramRoom)
    if (paramAsset && paramAsset !== assetId) setAssetId(paramAsset)
  }, [assetId, roomId, searchParams])

  // (Filtering is now handled server-side via the query)

  if (isAdmin) {
    return (
      <div className="space-y-6">
        <AnimatePresence>
          {directMoveMutation.isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
            >
              <Loader2 className="h-14 w-14 animate-spin text-[#d9a416] mb-5" />
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="text-xl font-bold bg-gradient-to-r from-[#FFD641] to-[#515151] bg-clip-text text-transparent"
              >
                Memindahkan Aset...
              </motion.p>
              <p className="text-sm font-medium text-gray-500 mt-2">Mohon tunggu, perubahan data sedang disimpan.</p>
            </motion.div>
          )}
        </AnimatePresence>
        <Breadcrumb items={[{ label: 'Transfer Aset' }]} />
        <PageHeader
          title="Pemindahan Aset"
          description="Pindahkan aset antar ruangan secara instan dan kelola riwayat pemindahan Anda."
        />

        <GlassCard className="max-w-7xl mx-auto w-full border border-white/40 p-6 md:p-8 bg-white/80 backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Left Column: Form Pemindahan */}
            <div className="space-y-5 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F9D141]/10 text-[#d9a416] shadow-inner">
                    <ArrowRightLeft className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-800">Form Pemindahan Aset</h2>
                    <p className="text-xs text-slate-500">
                      Pilih ruangan asal, aset, dan ruangan tujuan untuk memindahkan aset secara instan.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="direct-source-room" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" /> Ruangan Asal
                    </label>
                    <select
                      id="direct-source-room"
                      className="w-full rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 font-medium text-slate-800"
                      value={roomId}
                      onChange={(e) => {
                        setRoomId(e.target.value)
                        setAssetId('')
                        setToRoomId('')
                      }}
                    >
                      <option value="">Pilih ruangan asal</option>
                      {(rooms.data?.data ?? []).map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.code} - {room.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="direct-asset" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Aset / Inventaris
                    </label>
                    <select
                      id="direct-asset"
                      className="w-full rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 disabled:opacity-60 font-medium text-slate-800"
                      value={assetId}
                      onChange={(e) => setAssetId(e.target.value)}
                      disabled={!roomId || assets.isLoading}
                    >
                      <option value="">{roomId ? 'Pilih aset' : 'Pilih ruangan asal dulu'}</option>
                      {(assets.data?.data ?? []).map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.kodeBarang} - {asset.namaBarang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="direct-target-room" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" /> Ruangan Tujuan
                    </label>
                    <select
                      id="direct-target-room"
                      className="w-full rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 disabled:opacity-60 font-medium text-slate-800"
                      value={toRoomId}
                      onChange={(e) => setToRoomId(e.target.value)}
                      disabled={!assetId}
                    >
                      <option value="">{assetId ? 'Pilih ruangan tujuan' : 'Pilih aset dulu'}</option>
                      {availableTargetRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.code} - {room.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-200/40">
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={!canSubmit || directMoveMutation.isPending}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {directMoveMutation.isPending ? 'Memindahkan...' : 'Pindahkan Langsung'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setToRoomId('')
                    setReason('')
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Right Column: Preview & Details */}
            <div className="flex flex-col justify-center bg-slate-500/5 rounded-2xl p-6 border border-slate-200/10 h-full">
              {selectedAsset ? (
                <div className="space-y-5 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Selected Asset Details Box */}
                    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm flex items-center gap-3.5">
                      <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shadow-inner">
                        <Package className="w-6 h-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aset Terpilih</p>
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {selectedAsset.namaBarang}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                          Kode: {selectedAsset.kodeBarang}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                          <span>📍</span> Lokasi saat ini: <strong className="text-slate-700">{selectedAsset.roomName ?? selectedAsset.roomCode}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Visual Route flow */}
                    {roomId && toRoomId && (
                      <div className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between text-center relative overflow-hidden shadow-sm">
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider block">Ruangan Asal</span>
                          <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">
                            {selectedSourceRoom?.code ?? 'Asal'}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{selectedSourceRoom?.name}</p>
                        </div>
                        <div className="px-4 flex flex-col items-center">
                          <motion.div
                            animate={{ x: [-4, 4, -4] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            className="text-[#d9a416]"
                          >
                            <ArrowRightLeft className="w-5 h-5" />
                          </motion.div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Rute</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] uppercase font-bold text-purple-500 tracking-wider block">Ruangan Tujuan</span>
                          <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">
                            {selectedTargetRoom?.code ?? 'Tujuan'}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">{selectedTargetRoom?.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Banner */}
                  <div className="bg-blue-500/10 border border-blue-500/20 text-blue-700 text-xs p-3.5 rounded-xl flex gap-2 items-start">
                    <span>
                      <strong>Otoritas Penuh:</strong> Pemindahan ini bersifat langsung dan instan. Lokasi aset di database akan langsung diperbarui setelah Anda mengonfirmasi.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-400">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Menunggu Aset Terpilih</h4>
                  <p className="text-xs text-slate-500 max-w-[250px] mx-auto leading-relaxed">
                    Silakan pilih ruangan asal dan aset terlebih dahulu untuk melihat informasi lokasi serta ilustrasi rute pemindahan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Rooms Grid Reference */}
        <div className="space-y-4 pt-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Daftar Ruangan & Lokasi</h3>
              <p className="text-xs text-slate-500">Gunakan daftar ini sebagai referensi kode ruangan asal dan tujuan.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(rooms.data?.data ?? []).map((room) => (
              <div 
                key={room.id}
                className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex items-start gap-3"
              >
                <div className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl shadow-inner mt-0.5">
                  <Building className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="bg-slate-100 border border-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase">
                    {room.code}
                  </span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1.5 truncate" title={room.name}>
                    {room.name}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                    Gedung: {room.building ?? '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {showConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                onClick={() => setShowConfirm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-md relative z-10"
              >
                <GlassCard className="p-6 bg-white shadow-2xl border-white/80 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                      <ArrowRightLeft className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">Konfirmasi Pemindahan Langsung</h3>
                      <p className="text-xs text-slate-500 font-medium">Aset akan dipindahkan ke ruangan tujuan secara instan.</p>
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs bg-slate-50/50">
                    <div className="p-3 flex justify-between gap-4">
                      <span className="text-slate-400 font-semibold">Aset</span>
                      <span className="font-bold text-slate-800 text-right truncate">
                        {selectedAsset?.namaBarang} ({selectedAsset?.kodeBarang})
                      </span>
                    </div>
                    <div className="p-3 flex justify-between gap-4">
                      <span className="text-slate-400 font-semibold">Dari</span>
                      <span className="font-bold text-slate-800">{selectedSourceRoom?.code} - {selectedSourceRoom?.name}</span>
                    </div>
                    <div className="p-3 flex justify-between gap-4">
                      <span className="text-slate-400 font-semibold">Ke</span>
                      <span className="font-bold text-slate-800">{selectedTargetRoom?.code} - {selectedTargetRoom?.name}</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={directMoveMutation.isPending}>
                      Tidak, Batal
                    </Button>
                    <Button 
                      onClick={() => {
                        directMoveMutation.mutate()
                        setShowConfirm(false)
                      }}
                      disabled={directMoveMutation.isPending}
                      className="gap-2"
                    >
                      {directMoveMutation.isPending ? 'Memindahkan...' : 'Ya, Pindahkan'}
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {createMutation.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm"
          >
            <Loader2 className="h-14 w-14 animate-spin text-[#d9a416] mb-5" />
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-xl font-bold bg-gradient-to-r from-[#FFD641] to-[#515151] bg-clip-text text-transparent"
            >
              Mengirim Pengajuan...
            </motion.p>
            <p className="text-sm font-medium text-gray-500 mt-2">Mohon tunggu, pengajuan Anda sedang dikirim ke server.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <Breadcrumb items={[{ label: 'Transfer Aset' }]} />
      <PageHeader
        title="Pengajuan Pemindahan Aset"
        description="Ajukan perpindahan aset antar ruangan, lalu admin akan meninjau dan mengubah lokasi aset jika disetujui."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Form Pengajuan */}
        <GlassCard className="space-y-6 border border-white/40">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F9D141]/10 text-[#d9a416] shadow-inner">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Form Pengajuan</h2>
              <p className="text-xs text-slate-500">
                Pilih ruangan asal, aset, ruangan tujuan, lalu jelaskan alasan perpindahannya.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="req-source-room" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" /> Ruangan Asal
                </label>
                <select
                  id="req-source-room"
                  className="w-full rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 font-medium text-slate-800"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value)
                    setAssetId('')
                    setToRoomId('')
                  }}
                >
                  <option value="">Pilih ruangan asal</option>
                  {(rooms.data?.data ?? []).map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.code} - {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="req-asset" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5" /> Aset / Inventaris
                </label>
                <select
                  id="req-asset"
                  className="w-full rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 disabled:opacity-60 font-medium text-slate-800"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  disabled={!roomId || assets.isLoading}
                >
                  <option value="">{roomId ? 'Pilih aset' : 'Pilih ruangan asal dulu'}</option>
                  {(assets.data?.data ?? []).map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.kodeBarang} - {asset.namaBarang}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Asset Details Box */}
            <AnimatePresence mode="wait">
              {selectedAsset && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-xl border border-white bg-white/80 p-4 shadow-sm flex items-center gap-3.5"
                >
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl shadow-inner">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Aset Terpilih</p>
                    <p className="font-bold text-slate-800 text-sm truncate">
                      {selectedAsset.namaBarang}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 font-semibold">
                      Kode: {selectedAsset.kodeBarang}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                      <span>📍</span> Lokasi saat ini: <strong className="text-slate-700">{selectedAsset.roomName ?? selectedAsset.roomCode}</strong>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label htmlFor="req-target-room" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Ruangan Tujuan
              </label>
              <select
                id="req-target-room"
                className="w-full rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 disabled:opacity-60 font-medium text-slate-800"
                value={toRoomId}
                onChange={(e) => setToRoomId(e.target.value)}
                disabled={!assetId}
              >
                <option value="">{assetId ? 'Pilih ruangan tujuan' : 'Pilih aset dulu'}</option>
                {availableTargetRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.code} - {room.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Visual Route flow */}
            {roomId && toRoomId && (
              <div className="bg-white/40 border border-white/60 rounded-xl p-4 flex items-center justify-between text-center relative overflow-hidden shadow-inner my-2">
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-bold text-blue-500 tracking-wider block">Ruangan Asal</span>
                  <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">
                    {selectedSourceRoom?.code ?? 'Asal'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{selectedSourceRoom?.name}</p>
                </div>
                <div className="px-4 flex flex-col items-center">
                  <motion.div
                    animate={{ x: [-4, 4, -4] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-[#d9a416]"
                  >
                    <ArrowRightLeft className="w-5 h-5" />
                  </motion.div>
                  <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Rute</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] uppercase font-bold text-purple-500 tracking-wider block">Ruangan Tujuan</span>
                  <p className="text-sm font-extrabold text-slate-800 truncate mt-0.5">
                    {selectedTargetRoom?.code ?? 'Tujuan'}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{selectedTargetRoom?.name}</p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="req-reason" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5" /> Alasan Pemindahan
              </label>
              <textarea
                id="req-reason"
                className="min-h-[120px] w-full rounded-xl border border-white/60 bg-white/70 px-3.5 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 font-medium text-slate-800"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Contoh: Aset dipindahkan karena penataan ulang ruangan tim keuangan agar lebih dekat dengan pintu lobi utama."
                maxLength={1000}
              />
              <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                Minimal 10 karakter. Berikan penjelasan yang rinci untuk mempermudah persetujuan admin.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={!canSubmit || createMutation.isPending}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {createMutation.isPending ? 'Mengirim...' : 'Kirim Pengajuan'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setToRoomId('')
                setReason('')
              }}
            >
              Reset
            </Button>
          </div>
        </GlassCard>

        {/* Right Column: Riwayat Pengajuan Saya */}
        <GlassCard className="space-y-4 border border-white/40 flex flex-col h-full">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10 text-success shadow-inner">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Riwayat Pengajuan Saya</h2>
              <p className="text-xs text-slate-500">
                Pantau status pengajuan pemindahan aset Anda.
              </p>
            </div>
          </div>

          {/* Filter Status Tabs */}
          <div className="space-y-3 pt-1">
            <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl border border-slate-200/40 text-[11px] overflow-x-auto">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setHistoryStatusFilter(status)}
                  className={`flex-1 px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap capitalize text-center ${
                    historyStatusFilter === status
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {status === 'ALL' ? 'Semua' : status === 'PENDING' ? 'Menunggu' : status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}
                </button>
              ))}
            </div>
          </div>

          {/* List of Transfers */}
          <div className="flex-1 overflow-y-auto max-h-[500px] pr-1 space-y-3">
            {myTransfers.isLoading ? (
              <ListSkeleton count={3} />
            ) : filteredTransfers.length === 0 ? (
              <EmptyState
                title="Tidak ada pengajuan"
                description={historyStatusFilter !== 'ALL' ? 'Tidak ada data pengajuan yang cocok dengan filter.' : 'Silakan ajukan perpindahan aset dari form di sebelah kiri.'}
              />
            ) : (
              <div className="space-y-3">
                {filteredTransfers.map((transfer) => (
                  <div key={transfer.id} className="rounded-xl border border-white/50 bg-white/70 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">
                          {transfer.assetName ? `${transfer.assetName}` : `${transfer.assetId}`}
                        </p>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600 border border-slate-200/50 block w-fit mt-1">
                          {transfer.assetKode ?? 'KODE-ASET'}
                        </span>
                        
                        {/* Route display */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold bg-white/70 border border-white/60 rounded-lg px-2 py-1 w-fit mt-2 shadow-inner">
                          <span>{transfer.fromRoomCode}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                          <span>{transfer.toRoomCode}</span>
                        </div>
                      </div>
                      <StatusBadge status={transfer.status} />
                    </div>

                    <p className="mt-3 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 p-2.5 rounded-lg leading-relaxed">
                      {transfer.reason}
                    </p>

                    {transfer.reviewerNotes && (
                      <div className="mt-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10 px-3 py-2 text-xs text-amber-700 font-medium">
                        <span className="font-bold block text-[10px] uppercase text-amber-600">Catatan Admin:</span>
                        {transfer.reviewerNotes}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-medium border-t border-slate-100 pt-2">
                      <span>Dibuat: {new Date(transfer.createdAt).toLocaleDateString('id-ID')}</span>
                      {transfer.reviewedAt && (
                        <span>Ditinjau: {new Date(transfer.reviewedAt).toLocaleDateString('id-ID')}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination UI */}
          <div className="flex items-center justify-between border-t border-slate-200/50 pt-3 mt-4 px-1">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Hal {page} dari {Math.max(1, totalPages)}
            </span>
            <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
              <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200" disabled={page === 1} onClick={() => setPage(1)}>
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
              <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              
              <select 
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="mx-1 h-8 px-1 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none cursor-pointer disabled:opacity-50"
                disabled={totalPages <= 1}
              >
                {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200" disabled={page >= totalPages} onClick={() => setPage(Math.max(1, totalPages))}>
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md relative z-10"
            >
              <GlassCard className="p-6 bg-white shadow-2xl border-white/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                    <ArrowRightLeft className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Konfirmasi Pengajuan</h3>
                    <p className="text-xs text-slate-500 font-medium">Harap periksa kembali detail perpindahan aset Anda.</p>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 text-xs bg-slate-50/50">
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-400 font-semibold">Aset</span>
                    <span className="font-bold text-slate-800 text-right truncate">
                      {selectedAsset?.namaBarang} ({selectedAsset?.kodeBarang})
                    </span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-400 font-semibold">Dari</span>
                    <span className="font-bold text-slate-800">{selectedSourceRoom?.code} - {selectedSourceRoom?.name}</span>
                  </div>
                  <div className="p-3 flex justify-between gap-4">
                    <span className="text-slate-400 font-semibold">Ke</span>
                    <span className="font-bold text-slate-800">{selectedTargetRoom?.code} - {selectedTargetRoom?.name}</span>
                  </div>
                  <div className="p-3">
                    <span className="text-slate-400 font-semibold block mb-1">Alasan Pemindahan</span>
                    <span className="font-medium text-slate-700 italic leading-relaxed block bg-white border border-slate-100 p-2 rounded-lg">
                      "{reason}"
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={createMutation.isPending}>
                    Tidak, Batal
                  </Button>
                  <Button 
                    onClick={() => {
                      createMutation.mutate()
                      setShowConfirm(false)
                    }}
                    disabled={createMutation.isPending}
                    className="gap-2"
                  >
                    {createMutation.isPending ? 'Mengirim...' : 'Ya, Kirim'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
