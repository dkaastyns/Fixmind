import { useEffect, useState } from 'react'
import { refreshRequest, meRequest, NetworkError } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { FullPageLoading } from '@/components/ui/full-page-loading'

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { accessToken, setSession, setHydrated, clearSession, isHydrated } = useAuthStore()
  const [isOffline, setIsOffline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    if (accessToken) {
      setIsOffline(false)
      setHydrated()
      return
    }

    let cancelled = false

    async function hydrate() {
      try {
        const refresh = await refreshRequest()
        const me = await meRequest(refresh.data.accessToken)
        if (!cancelled) {
          setIsOffline(false)
          setSession(me.data, refresh.data.accessToken)
        }
      } catch (error) {
        if (cancelled) return

        if (error instanceof NetworkError) {
          setIsOffline(true)
          // Coba sambungkan kembali setelah 3 detik
          setTimeout(() => {
            if (!cancelled) {
              setRetryCount((c) => c + 1)
            }
          }, 3000)
        } else {
          // Kesalahan autentikasi biasa (token kadaluarsa, cookie tidak valid, dsb)
          setIsOffline(false)
          clearSession()
          setHydrated()
        }
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [accessToken, setSession, setHydrated, clearSession, retryCount])

  if (isOffline && !isHydrated) {
    return <FullPageLoading text="Koneksi bermasalah. Menghubungkan kembali" />
  }

  return <>{children}</>
}

