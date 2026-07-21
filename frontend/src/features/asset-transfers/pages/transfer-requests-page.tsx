/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ShieldAlert, XCircle, Search, ArrowRight, Clock, User, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { fetchAssetTransfers, reviewAssetTransfer } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import type { AssetTransferStatus } from '@/types/api'
import { ListSkeleton } from '@/components/ui/skeleton'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
}

export function TransferRequestsPage() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()
  
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''

  const [statusFilter, setStatusFilter] = useState<AssetTransferStatus | 'ALL'>('PENDING')
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const q = searchParams.get('search') ?? ''
    setSearchQuery(q)
  }, [searchParams])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, searchQuery])
  const [notesById, setNotesById] = useState<Record<string, string>>({})
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  // Fetch all transfers to calculate statistics counter badges
  const allTransfers = useQuery({
    queryKey: ['asset-transfers', 'admin', 'all-stats'],
    queryFn: () => fetchAssetTransfers(token, { limit: 1000 }),
  })

  // Fetch filtered list
  const transfers = useQuery({
    queryKey: ['asset-transfers', 'admin', statusFilter, page, searchQuery],
    queryFn: () => fetchAssetTransfers(token, {
      status: statusFilter === 'ALL' ? undefined : statusFilter,
      limit: 2,
      page,
      search: searchQuery || undefined,
    }),
  })

  const reviewMutation = useMutation({
    mutationFn: (params: { id: string; decision: 'APPROVED' | 'REJECTED'; notes?: string }) =>
      reviewAssetTransfer(token, params.id, { decision: params.decision, notes: params.notes }),
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
  })

  // Calculate statistics counters
  const stats = useMemo(() => {
    const list = allTransfers.data?.data ?? []
    return {
      pending: list.filter((t) => t.status === 'PENDING').length,
      approved: list.filter((t) => t.status === 'APPROVED').length,
      rejected: list.filter((t) => t.status === 'REJECTED').length,
      total: list.length,
    }
  }, [allTransfers.data?.data])

  const items = transfers.data?.data ?? []
  const meta = transfers.data?.meta
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {reviewMutation.isPending && (
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
              className="text-xl font-bold bg-gradient-to-r from-[#F9D141] to-[#dbb31a] bg-clip-text text-transparent"
            >
              Memproses Persetujuan...
            </motion.p>
            <p className="text-sm font-medium text-gray-500 mt-2">Mohon tunggu, keputusan Anda sedang disimpan ke server.</p>
          </motion.div>
        )}
      </AnimatePresence>
      <PageHeader
        title="Persetujuan Transfer Aset"
        description="Tinjau pengajuan perpindahan aset. Jika disetujui, sistem otomatis memindahkan lokasi aset di database."
      />

      {/* Admin Statistics Row */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <GlassCard className="p-5 flex items-center gap-4 border border-white/40">
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menunggu Review</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {allTransfers.isLoading ? '...' : stats.pending}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4 border border-white/40">
          <div className="p-3.5 rounded-xl bg-green-500/10 text-green-500 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telah Disetujui</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {allTransfers.isLoading ? '...' : stats.approved}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4 border border-white/40">
          <div className="p-3.5 rounded-xl bg-red-500/10 text-red-500 shadow-inner">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Telah Ditolak</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {allTransfers.isLoading ? '...' : stats.rejected}
            </p>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="space-y-6 border border-white/40">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-danger/10 text-danger shadow-inner">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Daftar Pengajuan</h2>
              <p className="text-xs text-slate-500">
                Tinjau, setujui, atau tolak pemindahan inventaris ruangan.
              </p>
            </div>
          </div>

          {/* Search bar and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search query input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari aset, pemohon, ruangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/60 bg-white/70 text-xs shadow-sm outline-none transition focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 font-medium text-slate-800"
              />
            </div>

            {/* Filter Tabs instead of dropdown */}
            <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl border border-slate-200/40 text-[11px] overflow-x-auto">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((tab) => {
                const count = tab === 'ALL' ? stats.total : tab === 'PENDING' ? stats.pending : tab === 'APPROVED' ? stats.approved : stats.rejected
                return (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      statusFilter === tab
                        ? 'bg-white text-slate-800 shadow-sm'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <span>
                      {tab === 'PENDING' ? 'Menunggu' : tab === 'APPROVED' ? 'Disetujui' : tab === 'REJECTED' ? 'Ditolak' : 'Semua'}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold ${
                      statusFilter === tab
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-slate-300/30 text-slate-500'
                    }`}>
                      {allTransfers.isLoading ? '...' : count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* List items */}
        {transfers.isLoading ? (
          <ListSkeleton count={4} />
        ) : items.length === 0 ? (
          <EmptyState
            title="Tidak ada pengajuan"
            description={searchQuery ? 'Tidak ada data pengajuan yang cocok dengan pencarian Anda.' : 'Belum ada data yang cocok dengan filter saat ini.'}
          />
        ) : (
          <motion.div 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <AnimatePresence mode="popLayout">
              {items.map((transfer) => {
                const notes = notesById[transfer.id] ?? transfer.reviewerNotes ?? ''
                const isPending = transfer.status === 'PENDING'
                const isBusy = (approvingId === transfer.id || rejectingId === transfer.id) && reviewMutation.isPending

                return (
                  <motion.div 
                    key={transfer.id} 
                    variants={itemVariants}
                    layoutId={transfer.id}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-xl border border-white/50 bg-white/70 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      {/* Left: Request details */}
                      <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <p className="font-bold text-slate-800 text-base">
                            {transfer.assetName ? `${transfer.assetName}` : `${transfer.assetId}`}
                          </p>
                          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-extrabold text-slate-600">
                            {transfer.assetKode ?? 'KODE'}
                          </span>
                          <StatusBadge status={transfer.status} />
                        </div>

                        {/* Route diagram */}
                        <div className="flex items-center gap-2 text-sm font-bold bg-white/70 border border-white/80 rounded-xl px-3 py-1.5 w-fit shadow-inner">
                          <span className="text-slate-700">{transfer.fromRoomCode}</span>
                          <ArrowRight className="w-4 h-4 text-[#d9a416]" />
                          <span className="text-slate-800">{transfer.toRoomCode}</span>
                        </div>

                        {/* Data grid */}
                        <div className="grid gap-3 text-xs text-slate-500 font-medium md:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-slate-100 text-slate-500"><User className="w-3.5 h-3.5" /></span>
                            <span className="text-slate-400 font-semibold">Pemohon:</span>{' '}
                            <span className="font-bold text-slate-700">{transfer.requesterName ?? transfer.requesterId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-md bg-slate-100 text-slate-500"><Clock className="w-3.5 h-3.5" /></span>
                            <span className="text-slate-400 font-semibold">Dibuat:</span>{' '}
                            <span className="font-bold text-slate-700">{new Date(transfer.createdAt).toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="p-1 rounded-md bg-slate-100 text-slate-500 mt-0.5">📍</span>
                            <div className="min-w-0 flex-1 leading-snug">
                              <span className="text-slate-400 font-semibold block">Dari Ruangan:</span>
                              <span className="font-bold text-slate-700 block truncate">{transfer.fromRoomCode} - {transfer.fromRoomName}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="p-1 rounded-md bg-slate-100 text-slate-500 mt-0.5">🏁</span>
                            <div className="min-w-0 flex-1 leading-snug">
                              <span className="text-slate-400 font-semibold block">Ke Ruangan:</span>
                              <span className="font-bold text-slate-700 block truncate">{transfer.toRoomCode} - {transfer.toRoomName}</span>
                            </div>
                          </div>
                        </div>

                        {/* Reason bubble */}
                        <div className="rounded-xl bg-slate-50 border border-slate-100/80 px-3.5 py-3 text-xs text-slate-600 leading-relaxed font-semibold italic">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider not-italic block mb-1">Alasan Pemindahan:</span>
                          "{transfer.reason}"
                        </div>

                        {/* Approved/Rejected decision summary */}
                        {!isPending && (
                          <div className="rounded-xl border border-white bg-white/70 p-3.5 text-xs">
                            <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Keputusan Admin</p>
                            <p className="mt-1 text-slate-500 font-semibold flex items-center gap-1.5">
                              <span>👤</span>
                              {transfer.reviewedByName ? `Ditinjau oleh ${transfer.reviewedByName}` : 'Ditinjau oleh admin'}
                              {transfer.reviewedAt && (
                                <>
                                  <span>•</span>
                                  <span>📅 {new Date(transfer.reviewedAt).toLocaleString('id-ID')}</span>
                                </>
                              )}
                            </p>
                            {transfer.reviewerNotes && (
                              <div className="mt-2 p-2.5 rounded-lg bg-slate-100/50 border border-slate-200/40 text-slate-600 font-semibold">
                                <span className="font-bold block text-[10px] uppercase text-slate-500">Catatan:</span>
                                {transfer.reviewerNotes}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right: Review action panel (only for pending) */}
                      {isPending && (
                        <div className="min-w-0 flex-1 space-y-3 lg:max-w-xs xl:max-w-md bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Catatan Review
                            <textarea
                              className="mt-2 min-h-[100px] w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2 text-xs shadow-inner outline-none transition placeholder:text-slate-400 focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 font-medium text-slate-800"
                              placeholder="Tulis alasan jika menolak, atau catatan tambahan jika disetujui..."
                              value={notes}
                              onChange={(e) => setNotesById((prev) => ({ ...prev, [transfer.id]: e.target.value }))}
                            />
                          </label>

                          <div className="flex gap-2">
                            <Button
                              className="flex-1 gap-1.5"
                              disabled={isBusy}
                              onClick={() => setApprovingId(transfer.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              {isBusy ? 'Memproses...' : 'Setujui'}
                            </Button>
                            <Button
                              variant="danger"
                              className="flex-1 gap-1.5"
                              disabled={isBusy}
                              onClick={() => setRejectingId(transfer.id)}
                            >
                              <XCircle className="h-4 w-4" />
                              {isBusy ? 'Memproses...' : 'Tolak'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/20 pt-4 mt-6">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Menampilkan halaman {page} dari {totalPages}
            </span>
            <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="secondary"
                size="sm"
                className="px-2"
                disabled={page === 1}
                onClick={() => setPage(1)}
                title="Halaman Pertama"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="px-2"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                title="Sebelumnya"
              >
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

              <Button
                variant="secondary"
                size="sm"
                className="px-2"
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                title="Selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="px-2"
                disabled={page === totalPages}
                onClick={() => setPage(totalPages)}
                title="Halaman Terakhir"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {user?.role !== 'ADMIN' && (
        <p className="text-xs text-slate-400 font-semibold">
          Halaman ini khusus untuk administrator. Akses normal tersedia di menu Pengajuan Transfer.
        </p>
      )}

      {/* Approve Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!approvingId}
        onClose={() => setApprovingId(null)}
        onConfirm={() => {
          if (approvingId) {
            reviewMutation.mutate({ 
              id: approvingId, 
              decision: 'APPROVED', 
              notes: notesById[approvingId]?.trim() || undefined 
            })
            setApprovingId(null)
          }
        }}
        isLoading={reviewMutation.isPending}
        title="Setujui Pemindahan Aset"
        description="Apakah Anda yakin ingin menyetujui pemindahan aset ini? Lokasi aset akan otomatis diperbarui di sistem."
        icon={<CheckCircle2 className="h-6 w-6" />}
        iconBgClass="bg-emerald-50 text-emerald-500"
        confirmText="Ya, Setujui"
        confirmClass="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
        loadingText="Menyetujui..."
      />

      {/* Reject Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!rejectingId}
        onClose={() => setRejectingId(null)}
        onConfirm={() => {
          if (rejectingId) {
            reviewMutation.mutate({ 
              id: rejectingId, 
              decision: 'REJECTED', 
              notes: notesById[rejectingId]?.trim() || undefined 
            })
            setRejectingId(null)
          }
        }}
        isLoading={reviewMutation.isPending}
        title="Tolak Pemindahan Aset"
        description="Apakah Anda yakin ingin menolak pengajuan pemindahan aset ini?"
        icon={<XCircle className="h-6 w-6" />}
        iconBgClass="bg-rose-50 text-rose-500"
        confirmText="Ya, Tolak"
        confirmClass="flex-1 bg-rose-600 hover:bg-rose-700 text-white"
        loadingText="Menolak..."
      />
    </div>
  )
}
