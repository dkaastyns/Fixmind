import { useEffect, useState } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useSocket } from '@/hooks/useSocket'
import { useNotificationStore } from '@/stores/notification-store'
import { useAuthStore } from '@/stores/auth-store'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function NotificationBell({ align = 'right', className }: { align?: 'left' | 'right'; className?: string }) {
  const socket = useSocket()
  const user = useAuthStore((s) => s.user)
  const { notifications, addNotification, markAllAsRead, clearAll } = useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    if (!socket || !user) return

    // Handler for new report (Admin only)
    const handleReportCreated = (report: any) => {
      if (!user.isAdmin) return
      const title = 'Laporan Baru Masuk'
      const body = `${report.reporterName} melaporkan "${report.title}" di ${report.roomName}`
      addNotification({
        title,
        body,
        link: `/dashboard/reports/${report.id}`,
      })
      toast.info(title, { description: body })
    }

    // Handler for report updates (All roles, filtered accordingly)
    const handleReportUpdated = (report: any) => {
      let notify = false
      let title = 'Laporan Diperbarui'
      let body = `Laporan "${report.title}" telah diperbarui.`

      if (user.isAdmin) {
        notify = true
        body = `Laporan "${report.title}" oleh ${report.reporterName} diperbarui.`
      } else if (report.reporterId === user.id) {
        notify = true
        body = `Laporan Anda "${report.title}" diubah statusnya menjadi ${report.status}.`
      }

      if (notify) {
        addNotification({
          title,
          body,
          link: `/dashboard/reports/${report.id}`,
        })
        toast.info(title, { description: body })
      }
    }

    socket.on('report.created', handleReportCreated)
    socket.on('report.updated', handleReportUpdated)

    return () => {
      socket.off('report.created', handleReportCreated)
      socket.off('report.updated', handleReportUpdated)
    }
  }, [socket, user, addNotification])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "relative rounded-xl p-2 bg-white/20 border border-white/30 text-foreground hover:bg-white/45 transition-colors focus:outline-none cursor-pointer",
          className
        )}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white/40">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute mt-3 z-50 w-80 sm:w-96 rounded-2xl border border-slate-200/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden",
                align === 'right' ? 'right-0' : 'left-0'
              )}
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
                <span className="text-[15px] font-bold text-slate-800">Notifikasi</span>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#d9a416] hover:text-[#c29410] font-medium inline-flex items-center gap-0.5 cursor-pointer"
                      title="Tandai semua dibaca"
                    >
                      <Check className="h-3.5 w-3.5" /> Dibaca
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-slate-400 hover:text-red-500 font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Hapus semua"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <Bell className="h-8 w-8 text-slate-200 mb-3" />
                    <p className="text-[13px] font-medium text-slate-500">Tidak ada notifikasi baru</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={n.link}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block p-4 transition-colors hover:bg-slate-50",
                        !n.isRead ? "bg-blue-50/40" : ""
                      )}
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className={cn("text-[13px] font-bold", !n.isRead ? "text-slate-900" : "text-slate-600")}>
                          {n.title}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-4">
                          {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={cn("leading-relaxed text-[12px]", !n.isRead ? "text-slate-700" : "text-slate-500")}>
                        {n.body}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
