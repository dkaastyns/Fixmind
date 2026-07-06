import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface NotificationItem {
  id: string
  title: string
  body: string
  link: string
  isRead: boolean
  createdAt: string
}

interface NotificationState {
  notifications: NotificationItem[]
  addNotification: (item: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) => void
  markAllAsRead: () => void
  clearAll: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (item) =>
        set((state) => ({
          notifications: [
            {
              ...item,
              id: Math.random().toString(36).substring(7),
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ].slice(0, 50), // Limit to 50 notifications
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),
      clearAll: () => set({ notifications: [] }),
    }),
    {
      name: 'e-lapor-notifications',
    }
  )
)
