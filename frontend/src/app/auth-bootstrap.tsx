import { useEffect } from 'react'
import { refreshRequest, meRequest } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { setSession, setHydrated, clearSession } = useAuthStore()

  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      try {
        const refresh = await refreshRequest()
        const me = await meRequest(refresh.data.accessToken)
        if (!cancelled) {
          setSession(me.data, refresh.data.accessToken)
        }
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setHydrated()
      }
    }

    hydrate()
    return () => {
      cancelled = true
    }
  }, [setSession, setHydrated, clearSession])

  return <>{children}</>
}
