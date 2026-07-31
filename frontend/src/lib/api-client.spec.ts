import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { syncOfflineQueue } from './api-client'
import { toast } from 'sonner'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}))

describe('Offline Sync Queue', () => {
  let localStorageMock: Record<string, string> = {}

  beforeEach(() => {
    localStorageMock = {}
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockImplementation((key) => localStorageMock[key] || null),
      setItem: vi.fn().mockImplementation((key, val) => {
        localStorageMock[key] = val
      }),
      removeItem: vi.fn().mockImplementation((key) => {
        delete localStorageMock[key]
      }),
      clear: vi.fn().mockImplementation(() => {
        localStorageMock = {}
      }),
    })

    vi.stubGlobal('dispatchEvent', vi.fn())
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('does nothing when the queue is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    localStorageMock['offline-sync-queue'] = '[]'

    await syncOfflineQueue('mock-token')

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('processes items and removes them from the queue on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    const queueItem = {
      id: 'test-1',
      path: '/reports',
      method: 'POST',
      body: '{"title":"AC Bocor"}',
      headers: {},
      description: 'Membuat laporan masalah baru',
      nextAttemptTime: 0,
      attempts: 0,
    }
    localStorageMock['offline-sync-queue'] = JSON.stringify([queueItem])

    await syncOfflineQueue('mock-token')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/reports'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
        }),
        body: '{"title":"AC Bocor"}',
      })
    )

    // Queue should be empty now
    const updatedQueue = JSON.parse(localStorageMock['offline-sync-queue'])
    expect(updatedQueue).toHaveLength(0)
    expect(toast.success).toHaveBeenCalledWith(
      expect.stringContaining('Sinkronisasi Berhasil'),
      expect.any(Object)
    )
  })

  it('increments attempts and computes exponential backoff on failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false })
    vi.stubGlobal('fetch', fetchMock)

    const queueItem = {
      id: 'test-2',
      path: '/comments',
      method: 'POST',
      body: '{"content":"Test"}',
      headers: {},
      description: 'Menambahkan komentar',
      nextAttemptTime: 0,
      attempts: 0,
    }
    localStorageMock['offline-sync-queue'] = JSON.stringify([queueItem])

    await syncOfflineQueue('mock-token')

    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Queue should still have the item, but with updated attempts and nextAttemptTime
    const updatedQueue = JSON.parse(localStorageMock['offline-sync-queue'])
    expect(updatedQueue).toHaveLength(1)
    expect(updatedQueue[0].attempts).toBe(1)
    expect(updatedQueue[0].nextAttemptTime).toBeGreaterThan(Date.now())
  })
})
