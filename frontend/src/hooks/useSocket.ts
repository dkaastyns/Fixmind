import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth-store'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:3000'

export function useSocket() {
  const token = useAuthStore((s) => s.accessToken)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!token) {
      setSocket(null)
      return
    }

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server')
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [token])

  return socket
}
