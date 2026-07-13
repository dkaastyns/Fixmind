import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toast } from 'sonner'
import { ApiValidationError, NetworkError } from './api-client'
import React from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleApiError(error: unknown, defaultMessage = 'Terjadi kesalahan') {
  if (!navigator.onLine && (error instanceof NetworkError || (error instanceof Error && error.message.includes('Failed to fetch')))) {
    // Rely on global offline indicator to avoid duplicate toast spam
    return
  }

  if (error instanceof NetworkError) {
    toast.error('Koneksi Bermasalah', {
      description: 'Gagal menghubungi server. Periksa koneksi internet Anda.',
      duration: 4000,
    })
    return
  }

  if (error instanceof ApiValidationError) {
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
    toast.error(error.message)
    return
  }

  toast.error(defaultMessage)
}
