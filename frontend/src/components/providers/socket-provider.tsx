import { useEffect } from 'react'
import { toast } from 'sonner'
import { useSocket } from '@/hooks/useSocket'
import { useQueryClient } from '@tanstack/react-query'
import type { Report } from '@/types/api'

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useSocket()
  const qc = useQueryClient()

  useEffect(() => {
    if (!socket) return

    const handleReportCreated = (report: Report) => {
      toast.info(`New report: ${report.title}`)
      qc.invalidateQueries({ queryKey: ['reports'] })
    }

    const handleReportUpdated = (report: Report) => {
      toast.info(`Report updated: ${report.title} is now ${report.status}`)
      qc.invalidateQueries({ queryKey: ['reports'] })
      qc.invalidateQueries({ queryKey: ['report', report.id] })
    }

    const handleReportAssigned = (report: Report) => {
      toast.success(`You were assigned to: ${report.title}`)
      qc.invalidateQueries({ queryKey: ['reports'] })
      qc.invalidateQueries({ queryKey: ['report', report.id] })
    }

    socket.on('report.created', handleReportCreated)
    socket.on('report.updated', handleReportUpdated)
    socket.on('report.assigned', handleReportAssigned)

    return () => {
      socket.off('report.created', handleReportCreated)
      socket.off('report.updated', handleReportUpdated)
      socket.off('report.assigned', handleReportAssigned)
    }
  }, [socket, qc])

  return <>{children}</>
}
