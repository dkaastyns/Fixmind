import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'
import { syncOfflineQueue } from '@/lib/api-client'
import { toast } from 'sonner'

interface OfflineSyncContextType {
  isOnline: boolean
  queueLength: number
}

const OfflineSyncContext = createContext<OfflineSyncContextType>({
  isOnline: true,
  queueLength: 0,
})

export const useOfflineSync = () => useContext(OfflineSyncContext)

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [queueLength, setQueueLength] = useState(0)
  const token = useAuthStore((s) => s.accessToken)
  const queryClient = useQueryClient()

  const updateQueueLength = () => {
    const queue = JSON.parse(localStorage.getItem('offline-sync-queue') || '[]')
    setQueueLength(queue.length)
  }

  useEffect(() => {
    updateQueueLength()

    const handleQueueChange = () => {
      updateQueueLength()
    }

    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Kembali Online', {
        description: 'Mencoba menyinkronkan data offline Anda...',
        duration: 4000,
      })
      if (token) {
        syncOfflineQueue(token).then(() => {
          queryClient.invalidateQueries()
          updateQueueLength()
        })
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('Anda Sedang Offline', {
        description: 'Perubahan Anda akan disimpan sementara secara lokal.',
        duration: 5000,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('offline-queue-changed', handleQueueChange)

    // Initial check in case there is stuff left in queue
    if (navigator.onLine && token) {
      const queue = JSON.parse(localStorage.getItem('offline-sync-queue') || '[]')
      if (queue.length > 0) {
        syncOfflineQueue(token).then(() => {
          queryClient.invalidateQueries()
          updateQueueLength()
        })
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('offline-queue-changed', handleQueueChange)
    }
  }, [token, queryClient])

  return (
    <OfflineSyncContext.Provider value={{ isOnline, queueLength }}>
      {children}
    </OfflineSyncContext.Provider>
  )
}
