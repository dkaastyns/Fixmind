import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { AuthBootstrap } from './app/auth-bootstrap'
import { AppRouter } from './app/router'

import { SocketProvider } from './components/providers/socket-provider'

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
          <AppRouter />
        </SocketProvider>
        <Toaster position="top-right" richColors closeButton />
      </AuthBootstrap>
    </QueryClientProvider>
  )
}
