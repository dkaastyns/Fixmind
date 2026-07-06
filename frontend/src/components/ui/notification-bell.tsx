import { useEffect, useState } from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useSocket } from '@/hooks/useSocket'
import { useNotificationStore } from '@/stores/notification-store'
import { useAuthStore } from '@/stores/auth-store'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const socket = useSocket()
  const user = useAuthStore((s) => s.user)
  const { notifications, addNotification, markAllAsRead, clearAll } = useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    if (!socket || !user) return

    // Handler for new report (Admin only)
    const handleReportCreated = (report: any) => {
      if (user.role !== 'ADMIN') return
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

      if (user.role === 'ADMIN') {
        notify = true
        body = `Laporan "${report.title}" oleh ${report.reporterName} diperbarui.`
      } else if (user.role === 'TECHNICIAN' && report.assignedTechnicianId === user.id) {
        notify = true
        title = 'Tugas Diperbarui'
        body = `Tugas "${report.title}" di ${report.roomName} diperbarui.`
      } else if (user.role === 'USER' && report.reporterId === user.id) {
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

    // Handler for technician assignment (Admin & Technician)
    const handleReportAssigned = (report: any) => {
      let notify = false
      let title = 'Teknisi Ditugaskan'
      let body = `Teknisi ${report.technicianName} ditugaskan untuk "${report.title}"`

      if (user.role === 'ADMIN') {
        notify = true
      } else if (user.role === 'TECHNICIAN' && report.assignedTechnicianId === user.id) {
        notify = true
        title = 'Tugas Baru Ditugaskan'
        body = `Anda ditugaskan memperbaiki "${report.title}" di ${report.roomName}`
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
    socket.on('report.assigned', handleReportAssigned)

    return () => {
      socket.off('report.created', handleReportCreated)
      socket.off('report.updated', handleReportUpdated)
      socket.off('report.assigned', handleReportAssigned)
    }
  }, [socket, user, addNotification])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative rounded-xl p-2 bg-white/20 border border-white/30 text-foreground hover:bg-white/45 transition-colors focus:outline-none cursor-pointer"
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
              className="absolute right-0 mt-2 z-50 w-80 rounded-2xl border border-white/30 bg-white/90 shadow-xl backdrop-blur-md overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-white/20 p-3 bg-[#ef629f]/5">
                <span className="text-sm font-semibold">Notifikasi</span>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#ef629f] hover:text-[#ef629f]/80 font-medium inline-flex items-center gap-0.5 cursor-pointer"
                      title="Tandai semua dibaca"
                    >
                      <Check className="h-3.5 w-3.5" /> Dibaca
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs text-muted hover:text-danger font-medium inline-flex items-center gap-0.5 cursor-pointer"
                      title="Hapus semua"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/20">
                {notifications.length === 0 ? (
                  <p className="p-6 text-center text-xs text-muted">Tidak ada notifikasi baru</p>
                ) : (
                  notifications.map((n) => (
                    <Link
                      key={n.id}
                      to={n.link}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "block p-3.5 text-xs hover:bg-white/40 transition-colors",
                        !n.isRead ? "bg-white/60 font-medium" : "text-muted"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className={cn("font-semibold text-foreground", !n.isRead ? "text-[#ef629f]" : "")}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-muted">
                          {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground leading-normal">{n.body}</p>
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
