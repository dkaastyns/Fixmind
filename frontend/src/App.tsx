import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthBootstrap } from './app/auth-bootstrap'
import { AppRouter } from './app/router'

import { SocketProvider } from './components/providers/socket-provider'
import { OfflineSyncProvider } from './components/providers/offline-sync-provider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        const status = error?.response?.status || error?.status
        if (status && [400, 401, 403, 404].includes(status)) {
          return false
        }
        return failureCount < 3
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 1000 * 60 * 5, // 5 menit default stale time
      gcTime: 1000 * 60 * 10,   // 10 menit garbage collection time
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <SocketProvider>
          <OfflineSyncProvider>
            <AppRouter />
          </OfflineSyncProvider>
        </SocketProvider>
        <Toaster position="top-right" richColors closeButton visibleToasts={5} expand={true} />
      </AuthBootstrap>
    </QueryClientProvider>
  )
}
