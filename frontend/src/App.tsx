import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthBootstrap } from './app/auth-bootstrap'
import { AppRouter } from './app/router'

import { SocketProvider } from './components/providers/socket-provider'
import { OfflineSyncProvider } from './components/providers/offline-sync-provider'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
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
