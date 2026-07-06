import { create } from 'zustand'
import type { User } from '@/types/api'

interface AuthState {
  user: User | null
  accessToken: string | null
  isHydrated: boolean
  setSession: (user: User, accessToken: string) => void
  setAccessToken: (token: string) => void
  setUser: (user: User) => void
  setHydrated: () => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isHydrated: false,
  setSession: (user, accessToken) => set({ user, accessToken, isHydrated: true }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setUser: (user) => set({ user }),
  setHydrated: () => set({ isHydrated: true }),
  clearSession: () => set({ user: null, accessToken: null, isHydrated: true }),
}))
