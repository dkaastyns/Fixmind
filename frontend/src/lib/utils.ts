import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'
import { ApiError, ApiValidationError, NetworkError } from './api-client'
import { useAuthStore } from '@/stores/auth-store'
import React from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const shownToasts = new Map<string, number>()

function isSpam(key: string, cooldown = 1500): boolean {
  const now = Date.now()
  const last = shownToasts.get(key) || 0
  if (now - last < cooldown) return true
  shownToasts.set(key, now)
  if (shownToasts.size > 100) {
    for (const [k, v] of shownToasts.entries()) {
      if (now - v > cooldown * 2) {
        shownToasts.delete(k)
      }
    }
  }
  return false
}

export function handleApiError(error: unknown, defaultMessage = 'Terjadi kesalahan') {
  if (!navigator.onLine && (error instanceof NetworkError || (error instanceof Error && error.message.includes('Failed to fetch')))) {
    return
  }

  // Handle specific ApiError status codes (401, 403, etc.)
  if (error instanceof ApiError) {
    if (error.status === 401) {
      if (isSpam('auth-401')) return
      useAuthStore.getState().clearSession()
      window.location.href = '/login'
      toast.error('Sesi Telah Berakhir', {
        description: 'Silakan masuk kembali untuk melanjutkan.',
        duration: 4000,
      })
      return
    }

    if (error.status === 403) {
      if (isSpam('auth-403')) return
      toast.error('Akses Ditolak', {
        description: 'Anda tidak memiliki wewenang untuk melakukan tindakan ini.',
        duration: 4000,
      })
      return
    }
  }

  if (error instanceof NetworkError) {
    if (isSpam('network-error')) return
    toast.error('Koneksi Bermasalah', {
      description: 'Gagal menghubungi server. Periksa koneksi internet Anda.',
      duration: 4000,
    })
    return
  }

  if (error instanceof ApiValidationError) {
    // Validation errors contain specific field messages, let's throttle them on their combined content hash
    const hash = error.errors.map(e => e.message).join('|')
    if (isSpam(hash)) return

    toast.error(
      React.createElement('div', { className: 'flex flex-col gap-1.5' },
        React.createElement('span', { className: 'font-semibold text-rose-600' }, 'Validasi Gagal'),
        React.createElement('ul', { className: 'list-disc pl-4 text-xs text-slate-600 dark:text-slate-400 space-y-0.5' },
          error.errors.map((e, index) => 
            React.createElement('li', { key: index }, e.message)
          )
        )
      ),
      { duration: 6000 }
    )
    return
  }

  if (error instanceof Error) {
    if (isSpam(error.message)) return
    toast.error(error.message)
    return
  }

  if (isSpam(defaultMessage)) return
  toast.error(defaultMessage)
}
