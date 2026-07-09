import type {
  ApiSuccessResponse,
  Asset,
  AssetTransfer,
  AssetTransferStatus,
  Comment,
  DashboardOverview,
  LoginResponse,
  Report,
  Room,
  User,
} from '@/types/api'

import { useAuthStore } from '@/stores/auth-store'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api/v1'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<ApiSuccessResponse<T>> {
  const { token, headers, ...rest } = options

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  })

  const body = await response.json().catch(() => ({}))

  if (response.status === 401 && path !== '/auth/refresh' && path !== '/auth/login') {
    try {
      const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
      if (refreshResponse.ok) {
        const refreshBody = await refreshResponse.json()
        const newAccessToken = refreshBody.data?.accessToken
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken)
          const retryResponse = await fetch(`${API_BASE}${path}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newAccessToken}`,
              ...headers,
            },
            ...rest,
          })
          const retryBody = await retryResponse.json().catch(() => ({}))
          if (!retryResponse.ok || retryBody.success === false) {
            throw new ApiError(retryBody.message ?? 'Request failed', retryResponse.status)
          }
          return retryBody as ApiSuccessResponse<T>
        }
      }
    } catch (refreshErr) {
      // ignore and fall through to throw original 401 error
    }
  }

  if (!response.ok || body.success === false) {
    throw new ApiError(body.message ?? 'Request failed', response.status)
  }

  return body as ApiSuccessResponse<T>
}

function auth(token: string | null) {
  return { token }
}

// Auth
export const loginRequest = (email: string, password: string) =>
  apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

export const registerRequest = (data: {
  email: string
  password: string
  fullName: string
  phone?: string
}) =>
  apiFetch<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const refreshRequest = () =>
  apiFetch<{ accessToken: string; expiresIn: string }>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({}),
  })

export const meRequest = (token: string) =>
  apiFetch<User>('/auth/me', auth(token))

export const logoutRequest = (token: string) =>
  apiFetch('/auth/logout', { method: 'POST', ...auth(token) })

export const updateProfileRequest = (
  token: string,
  data: { fullName: string; phone?: string },
) =>
  apiFetch<User>('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...auth(token),
  })

export const changePasswordRequest = (
  token: string,
  data: { oldPassword: string; newPassword: string },
) =>
  apiFetch<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
    ...auth(token),
  })

// Users
export const fetchUsers = (token: string, params?: { isAdmin?: boolean }) => {
  const q = typeof params?.isAdmin === 'boolean' ? `?isAdmin=${params.isAdmin}` : ''
  return apiFetch<User[]>(`/users${q}`, auth(token))
}

export const createUser = (token: string, data: object) =>
  apiFetch<User>('/users', { method: 'POST', body: JSON.stringify(data), ...auth(token) })

export const updateUser = (token: string, id: string, data: object) =>
  apiFetch<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data), ...auth(token) })

export const deleteUser = (token: string, id: string) =>
  apiFetch(`/users/${id}`, { method: 'DELETE', ...auth(token) })

// Rooms & Assets
export const fetchRooms = (token: string, activeOnly = false) =>
  apiFetch<Room[]>(`/rooms?activeOnly=${activeOnly}`, auth(token))

export const createRoom = (token: string, data: object) =>
  apiFetch<Room>('/rooms', { method: 'POST', body: JSON.stringify(data), ...auth(token) })

export const updateRoom = (token: string, id: string, data: object) =>
  apiFetch<Room>(`/rooms/${id}`, { method: 'PATCH', body: JSON.stringify(data), ...auth(token) })

export const deleteRoom = (token: string, id: string) =>
  apiFetch(`/rooms/${id}`, { method: 'DELETE', ...auth(token) })

export const fetchAssets = (token: string, params?: { roomId?: string; search?: string; limit?: number }) => {
  const q = new URLSearchParams()
  if (params?.roomId) q.set('roomId', params.roomId)
  if (params?.search) q.set('search', params.search)
  if (params?.limit) q.set('limit', String(params.limit))
  const qs = q.toString() ? `?${q.toString()}` : ''
  return apiFetch<Asset[]>(`/assets${qs}`, auth(token))
}

export const createAsset = (token: string, data: object) =>
  apiFetch<Asset>('/assets', { method: 'POST', body: JSON.stringify(data), ...auth(token) })

export const updateAsset = (token: string, id: string, data: object) =>
  apiFetch<Asset>(`/assets/${id}`, { method: 'PATCH', body: JSON.stringify(data), ...auth(token) })

export const deleteAsset = (token: string, id: string) =>
  apiFetch(`/assets/${id}`, { method: 'DELETE', ...auth(token) })

export const fetchAssetTransfers = (
  token: string,
  params?: { status?: AssetTransferStatus; mineOnly?: boolean; page?: number; limit?: number },
) => {
  const q = new URLSearchParams()
  if (params?.status) q.set('status', params.status)
  if (typeof params?.mineOnly === 'boolean') q.set('mineOnly', String(params.mineOnly))
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const qs = q.toString() ? `?${q.toString()}` : ''
  return apiFetch<AssetTransfer[]>(`/assets/transfers${qs}`, auth(token))
}

export const fetchAssetTransfer = (token: string, id: string) =>
  apiFetch<AssetTransfer>(`/assets/transfers/${id}`, auth(token))

export const createAssetTransfer = (token: string, data: { assetId: string; toRoomId: string; reason: string }) =>
  apiFetch<AssetTransfer>('/assets/transfers', {
    method: 'POST',
    body: JSON.stringify(data),
    ...auth(token),
  })

export const reviewAssetTransfer = (
  token: string,
  id: string,
  data: { decision: 'APPROVED' | 'REJECTED'; notes?: string },
) =>
  apiFetch<AssetTransfer>(`/assets/transfers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...auth(token),
  })

export const importAssets = async (token: string, roomId: string, file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/assets/import?roomId=${roomId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    credentials: 'include',
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.success === false) {
    throw new ApiError(body.message ?? 'Import failed', response.status)
  }
  return body as ApiSuccessResponse<{ imported: number; data: Asset[] }>
}

export const downloadAssetTemplate = async (token: string) => {
  const res = await fetch(`${API_BASE}/assets/import/template`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })
  if (!res.ok) throw new ApiError('Download template gagal', res.status)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'template_import_aset.xlsx'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}


// Reports
export const fetchReports = (
  token: string,
  params?: { status?: string; roomId?: string; dateFrom?: string; dateTo?: string; page?: number; limit?: number },
) => {
  const q = new URLSearchParams()
  if (params?.status) q.set('status', params.status)
  if (params?.roomId) q.set('roomId', params.roomId)
  if (params?.dateFrom) q.set('dateFrom', params.dateFrom)
  if (params?.dateTo) q.set('dateTo', params.dateTo)
  if (params?.page) q.set('page', String(params.page))
  if (params?.limit) q.set('limit', String(params.limit))
  const qs = q.toString() ? `?${q.toString()}` : ''
  return apiFetch<Report[]>(`/reports${qs}`, auth(token))
}

export const fetchReport = (token: string, id: string) =>
  apiFetch<Report>(`/reports/${id}`, auth(token))

export const createReport = (token: string, data: object) =>
  apiFetch<Report>('/reports', { method: 'POST', body: JSON.stringify(data), ...auth(token) })

export const updateReportStatus = (token: string, id: string, data: object) =>
  apiFetch<Report>(`/reports/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...auth(token),
  })

export const chatAi = (token: string, prompt: string) =>
  apiFetch<{ answer: string }>(`/ai/chat`, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
    ...auth(token),
  })

export const uploadAttachment = async (token: string, id: string, file: File, type: string = 'DAMAGE') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)

  const response = await fetch(`${API_BASE}/reports/${id}/attachments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    credentials: 'include',
  })
  
  const body = await response.json().catch(() => ({}))
  if (!response.ok || body.success === false) throw new ApiError(body.message ?? 'Upload failed', response.status)
  return body as ApiSuccessResponse<{ url: string }>
}

export const assignReport = (token: string, id: string, data: object) =>
  apiFetch<Report>(`/reports/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify(data),
    ...auth(token),
  })

// Analytics
export const fetchOverview = (token: string) =>
  apiFetch<DashboardOverview>('/analytics/overview', auth(token))

export const fetchAnalyticsSummary = (token: string) =>
  apiFetch<DashboardOverview>('/analytics/summary', auth(token))

export const exportReports = (token: string, startDate?: string, endDate?: string) => {
  const q = new URLSearchParams()
  if (startDate) q.set('startDate', startDate)
  if (endDate) q.set('endDate', endDate)
  const qs = q.toString() ? `?${q.toString()}` : ''
  return fetch(`${API_BASE}/analytics/export${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })
}

// Comments
export const fetchComments = (token: string, reportId: string) =>
  apiFetch<Comment[]>(`/reports/${reportId}/comments`, auth(token))

export const addComment = (token: string, reportId: string, content: string) =>
  apiFetch<Comment>(`/reports/${reportId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content }),
    ...auth(token),
  })



// File exports
async function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const exportExcel = async (token: string, startDate?: string, endDate?: string) => {
  const q = new URLSearchParams()
  if (startDate) q.set('startDate', startDate)
  if (endDate) q.set('endDate', endDate)
  const qs = q.toString() ? `?${q.toString()}` : ''
  const res = await fetch(`${API_BASE}/reports/export/excel${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })
  if (!res.ok) throw new ApiError('Export failed', res.status)
  const blob = await res.blob()
  await downloadBlob(blob, 'e-lapor-laporan.xlsx')
}

export const exportPdf = async (token: string, startDate?: string, endDate?: string) => {
  const q = new URLSearchParams()
  if (startDate) q.set('startDate', startDate)
  if (endDate) q.set('endDate', endDate)
  const qs = q.toString() ? `?${q.toString()}` : ''
  const res = await fetch(`${API_BASE}/reports/export/pdf${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
  })
  if (!res.ok) throw new ApiError('Export failed', res.status)
  const blob = await res.blob()
  await downloadBlob(blob, 'e-lapor-laporan.pdf')
}

// ─── Asset Transfer Exports (client-side generation) ───────────────────────

export const exportTransfersExcel = async (
  token: string,
  startDate?: string,
  endDate?: string,
) => {
  const res = await apiFetch<AssetTransfer[]>('/assets/transfers?limit=10000', auth(token))
  let transfers = res.data ?? []

  if (startDate || endDate) {
    transfers = transfers.filter((t) => {
      const d = new Date(t.createdAt)
      if (startDate && d < new Date(startDate)) return false
      if (endDate && d > new Date(endDate)) return false
      return true
    })
  }

  const { utils, writeFile } = await import('xlsx')
  const rows = transfers.map((t, i) => ({
    No: i + 1,
    'Nama Aset': t.assetName ?? '-',
    'Kode Aset': t.assetKode ?? '-',
    'Dari Ruangan': t.fromRoomName ?? '-',
    'Ke Ruangan': t.toRoomName ?? '-',
    Status: t.status === 'PENDING' ? 'Menunggu' : t.status === 'APPROVED' ? 'Disetujui' : 'Ditolak',
    Pemohon: t.requesterName ?? '-',
    'Tanggal Pengajuan': new Date(t.createdAt).toLocaleDateString('id-ID'),
    'Tanggal Review': t.reviewedAt ? new Date(t.reviewedAt).toLocaleDateString('id-ID') : '-',
    'Catatan Admin': t.reviewerNotes ?? '-',
  }))

  const ws = utils.json_to_sheet(rows)
  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Transfer Aset')
  writeFile(wb, 'fixmind-transfer-aset.xlsx')
}

export const exportTransfersPdf = async (
  token: string,
  startDate?: string,
  endDate?: string,
) => {
  const res = await apiFetch<AssetTransfer[]>('/assets/transfers?limit=10000', auth(token))
  let transfers = res.data ?? []

  if (startDate || endDate) {
    transfers = transfers.filter((t) => {
      const d = new Date(t.createdAt)
      if (startDate && d < new Date(startDate)) return false
      if (endDate && d > new Date(endDate)) return false
      return true
    })
  }

  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFontSize(16)
  doc.setTextColor(239, 98, 159)
  doc.text('Laporan Transfer Aset — FixMind', 14, 16)

  doc.setFontSize(9)
  doc.setTextColor(100)
  const rangeLabel =
    startDate || endDate
      ? `Periode: ${startDate ? new Date(startDate).toLocaleDateString('id-ID') : '—'} s/d ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : '—'}`
      : 'Periode: Semua Waktu'
  doc.text(rangeLabel, 14, 23)

  autoTable(doc, {
    startY: 28,
    head: [['No', 'Nama Aset', 'Kode', 'Dari Ruangan', 'Ke Ruangan', 'Status', 'Pemohon', 'Tgl Pengajuan', 'Catatan Admin']],
    body: transfers.map((t, i) => [
      i + 1,
      t.assetName ?? '-',
      t.assetKode ?? '-',
      t.fromRoomName ?? '-',
      t.toRoomName ?? '-',
      t.status === 'PENDING' ? 'Menunggu' : t.status === 'APPROVED' ? 'Disetujui' : 'Ditolak',
      t.requesterName ?? '-',
      new Date(t.createdAt).toLocaleDateString('id-ID'),
      t.reviewerNotes ?? '-',
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [239, 98, 159], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [255, 240, 248] },
  })

  doc.save('fixmind-transfer-aset.pdf')
}
