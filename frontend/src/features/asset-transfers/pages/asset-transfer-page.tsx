import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRightLeft, Send, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
import { ListSkeleton } from '@/components/ui/skeleton'
import {
  createAssetTransfer,
  fetchAssetTransfers,
  fetchAssets,
  fetchRooms,
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

  const rooms = useQuery({
    queryKey: ['asset-transfer-rooms'],
    queryFn: () => fetchRooms(token, true),
  })

  const assets = useQuery({
    queryKey: ['asset-transfer-assets', roomId],
    queryFn: () => fetchAssets(token, { roomId, limit: 100 }),
    enabled: Boolean(roomId),
  })

  const myTransfers = useQuery({
    queryKey: ['asset-transfers', 'mine'],
    queryFn: () => fetchAssetTransfers(token, { mineOnly: true, limit: 100 }),
  })

  const selectedAsset = useMemo(
    () => assets.data?.data.find((asset) => asset.id === assetId),
    [assets.data?.data, assetId],
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

  const canSubmit = Boolean(roomId && assetId && toRoomId && reason.trim().length >= 10)

  useEffect(() => {
    const paramRoom = searchParams.get('roomId') ?? ''
    const paramAsset = searchParams.get('assetId') ?? ''
    if (paramRoom && paramRoom !== roomId) setRoomId(paramRoom)
    if (paramAsset && paramAsset !== assetId) setAssetId(paramAsset)
  }, [assetId, roomId, searchParams])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengajuan Pemindahan Aset"
        description="Ajukan perpindahan aset antar ruangan, lalu admin akan meninjau dan mengubah lokasi aset jika disetujui."
      />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="space-y-5">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ef629f]/10 text-[#ef629f]">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Form Pengajuan</h2>
              <p className="text-sm text-muted">
                Pilih ruangan asal, aset, ruangan tujuan, lalu jelaskan alasan perpindahannya.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              Ruangan Asal
              <select
                className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#ef629f] focus:ring-2 focus:ring-[#ef629f]/20"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value)
                  setAssetId('')
                  setToRoomId('')
                }}
              >
                <option value="">Pilih ruangan</option>
                {(rooms.data?.data ?? []).map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.code} - {room.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-medium">
              Aset
              <select
                className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#ef629f] focus:ring-2 focus:ring-[#ef629f]/20 disabled:opacity-60"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                disabled={!roomId || assets.isLoading}
              >
                <option value="">{roomId ? 'Pilih aset' : 'Pilih ruangan dulu'}</option>
                {(assets.data?.data ?? []).map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.kodeBarang} - {asset.namaBarang}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {selectedAsset && (
            <div className="rounded-2xl border border-white/40 bg-white/60 p-4 text-sm">
              <p className="font-medium text-foreground">Aset terpilih</p>
              <p className="mt-1 text-muted">
                {selectedAsset.kodeBarang} - {selectedAsset.namaBarang}
              </p>
              <p className="text-xs text-muted/80">
                Saat ini berada di {selectedAsset.roomCode ?? selectedAsset.roomId}
                {selectedAsset.roomName ? ` - ${selectedAsset.roomName}` : ''}
              </p>
            </div>
          )}

          <label className="space-y-2 text-sm font-medium block">
            Ruangan Tujuan
            <select
              className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm shadow-sm outline-none transition focus:border-[#ef629f] focus:ring-2 focus:ring-[#ef629f]/20 disabled:opacity-60"
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
          </label>

          <label className="space-y-2 text-sm font-medium block">
            Alasan Pemindahan
            <textarea
              className="min-h-[140px] w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-muted focus:border-[#ef629f] focus:ring-2 focus:ring-[#ef629f]/20"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: aset dipindahkan karena penempatan ruang kerja tim berubah dan perlu dekat dengan unit terkait."
              maxLength={1000}
            />
            <p className="text-xs text-muted">Minimal 10 karakter. Semakin jelas alasannya, semakin mudah admin memutuskan.</p>
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => createMutation.mutate()}
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

        <GlassCard className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10 text-success">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Riwayat Pengajuan Saya</h2>
              <p className="text-sm text-muted">
                Pantau status pengajuan yang sedang menunggu, disetujui, atau ditolak.
              </p>
            </div>
          </div>

          {myTransfers.isLoading ? (
            <ListSkeleton count={3} />
          ) : (myTransfers.data?.data ?? []).length === 0 ? (
            <EmptyState
              title="Belum ada pengajuan"
              description="Silakan ajukan perpindahan aset dari form di sebelah kiri."
            />
          ) : (
            <div className="space-y-3">
              {myTransfers.data?.data.map((transfer) => (
                <div key={transfer.id} className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {transfer.assetKode ?? transfer.assetId}
                        {transfer.assetName ? ` - ${transfer.assetName}` : ''}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {transfer.fromRoomCode ?? transfer.fromRoomId}
                        {transfer.fromRoomName ? ` - ${transfer.fromRoomName}` : ''}
                        {' '}→{' '}
                        {transfer.toRoomCode ?? transfer.toRoomId}
                        {transfer.toRoomName ? ` - ${transfer.toRoomName}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={transfer.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted">{transfer.reason}</p>
                  {transfer.reviewerNotes && (
                    <p className="mt-2 rounded-xl bg-black/5 px-3 py-2 text-xs text-muted">
                      Catatan admin: {transfer.reviewerNotes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      {user?.role === 'ADMIN' && (
        <p className="text-xs text-muted">
          Akun admin juga dapat membuka menu Approval Transfer untuk meninjau semua pengajuan.
        </p>
      )}
    </div>
  )
}
