import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { MessageCircle, Reply, Send, ZoomIn, Loader2, Bot, CheckCircle2, ChevronDown, Save, Sparkles, Clock, GitBranch } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { PageHeader, StatusBadge } from '@/components/ui/feedback'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import {
  addComment,
  fetchComments,
  fetchReport,
  updateReportStatus,
} from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

// Status options available for admin
const ADMIN_STATUS_OPTIONS = [
  { value: 'PENDING',      label: 'Menunggu',       color: 'text-yellow-600' },
  { value: 'REVIEWED',     label: 'Ditinjau',        color: 'text-blue-600' },
  { value: 'IN_PROGRESS',  label: 'Sedang Dikerjakan', color: 'text-indigo-600' },
  { value: 'COMPLETED',    label: 'Selesai',         color: 'text-green-600' },
  { value: 'CANCELLED',    label: 'Dibatalkan',      color: 'text-gray-500' },
  { value: 'REJECTED',     label: 'Ditolak',         color: 'text-danger' },
] as const

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
}

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)

  const { data, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => fetchReport(token, id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state?.data?.data?.aiAnalysisStatus;
      return status === 'PENDING' || status === 'PROCESSING' ? 3000 : false;
    }
  })

  const qc = useQueryClient()
  const report = data?.data
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-40 rounded-lg bg-white/40" />
      <div className="h-8 w-2/3 rounded-xl bg-white/40" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 h-64 rounded-2xl bg-white/40" />
        <div className="h-48 rounded-2xl bg-white/40" />
      </div>
    </div>
  )
  if (!report) return <p className="text-danger">Laporan tidak ditemukan</p>

  const lightboxImages = (report.attachments ?? []).map((a) => ({ id: a.id, url: a.url, label: a.type }))

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {lightboxIndex !== null && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
      <motion.div variants={itemVariants}>
        <Breadcrumb items={[
          { label: 'Laporan Masalah', to: '/dashboard/reports' },
          { label: `Detail: ${report.title.slice(0, 20)}${report.title.length > 20 ? '...' : ''}` }
        ]} />
      </motion.div>

      <motion.div variants={itemVariants}>
        <PageHeader title={report.title} description={`${report.roomCode} — ${report.roomName}`} />
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-3">
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlassCard className="space-y-4 h-full">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={report.status} />
              {report.priority && <StatusBadge status={report.priority} />}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{report.description}</p>
            <div className="grid gap-2.5 text-sm text-muted sm:grid-cols-2 border-t border-white/20 pt-3">
              <p>Pelapor: <span className="text-foreground font-medium">{report.reporterName}</span></p>
              <p>Dibuat: <span className="text-foreground font-medium">{new Date(report.createdAt).toLocaleString('id-ID')}</span></p>
              {report.assetName && <p>Aset: <span className="text-foreground font-medium">{report.assetName}</span></p>}
              {report.targetCompletionDate && (
                <p>Target Selesai: <span className="text-foreground font-medium">{new Date(report.targetCompletionDate).toLocaleDateString('id-ID')}</span></p>
              )}
            </div>

            {report.adminNotes && (
              <div className="mt-4 rounded-xl border border-[#F9D141]/20 bg-[#F9D141]/5 p-4 shadow-inner">
                <h3 className="font-medium text-[#d9a416] mb-1 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="h-4 w-4" /> Instruksi Admin
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{report.adminNotes}</p>
              </div>
            )}

            {/* AI Analysis status */}
            {report.aiAnalysisStatus === 'PENDING' || report.aiAnalysisStatus === 'PROCESSING' ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#F9D141]/20 bg-gradient-to-r from-[#F9D141]/5 to-amber-500/5 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
                    <Bot className="h-5 w-5 animate-pulse" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#d9a416]">AI sedang menganalisis laporan...</p>
                    <p className="text-xs text-muted mt-0.5">Menentukan prioritas dan rekomendasi perbaikan</p>
                  </div>
                  <Loader2 className="ml-auto h-4 w-4 animate-spin text-[#d9a416]/60" />
                </div>
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#F9D141]/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#F9D141] to-amber-500"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '60%' }}
                  />
                </div>
              </motion.div>
            ) : report.aiAnalysisStatus === 'COMPLETED' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl bg-gradient-to-br from-amber-500/5 via-white/40 to-transparent border border-amber-500/20 p-5 shadow-[0_0_15px_rgba(217,164,22,0.08)] hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(217,164,22,0.12)] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3 border-b border-white/20 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 shadow-inner">
                      <Sparkles className="h-4.5 w-4.5 animate-pulse" />
                    </div>
                    <h3 className="font-semibold text-foreground flex items-center gap-1.5">
                      Analisis AI
                      <HelpTooltip text="Prioritas dan saran perbaikan dihasilkan otomatis oleh kecerdasan buatan (AI) berdasarkan riwayat dan kategori laporan." />
                    </h3>
                  </div>
                  <div className="rounded-full bg-amber-500/15 border border-amber-500/25 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    Smart Engine
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed font-medium mb-2">{report.aiPriorityReason}</p>
                <p className="text-sm text-foreground/80 leading-relaxed"><strong className="text-amber-700 font-semibold">Rekomendasi:</strong> {report.aiRecommendation}</p>

                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/40 bg-white/20 p-2.5 text-center shadow-sm">
                    <span className="block text-[10px] uppercase tracking-wider text-muted font-medium">Estimasi Kerja</span>
                    <span className="mt-0.5 block text-sm font-semibold text-foreground">{report.aiEstimatedRepairHours} Jam</span>
                  </div>
                  <div className="rounded-xl border border-white/40 bg-white/20 p-2.5 text-center shadow-sm">
                    <span className="block text-[10px] uppercase tracking-wider text-muted font-medium">Tindakan</span>
                    <span className="mt-0.5 block text-sm font-semibold text-foreground truncate px-1">{report.aiSuggestedAction}</span>
                  </div>
                  <div className="rounded-xl border border-amber-500/10 bg-amber-500/5 p-2.5 text-center shadow-sm">
                    <span className="block text-[10px] uppercase tracking-wider text-amber-700/80 font-medium">Target AI</span>
                    <span className="mt-0.5 block text-sm font-semibold text-amber-700">
                      {report.aiSuggestedTargetDate ? new Date(report.aiSuggestedTargetDate).toLocaleDateString('id-ID') : '—'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : null}

            {report.attachments && report.attachments.length > 0 && (
              <div className="mt-4 border-t border-white/20 pt-4">
                <h3 className="font-medium text-sm text-muted mb-3">Foto Bukti ({report.attachments.length})</h3>
                <div className="flex flex-wrap gap-3">
                  {report.attachments.map((a, i) => (
                    <button
                      key={a.id}
                      onClick={() => setLightboxIndex(i)}
                      className="group relative overflow-hidden rounded-xl border border-white/30 shadow-sm transition-all hover:scale-105 hover:shadow-lg hover:border-amber-500/50"
                      title="Klik untuk memperbesar"
                    >
                      <img src={a.url} alt={a.type} className="h-28 w-28 object-cover" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors">
                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 text-center">
                        <span className="text-[10px] font-medium text-white uppercase tracking-wider">{a.type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <div className="space-y-4">
          {user?.isAdmin && (
            <motion.div variants={itemVariants}>
              <AdminActionPanel
                token={token}
                reportId={report.id}
                currentStatus={report.status}
                onSuccess={() => {
                  qc.invalidateQueries({ queryKey: ['report', id] })
                }}
              />
            </motion.div>
          )}

          {report.histories && report.histories.length > 0 && (
            <motion.div variants={itemVariants}>
              <GlassCard className="overflow-hidden !p-0">
                {/* Timeline header */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/20 bg-gradient-to-r from-white/30 to-transparent">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                    <GitBranch className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Linimasa</h3>
                  <span className="ml-auto text-[10px] font-semibold text-muted bg-white/40 rounded-full px-2 py-0.5 border border-white/30">
                    {report.histories.length} entri
                  </span>
                </div>

                {/* Timeline body */}
                <div className="px-4 py-3 space-y-0">
                  {report.histories.map((h, i) => {
                    const actionMap: Record<string, { label: string; icon: string }> = {
                      CREATED:        { label: 'Laporan Dibuat',     icon: '📋' },
                      AI_ANALYZED:    { label: 'Dianalisis AI',      icon: '🤖' },
                      ASSIGNED:       { label: 'Ditugaskan',         icon: '👤' },
                      STATUS_UPDATED: { label: 'Status Diperbarui',  icon: '🔄' },
                      STATUS_CHANGED: { label: 'Status Diperbarui',  icon: '🔄' },
                    }

                    const statusLabelMap: Record<string, string> = {
                      PENDING:     'Menunggu',
                      AI_ANALYSIS: 'Analisis AI',
                      REVIEWED:    'Ditinjau',
                      ASSIGNED:    'Ditugaskan',
                      IN_PROGRESS: 'Sedang Dikerjakan',
                      COMPLETED:   'Selesai',
                      CANCELLED:   'Dibatalkan',
                      REJECTED:    'Ditolak',
                    }

                    // Status color config for new status pill
                    const statusPillConfig: Record<string, { bg: string; text: string; border: string }> = {
                      PENDING:     { bg: 'bg-yellow-50',  text: 'text-yellow-700',  border: 'border-yellow-200' },
                      AI_ANALYSIS: { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
                      REVIEWED:    { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
                      ASSIGNED:    { bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200' },
                      IN_PROGRESS: { bg: 'bg-indigo-50',  text: 'text-indigo-700',  border: 'border-indigo-200' },
                      COMPLETED:   { bg: 'bg-green-50',   text: 'text-green-700',   border: 'border-green-200' },
                      CANCELLED:   { bg: 'bg-gray-50',    text: 'text-gray-600',    border: 'border-gray-200' },
                      REJECTED:    { bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
                    }

                    // Dot color config
                    const dotColorMap: Record<string, { bg: string; ring: string }> = {
                      PENDING:     { bg: 'bg-yellow-500', ring: 'bg-yellow-300' },
                      AI_ANALYSIS: { bg: 'bg-amber-500',  ring: 'bg-amber-300' },
                      REVIEWED:    { bg: 'bg-blue-500',   ring: 'bg-blue-300' },
                      ASSIGNED:    { bg: 'bg-purple-500', ring: 'bg-purple-300' },
                      IN_PROGRESS: { bg: 'bg-indigo-500', ring: 'bg-indigo-300' },
                      COMPLETED:   { bg: 'bg-green-500',  ring: 'bg-green-300' },
                      CANCELLED:   { bg: 'bg-gray-400',   ring: 'bg-gray-200' },
                      REJECTED:    { bg: 'bg-red-500',    ring: 'bg-red-300' },
                    }

                    const isStatusChange = h.action === 'STATUS_CHANGED' || h.action === 'STATUS_UPDATED'
                    const oldLabel = h.oldStatus ? (statusLabelMap[h.oldStatus] ?? h.oldStatus) : null
                    const newLabel = h.newStatus ? (statusLabelMap[h.newStatus] ?? h.newStatus) : null
                    const oldPill = h.oldStatus ? statusPillConfig[h.oldStatus] : null
                    const newPill = h.newStatus ? statusPillConfig[h.newStatus] : null

                    const activeStatus = h.newStatus ?? (h.action === 'CREATED' ? 'PENDING' : h.action === 'AI_ANALYZED' ? 'AI_ANALYSIS' : 'PENDING')
                    const dotColors = dotColorMap[activeStatus] ?? { bg: 'bg-amber-500', ring: 'bg-amber-300' }
                    const actionInfo = actionMap[h.action] ?? { label: h.action.replace(/_/g, ' ').toLowerCase(), icon: '📌' }

                    const isLast = i === report.histories!.length - 1

                    return (
                      <motion.div
                        key={h.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06, type: 'spring' as const, stiffness: 220, damping: 22 }}
                        className="relative flex gap-3"
                      >
                        {/* Vertical line + dot */}
                        <div className="relative flex flex-col items-center">
                          {/* Dot */}
                          <div className={`relative z-10 mt-1 flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center rounded-full ${dotColors.bg} shadow-sm ring-2 ring-white`}>
                            <span className="h-[6px] w-[6px] rounded-full bg-white/80" />
                            {/* Only ping on last (latest) item */}
                            {isLast && (
                              <span className={`absolute inline-flex h-full w-full rounded-full ${dotColors.ring} opacity-60 animate-ping`} />
                            )}
                          </div>
                          {/* Connector line */}
                          {!isLast && (
                            <div className="mt-1 w-[2px] flex-1 rounded-full bg-gradient-to-b from-white/60 to-gray-200/80" style={{ minHeight: '32px' }} />
                          )}
                        </div>

                        {/* Content */}
                        <div className={`min-w-0 flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
                          <div className="flex items-start justify-between gap-2 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-sm leading-none">{actionInfo.icon}</span>
                              <span className="text-[13px] font-semibold text-foreground truncate">{actionInfo.label}</span>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-1 text-[10px] text-muted font-medium">
                              <Clock className="h-2.5 w-2.5" />
                              <span className="whitespace-nowrap">
                                {new Date(h.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>

                          {/* Status transition pills */}
                          {isStatusChange && oldLabel && newLabel && oldPill && newPill && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1">
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${oldPill.bg} ${oldPill.text} ${oldPill.border}`}>
                                {oldLabel}
                              </span>
                              <span className="text-muted text-[10px]">→</span>
                              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${newPill.bg} ${newPill.text} ${newPill.border}`}>
                                {newLabel}
                              </span>
                            </div>
                          )}

                          {/* Note callout */}
                          {h.note && (
                            <div className="mt-1.5 rounded-lg border border-amber-200/60 bg-amber-50/60 px-2.5 py-1.5">
                              <p className="text-[11px] text-amber-800/80 italic leading-snug">"{h.note}"</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <motion.div variants={itemVariants}>
        <CommentSection token={token} reportId={id!} />
      </motion.div>
    </motion.div>
  )
}

function AdminActionPanel({
  token,
  reportId,
  currentStatus,
  onSuccess,
}: {
  token: string
  reportId: string
  currentStatus: string
  onSuccess: () => void
}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [note, setNote] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      updateReportStatus(token, reportId, {
        status: selectedStatus,
        note: note.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Status laporan berhasil diperbarui')
      setNote('')
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const isDirty = selectedStatus !== currentStatus || note.trim() !== ''

  return (
    <GlassCard className="space-y-4">
      <h3 className="font-medium">Aksi Admin</h3>

      {/* Current status info */}
      <div className="flex items-center gap-2 rounded-xl bg-white/40 px-3 py-2 text-sm">
        <span className="text-muted">Status saat ini:</span>
        <StatusBadge status={currentStatus} />
      </div>

      {/* Status selector */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">
          Ubah status ke
        </label>
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full appearance-none rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 pr-8 text-sm font-medium focus:border-[#F9D141]/50 focus:outline-none focus:ring-4 focus:ring-[#F9D141]/10 transition-all"
            disabled={mutation.isPending}
          >
            {ADMIN_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        </div>
      </div>

      {/* Note / catatan */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">
          Catatan (opsional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Tambahkan catatan progres untuk teknisi atau pelapor..."
          className="w-full resize-none rounded-xl border border-white/30 bg-white/50 px-3 py-2.5 text-sm focus:border-[#F9D141]/50 focus:outline-none focus:ring-4 focus:ring-[#F9D141]/10 transition-all"
          disabled={mutation.isPending}
        />
      </div>

      <motion.div whileHover={{ scale: !isDirty || mutation.isPending ? 1 : 1.01 }} whileTap={{ scale: !isDirty || mutation.isPending ? 1 : 0.98 }}>
        <Button
          className="w-full gap-2 transition-all duration-300"
          onClick={() => mutation.mutate()}
          disabled={!isDirty || mutation.isPending}
        >
          {mutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...</>
          ) : (
            <><Save className="h-4 w-4" /> Simpan Perubahan</>
          )}
        </Button>
      </motion.div>
    </GlassCard>
  )
}

function CommentSection({ token, reportId }: { token: string; reportId: string }) {
  const qc = useQueryClient()
  const [newComment, setNewComment] = useState('')
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  const { data: commentsData, isLoading } = useQuery({
    queryKey: ['comments', reportId],
    queryFn: () => fetchComments(token, reportId),
  })

  const comments = commentsData?.data ?? []

  // Extract all unique participant names for highlighting
  const participantNames = Array.from(new Set(comments.map((c) => c.authorName)))

  const user = useAuthStore((s) => s.user)

  const sendMutation = useMutation({
    mutationFn: (content: string) => addComment(token, reportId, content),
    onMutate: async (content: string) => {
      await qc.cancelQueries({ queryKey: ['comments', reportId] })

      const previousCommentsData = qc.getQueryData<any>(['comments', reportId])

      const optimisticComment = {
        id: `opt-${Math.random().toString(36).substring(2, 9)}`,
        reportId,
        authorId: user?.id ?? 'me',
        authorName: user?.fullName ?? 'Saya',
        authorRole: user?.role ?? 'USER',
        content,
        createdAt: new Date().toISOString(),
      }

      qc.setQueryData<any>(['comments', reportId], (old: any) => {
        const oldData = old?.data ?? []
        return {
          ...old,
          data: [...oldData, optimisticComment],
        }
      })

      return { previousCommentsData }
    },
    onError: (err: any, _content, context) => {
      if (context?.previousCommentsData) {
        qc.setQueryData(['comments', reportId], context.previousCommentsData)
      }
      toast.error(err.message || 'Gagal mengirim komentar')
    },
    onSuccess: () => {
      setNewComment('')
      toast.success('Komentar berhasil dikirim')
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['comments', reportId] })
    },
  })

  const handleReply = (authorName: string) => {
    const mentionToken = `@${authorName} `
    if (!newComment.includes(mentionToken)) {
      setNewComment((prev) => mentionToken + prev)
    }
    inputRef.current?.focus()
  }

  // Parses comment body to display highlighted tags/mentions
  const renderCommentContent = (content: string) => {
    if (!content) return ''
    const sortedNames = [...participantNames].sort((a, b) => b.length - a.length)
    let parts: (string | ReactNode)[] = [content]

    for (const name of sortedNames) {
      const mentionToken = `@${name}`
      const nextParts: (string | ReactNode)[] = []

      for (const part of parts) {
        if (typeof part !== 'string') {
          nextParts.push(part)
          continue
        }

        let temp = part
        let idx = temp.indexOf(mentionToken)

        while (idx !== -1) {
          if (idx > 0) {
            nextParts.push(temp.substring(0, idx))
          }
          nextParts.push(
            <span
              key={`${name}-${idx}`}
              className="inline-flex items-center rounded-lg bg-[#F9D141]/15 px-2 py-0.5 text-xs font-semibold text-[#d9a416] mr-1.5 shadow-sm border border-[#F9D141]/10"
            >
              @{name}
            </span>
          )
          temp = temp.substring(idx + mentionToken.length)
          idx = temp.indexOf(mentionToken)
        }

        if (temp) {
          nextParts.push(temp)
        }
      }
      parts = nextParts
    }

    return <span>{parts}</span>
  }

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-[#d9a416]" />
        <h3 className="font-semibold">Komentar ({comments.length})</h3>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Memuat komentar...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted">Belum ada komentar. Jadilah yang pertama berkomentar!</p>
      ) : (
        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {comments.map((c) => (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl bg-white/40 p-3.5 backdrop-blur-sm shadow-sm hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">{c.authorName}</span>
                    <span className="rounded bg-[#F9D141]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#d9a416] uppercase tracking-wide">
                      {c.authorRole?.toLowerCase() || 'staf'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">
                      {new Date(c.createdAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => handleReply(c.authorName)}
                      className="inline-flex items-center gap-1 text-xs text-[#d9a416] hover:text-[#d9a416]/80 font-medium transition-colors"
                      title="Balas komentar ini"
                    >
                      <Reply className="h-3 w-3" /> Balas
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {renderCommentContent(c.content)}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Comment input */}
      <div className="flex gap-2 pt-2 border-t border-white/20">
        <textarea
          ref={inputRef}
          className="flex-1 min-h-[80px] resize-none rounded-xl border border-white/20 bg-white/40 px-4 py-3 text-sm backdrop-blur-md focus:border-[#F9D141]/50 focus:outline-none focus:ring-4 focus:ring-[#F9D141]/10"
          placeholder="Tulis komentar Anda... Gunakan @nama untuk menyebut seseorang"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey && newComment.trim()) {
              sendMutation.mutate(newComment.trim())
            }
          }}
        />
        <motion.div whileHover={{ scale: !newComment.trim() || sendMutation.isPending ? 1 : 1.02 }} whileTap={{ scale: !newComment.trim() || sendMutation.isPending ? 1 : 0.98 }} className="self-end">
          <Button
            onClick={() => sendMutation.mutate(newComment.trim())}
            disabled={!newComment.trim() || sendMutation.isPending}
          >
            <Send className="h-4 w-4" /> Kirim
          </Button>
        </motion.div>
      </div>
      <p className="text-xs text-muted">Tekan Ctrl+Enter untuk mengirim komentar</p>
    </GlassCard>
  )
}

