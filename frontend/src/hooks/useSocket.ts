import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/stores/auth-store'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
  : 'http://localhost:3000'

export function useSocket() {
  const token = useAuthStore((s) => s.accessToken)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!token) return

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    })

    socketRef.current.on('connect', () => {
      console.log('Connected to WebSocket server')
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [token])

  return socketRef.current
}
