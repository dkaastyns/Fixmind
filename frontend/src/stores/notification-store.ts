import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NotificationItem {
  id: string
  userId: string
  title: string
  body: string
  link: string
  isRead: boolean
  createdAt: string
}

interface NotificationState {
  notifications: NotificationItem[]
  addNotification: (
    userId: string,
    item: Omit<NotificationItem, 'id' | 'userId' | 'isRead' | 'createdAt'>
  ) => void
  markAllAsRead: (userId: string) => void
  clearAll: (userId: string) => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (userId, item) =>
        set((state) => ({
          notifications: [
            {
              ...item,
              userId,
              id: Math.random().toString(36).substring(7),
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 50), // Limit to 50 notifications
        })),
      markAllAsRead: (userId) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.userId === userId ? { ...n, isRead: true } : n
          ),
        })),
      clearAll: (userId) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.userId !== userId),
        })),
    }),
    {
      name: 'e-lapor-notifications-v2',
    }
  )
)
