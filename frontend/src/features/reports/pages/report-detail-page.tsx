import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Reply, Send, ZoomIn, Loader2, Bot, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import { PageHeader, StatusBadge } from '@/components/ui/feedback'
import { ImageLightbox } from '@/components/ui/image-lightbox'
import {
  addComment,
  assignReport,
  fetchComments,
  fetchReport,
  fetchTechnicians,
  updateReportStatus,
  uploadAttachment,
} from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: () => fetchReport(token, id!),
    enabled: !!id,
  })

  const techs = useQuery({
    queryKey: ['technicians'],
    queryFn: () => fetchTechnicians(token),
    enabled: user?.role === 'ADMIN',
  })

  const report = data?.data
  const [techId, setTechId] = useState('')
  const [repairFile, setRepairFile] = useState<File | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [targetDate, setTargetDate] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    if (report?.aiSuggestedTargetDate && !targetDate) {
      setTargetDate(new Date(report.aiSuggestedTargetDate).toISOString().split('T')[0])
    }
  }, [report?.aiSuggestedTargetDate])

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateReportStatus(token, id!, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report', id] })
      toast.success('Status updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const completeMutation = useMutation({
    mutationFn: async () => {
      if (repairFile) {
        await uploadAttachment(token, id!, repairFile, 'REPAIR')
      }
      return updateReportStatus(token, id!, { status: 'COMPLETED' })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report', id] })
      toast.success('Status updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const assignMutation = useMutation({
    mutationFn: () => assignReport(token, id!, { 
      technicianId: techId,
      targetCompletionDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      adminNotes: adminNotes || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report', id] })
      toast.success('Technician assigned')
    },
    onError: (e: Error) => toast.error(e.message),
  })

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
  if (!report) return <p className="text-danger">Report not found</p>

  const isTech = user?.role === 'TECHNICIAN' || user?.role === 'ADMIN'
  const lightboxImages = (report.attachments ?? []).map((a) => ({ id: a.id, url: a.url, label: a.type }))

  return (
    <div className="space-y-6">
      {lightboxIndex !== null && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
      <Link to="/dashboard/reports" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar laporan
      </Link>

      <PageHeader title={report.title} description={`${report.roomCode} — ${report.roomName}`} />

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={report.status} />
            {report.priority && <StatusBadge status={report.priority} />}
          </div>
          <p className="text-sm leading-relaxed">{report.description}</p>
          <div className="grid gap-2 text-sm text-muted sm:grid-cols-2">
            <p>Pelapor: <span className="text-foreground">{report.reporterName}</span></p>
            <p>Teknisi: <span className="text-foreground">{report.technicianName ?? 'Belum Ditugaskan'}</span></p>
            <p>Dibuat: {new Date(report.createdAt).toLocaleString('id-ID')}</p>
            {report.assetName && <p>Aset: <span className="text-foreground">{report.assetName}</span></p>}
            {report.targetCompletionDate && <p>Target Selesai: <span className="text-foreground">{new Date(report.targetCompletionDate).toLocaleDateString('id-ID')}</span></p>}
          </div>

          {report.adminNotes && (
            <div className="mt-4 rounded-xl border border-[#ef629f]/20 bg-[#ef629f]/5 p-4">
              <h3 className="font-medium text-[#ef629f] mb-1">Instruksi Admin</h3>
              <p className="text-sm">{report.adminNotes}</p>
            </div>
          )}

          {/* AI Analysis status */}
          {report.aiAnalysisStatus === 'PENDING' || report.aiAnalysisStatus === 'PROCESSING' ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-[#ef629f]/20 bg-gradient-to-r from-[#ef629f]/5 to-purple-500/5 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="h-5 w-5 text-[#ef629f]" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef629f] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef629f]" />
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#ef629f]">AI sedang menganalisis laporan...</p>
                  <p className="text-xs text-muted mt-0.5">Menentukan prioritas dan rekomendasi perbaikan</p>
                </div>
                <Loader2 className="ml-auto h-4 w-4 animate-spin text-[#ef629f]/60" />
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#ef629f]/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#ef629f] to-purple-500"
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
              className="rounded-xl bg-gradient-to-br from-white/60 to-white/40 border border-[#ef629f]/20 p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-[#ef629f]" />
                <h3 className="font-semibold text-gradient">Analisis AI</h3>
              </div>
              <p className="mt-2 text-sm">{report.aiPriorityReason}</p>
              <p className="mt-2 text-sm"><strong>Rekomendasi:</strong> {report.aiRecommendation}</p>
              <p className="mt-1 text-sm text-muted">Est. {report.aiEstimatedRepairHours} jam — {report.aiSuggestedAction}</p>
              {report.aiSuggestedTargetDate && (
                <p className="mt-1 text-sm text-[#ef629f] font-medium">Target Selesai yang Disarankan AI: {new Date(report.aiSuggestedTargetDate).toLocaleDateString('id-ID')}</p>
              )}
            </motion.div>
          ) : null}

          {report.attachments && report.attachments.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-sm text-muted mb-3">Foto Bukti ({report.attachments.length})</h3>
              <div className="flex flex-wrap gap-3">
                {report.attachments.map((a, i) => (
                  <button
                    key={a.id}
                    onClick={() => setLightboxIndex(i)}
                    className="group relative overflow-hidden rounded-xl border border-white/30 shadow-sm transition-all hover:scale-105 hover:shadow-lg hover:border-[#ef629f]/50"
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

        <div className="space-y-4">
          {user?.role === 'ADMIN' && report.status !== 'COMPLETED' && (
            <GlassCard>
              <h3 className="font-medium">Tugaskan Teknisi</h3>
              <select
                className="mt-3 flex h-10 w-full rounded-xl border border-white/60 bg-white/70 px-3 text-sm"
                value={techId}
                onChange={(e) => setTechId(e.target.value)}
              >
                <option value="">Pilih teknisi</option>
                {techs.data?.data.map((t) => (
                  <option key={t.id} value={t.id}>{t.fullName}</option>
                ))}
              </select>
              <label className="mt-3 block text-xs font-medium text-foreground/80">Target Tanggal Selesai</label>
              <input
                type="date"
                className="mt-1 flex h-10 w-full rounded-xl border border-white/60 bg-white/70 px-3 text-sm"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
              <textarea
                className="mt-3 min-h-[80px] w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm"
                placeholder="Instruksi spesifik (apa yang harus dibenarkan)..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
              <Button
                className="mt-3 w-full"
                disabled={!techId || assignMutation.isPending}
                onClick={() => assignMutation.mutate()}
              >
                {assignMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Menugaskan...</>
                ) : 'Tugaskan'}
              </Button>
            </GlassCard>
          )}

          {isTech && report.status === 'ASSIGNED' && (
            <GlassCard>
              <h3 className="font-medium">Mulai Pekerjaan</h3>
              <Button
                className="mt-3 w-full"
                disabled={statusMutation.isPending}
                onClick={() => statusMutation.mutate('IN_PROGRESS')}
              >
                {statusMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Memproses...</>
                ) : 'Tandai Sedang Dikerjakan'}
              </Button>
            </GlassCard>
          )}

          {isTech && report.status === 'IN_PROGRESS' && (
            <GlassCard>
              <h3 className="font-medium">Selesaikan Perbaikan</h3>
              <div className="mt-3">
                <label className="text-xs font-medium text-foreground/80 mb-1 block">Foto Bukti (Maks 1 foto, maks 1.5MB)</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 1.5 * 1024 * 1024) {
                      toast.error('Ukuran maksimal foto adalah 1.5MB');
                      setRepairFile(null);
                      e.target.value = ''; // clear input
                      return;
                    }
                    setRepairFile(file);
                  }}
                  className="w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-[#ef629f] file:px-2 file:py-1 file:text-white file:font-medium hover:file:bg-[#ef629f]/90"
                />
              </div>
              <Button
                className="mt-4 w-full"
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
              >
                {completeMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Menyelesaikan...</>
                ) : 'Tandai Selesai'}
              </Button>
            </GlassCard>
          )}

          {report.histories && report.histories.length > 0 && (
            <GlassCard>
              <h3 className="font-medium">Linimasa</h3>
              <ul className="mt-3 space-y-3">
                {report.histories.map((h) => {
                  const actionMap: Record<string, string> = {
                    CREATED: 'Dibuat',
                    AI_ANALYZED: 'Dianalisis AI',
                    ASSIGNED: 'Ditugaskan',
                    STATUS_UPDATED: 'Status Diperbarui',
                  }
                  return (
                    <li key={h.id} className="border-l-2 border-[#ef629f]/30 pl-3 text-sm">
                      <p className="font-medium capitalize">{actionMap[h.action] ?? h.action.replace(/_/g, ' ').toLowerCase()}</p>
                    {h.note && <p className="text-muted">{h.note}</p>}
                    <p className="text-xs text-muted">{new Date(h.createdAt).toLocaleString('id-ID')}</p>
                  </li>
                  )
                })}
              </ul>
            </GlassCard>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <CommentSection token={token} reportId={id!} />
    </div>
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

  const sendMutation = useMutation({
    mutationFn: () => addComment(token, reportId, newComment.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', reportId] })
      setNewComment('')
      toast.success('Komentar berhasil dikirim')
    },
    onError: (e: Error) => toast.error(e.message),
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
              className="inline-flex items-center rounded-lg bg-[#ef629f]/15 px-2 py-0.5 text-xs font-semibold text-[#ef629f] mr-1.5 shadow-sm border border-[#ef629f]/10"
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
        <MessageCircle className="h-5 w-5 text-[#ef629f]" />
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
                    <span className="rounded bg-[#ef629f]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#ef629f] uppercase tracking-wide">
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
                      className="inline-flex items-center gap-1 text-xs text-[#ef629f] hover:text-[#ef629f]/80 font-medium transition-colors"
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
          className="flex-1 min-h-[80px] resize-none rounded-xl border border-white/20 bg-white/40 px-4 py-3 text-sm backdrop-blur-md focus:border-[#ef629f]/50 focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10"
          placeholder="Tulis komentar Anda... Gunakan @nama untuk menyebut seseorang"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey && newComment.trim()) {
              sendMutation.mutate()
            }
          }}
        />
        <Button
          className="self-end"
          onClick={() => sendMutation.mutate()}
          disabled={!newComment.trim() || sendMutation.isPending}
        >
          <Send className="h-4 w-4" /> Kirim
        </Button>
      </div>
      <p className="text-xs text-muted">Tekan Ctrl+Enter untuk mengirim komentar</p>
    </GlassCard>
  )
}

