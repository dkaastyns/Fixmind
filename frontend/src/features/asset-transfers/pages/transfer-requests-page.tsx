import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Filter, ShieldAlert, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
import { fetchAssetTransfers, reviewAssetTransfer } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import type { AssetTransferStatus } from '@/types/api'

export function TransferRequestsPage() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<AssetTransferStatus | 'ALL'>('PENDING')
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const [pendingReviewId, setPendingReviewId] = useState<string | null>(null)

  const transfers = useQuery({
    queryKey: ['asset-transfers', 'admin', statusFilter],
    queryFn: () => fetchAssetTransfers(token, {
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      limit: 100,
    }),
  })

  const reviewMutation = useMutation({
    mutationFn: (params: { id: string; decision: 'APPROVED' | 'REJECTED'; notes?: string }) =>
      reviewAssetTransfer(token, params.id, { decision: params.decision, notes: params.notes }),
    onMutate: (variables) => {
      setPendingReviewId(variables.id)
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['asset-transfers'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
      toast.success(variables.decision === 'APPROVED' ? 'Transfer disetujui' : 'Transfer ditolak')
      setNotesById((prev) => {
        const next = { ...prev }
        delete next[variables.id]
        return next
      })
    },
    onError: (error: Error) => toast.error(error.message),
    onSettled: () => {
      setPendingReviewId(null)
    },
  })

  const items = transfers.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approval Transfer Aset"
        description="Tinjau pengajuan perpindahan aset. Jika disetujui, sistem otomatis memindahkan lokasi aset di database."
        action={(
          <div className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/60 px-3 py-2 text-sm text-muted shadow-sm">
            <Filter className="h-4 w-4" />
            <select
              className="bg-transparent text-sm outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AssetTransferStatus | 'ALL')}
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">Semua</option>
            </select>
          </div>
        )}
      />

      <GlassCard className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/10 text-danger">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Daftar Pengajuan</h2>
            <p className="text-sm text-muted">
              Admin dapat menyetujui atau menolak pengajuan langsung dari sini.
            </p>
          </div>
        </div>

        {transfers.isLoading ? (
          <p className="text-sm text-muted">Memuat pengajuan transfer...</p>
        ) : items.length === 0 ? (
          <EmptyState
            title="Tidak ada pengajuan"
            description="Belum ada data yang cocok dengan filter saat ini."
          />
        ) : (
          <div className="space-y-4">
            {items.map((transfer) => {
              const notes = notesById[transfer.id] ?? transfer.reviewerNotes ?? ''
              const isPending = transfer.status === 'PENDING'
              const isBusy = pendingReviewId === transfer.id && reviewMutation.isPending

              return (
                <div key={transfer.id} className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-semibold text-foreground">
                          {transfer.assetKode ?? transfer.assetId}
                          {transfer.assetName ? ` - ${transfer.assetName}` : ''}
                        </p>
                        <StatusBadge status={transfer.status} />
                      </div>

                      <div className="grid gap-2 text-sm text-muted md:grid-cols-2">
                        <p>
                          <span className="font-medium text-foreground">Dari:</span>{' '}
                          {transfer.fromRoomCode ?? transfer.fromRoomId}
                          {transfer.fromRoomName ? ` - ${transfer.fromRoomName}` : ''}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Ke:</span>{' '}
                          {transfer.toRoomCode ?? transfer.toRoomId}
                          {transfer.toRoomName ? ` - ${transfer.toRoomName}` : ''}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Pemohon:</span>{' '}
                          {transfer.requesterName ?? transfer.requesterId}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Dibuat:</span>{' '}
                          {new Date(transfer.createdAt).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-black/5 px-3 py-3 text-sm text-muted">
                        {transfer.reason}
                      </div>

                      {!isPending && (
                        <div className="rounded-2xl border border-white/30 bg-white/70 px-3 py-3 text-sm">
                          <p className="font-medium text-foreground">Keputusan admin</p>
                          <p className="mt-1 text-muted">
                            {transfer.reviewedByName ? `Oleh ${transfer.reviewedByName}` : 'Oleh admin'}
                            {transfer.reviewedAt ? ` · ${new Date(transfer.reviewedAt).toLocaleString('id-ID')}` : ''}
                          </p>
                          {transfer.reviewerNotes && (
                            <p className="mt-2 text-muted">Catatan: {transfer.reviewerNotes}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {isPending && (
                      <div className="min-w-0 flex-1 space-y-3 lg:max-w-md">
                        <label className="block text-sm font-medium text-foreground">
                          Catatan review
                          <textarea
                            className="mt-2 min-h-[120px] w-full rounded-xl border border-white/60 bg-white/80 px-3 py-2.5 text-sm shadow-sm outline-none transition placeholder:text-muted focus:border-[#ef629f] focus:ring-2 focus:ring-[#ef629f]/20"
                            placeholder="Opsional untuk approval, disarankan untuk penolakan"
                            value={notes}
                            onChange={(e) => setNotesById((prev) => ({ ...prev, [transfer.id]: e.target.value }))}
                          />
                        </label>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            className="gap-2"
                            disabled={isBusy}
                            onClick={() => reviewMutation.mutate({ id: transfer.id, decision: 'APPROVED', notes: notes.trim() || undefined })}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Setuju
                          </Button>
                          <Button
                            variant="danger"
                            className="gap-2"
                            disabled={isBusy}
                            onClick={() => reviewMutation.mutate({ id: transfer.id, decision: 'REJECTED', notes: notes.trim() || undefined })}
                          >
                            <XCircle className="h-4 w-4" />
                            Tolak
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </GlassCard>

      {user?.role !== 'ADMIN' && (
        <p className="text-xs text-muted">
          Halaman ini khusus admin. Akses normal tersedia di menu Pengajuan Transfer.
        </p>
      )}
    </div>
  )
}
