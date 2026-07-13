import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from './button'
import { GlassCard } from './glass-card'
import { useQueryClient } from '@tanstack/react-query'

interface QueueItem {
  id: string
  path: string
  method: string
  body: any
  headers: Record<string, string>
  description: string
  timestamp: number
}

interface SyncResolutionModalProps {
  isOpen: boolean
  onClose: () => void
  token: string
}

export function SyncResolutionModal({ isOpen, onClose, token }: SyncResolutionModalProps) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [syncErrors, setSyncErrors] = useState<Record<string, string>>({})
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const loadQueue = () => {
    const items = JSON.parse(localStorage.getItem('offline-sync-queue') || '[]')
    setQueue(items)
  }

  useEffect(() => {
    if (isOpen) {
      loadQueue()
      setSyncErrors({})
    }
  }, [isOpen])

  const handleDiscard = (id: string) => {
    const updated = queue.filter(item => item.id !== id)
    localStorage.setItem('offline-sync-queue', JSON.stringify(updated))
    setQueue(updated)
    window.dispatchEvent(new CustomEvent('offline-queue-changed'))
  }

  const handleClearAll = () => {
    localStorage.setItem('offline-sync-queue', '[]')
    setQueue([])
    window.dispatchEvent(new CustomEvent('offline-queue-changed'))
  }

  const handleRetryItem = async (item: QueueItem) => {
    setSyncingId(item.id)
    setSyncErrors(prev => ({ ...prev, [item.id]: '' }))

    const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

    try {
      const response = await fetch(`${API_BASE}${item.path}`, {
        method: item.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...item.headers,
        },
        body: item.body,
        credentials: 'include',
      })

      const resBody = await response.json().catch(() => ({}))

      if (response.ok) {
        // Remove from queue
        const updated = queue.filter(q => q.id !== item.id)
        localStorage.setItem('offline-sync-queue', JSON.stringify(updated))
        setQueue(updated)
        window.dispatchEvent(new CustomEvent('offline-queue-changed'))
        queryClient.invalidateQueries()
      } else {
        // Set error message
        const errMsg = resBody.message || `Server return ${response.status}: Sync failed.`
        setSyncErrors(prev => ({ ...prev, [item.id]: errMsg }))
      }
    } catch (err) {
      setSyncErrors(prev => ({
        ...prev,
        [item.id]: err instanceof Error ? err.message : 'Kesalahan jaringan. Gagal menghubungi server.'
      }))
    } finally {
      setSyncingId(null)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            className="w-full max-w-2xl relative z-10"
          >
            <GlassCard className="p-6 bg-white shadow-2xl border-white/80 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl shadow-inner">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Resolusi Konflik & Sinkronisasi</h3>
                    <p className="text-xs text-slate-500">
                      Kelola daftar perubahan yang dilakukan saat offline.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Action List */}
              <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3">
                {queue.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <CheckCircle className="h-10 w-10 mx-auto text-emerald-500" />
                    <p className="text-sm font-semibold text-slate-600">Semua Data Telah Sinkron!</p>
                    <p className="text-xs text-slate-400">Tidak ada tindakan tertunda di antrean offline.</p>
                  </div>
                ) : (
                  queue.map((item) => {
                    const error = syncErrors[item.id]
                    const isSyncing = syncingId === item.id

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50/80 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="inline-block text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              {item.method}
                            </span>
                            <h4 className="text-xs font-bold text-slate-700 mt-1">{item.description}</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                              Rute: {item.path} • {new Date(item.timestamp).toLocaleTimeString('id-ID')}
                            </p>
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <Button
                              onClick={() => handleRetryItem(item)}
                              disabled={isSyncing}
                              size="sm"
                              className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1"
                            >
                              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                              Sync
                            </Button>
                            <Button
                              onClick={() => handleDiscard(item.id)}
                              disabled={isSyncing}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2.5 rounded-lg text-rose-600 hover:bg-rose-50/50 text-xs flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              Buang
                            </Button>
                          </div>
                        </div>

                        {/* Error info if failed */}
                        {error && (
                          <div className="p-2 bg-rose-50 border border-rose-100/50 rounded-lg flex items-start gap-1.5">
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <div className="text-[11px] text-rose-700 font-medium leading-normal">
                              <strong className="font-bold">Gagal/Konflik:</strong> {error}
                              <p className="text-[10px] text-rose-600/80 mt-0.5 font-semibold">
                                * Rekomendasi: Tekan "Buang" jika data server lebih baru, atau coba lagi setelah beberapa saat.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between gap-3 pt-3.5 border-t border-slate-100">
                {queue.length > 0 ? (
                  <Button
                    variant="ghost"
                    className="rounded-xl font-semibold text-xs text-rose-500 hover:bg-rose-50/60 flex items-center gap-1"
                    onClick={handleClearAll}
                  >
                    <Trash2 className="h-4 w-4" />
                    Kosongkan Antrean
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={onClose} className="rounded-xl font-semibold text-xs">
                    Tutup
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
