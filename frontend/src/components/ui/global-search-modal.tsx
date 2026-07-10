import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useQueries } from '@tanstack/react-query'
import {
  Search,
  X,
  ClipboardPlus,
  ArrowRightLeft,
  Loader2,
  Building2,
  Wrench,
  FileText,
  Package,
  Calendar,
  ChevronRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchAssets, fetchReports, fetchAssetTransfers, fetchMaintenanceSchedules } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { StatusBadge } from '@/components/ui/feedback'
import { Button } from '@/components/ui/button'

const SECTION_LIMIT = 5

type SearchTab = 'all' | 'assets' | 'reports' | 'transfers' | 'maintenance'

const TAB_LABELS: Record<SearchTab, string> = {
  all: 'Semua',
  assets: 'Aset',
  reports: 'Laporan',
  transfers: 'Transfer',
  maintenance: 'Pemeliharaan',
}

const STATUS_MAP: Record<string, string> = {
  SCHEDULED: 'Terjadwal',
  IN_PROGRESS: 'Dikerjakan',
  DONE: 'Selesai',
  CANCELLED: 'Batal',
  OVERDUE: 'Terlambat',
  PENDING: 'Menunggu',
  APPROVED: 'Disetujui',
  REJECTED: 'Ditolak',
  AI_ANALYSIS: 'Analisis AI',
  REVIEWED: 'Direview',
  ASSIGNED: 'Ditugaskan',
  COMPLETED: 'Selesai',
}

export function GlobalSearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const token = useAuthStore((s) => s.accessToken)!
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<SearchTab>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  const searchQuery = search.trim()
  const enabled = searchQuery.length >= 2

  const results = useQueries({
    queries: [
      {
        queryKey: ['global-search', 'assets', searchQuery],
        queryFn: () => fetchAssets(token, { search: searchQuery, limit: SECTION_LIMIT }),
        enabled,
      },
      {
        queryKey: ['global-search', 'reports', searchQuery],
        queryFn: () => fetchReports(token, { search: searchQuery, limit: SECTION_LIMIT }),
        enabled,
      },
      {
        queryKey: ['global-search', 'transfers', searchQuery],
        queryFn: () => fetchAssetTransfers(token, { search: searchQuery, limit: SECTION_LIMIT }),
        enabled,
      },
      {
        queryKey: ['global-search', 'maintenance', searchQuery],
        queryFn: () => fetchMaintenanceSchedules(token, { search: searchQuery, limit: SECTION_LIMIT }),
        enabled,
      },
    ],
  })

  const [assetsQ, reportsQ, transfersQ, maintenanceQ] = results
  const isLoading = results.some((r) => r.isLoading)

  const assets = assetsQ.data?.data ?? []
  const reports = reportsQ.data?.data ?? []
  const transfers = transfersQ.data?.data ?? []
  const maintenance = maintenanceQ.data?.data ?? []
  const totalCount = assets.length + reports.length + transfers.length + maintenance.length

  useEffect(() => {
    if (isOpen) {
      setSearch('')
      setActiveTab('all')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Navigation helpers
  const goTo = (path: string) => {
    onClose()
    navigate(path)
  }

  const tabs: SearchTab[] = ['all', 'assets', 'reports', 'transfers', 'maintenance']
  const tabCounts: Record<SearchTab, number> = {
    all: totalCount,
    assets: assets.length,
    reports: reports.length,
    transfers: transfers.length,
    maintenance: maintenance.length,
  }

  if (!isOpen) return null

  const showAssets = activeTab === 'all' || activeTab === 'assets'
  const showReports = activeTab === 'all' || activeTab === 'reports'
  const showTransfers = activeTab === 'all' || activeTab === 'transfers'
  const showMaintenance = activeTab === 'all' || activeTab === 'maintenance'

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-[10vh]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/35 backdrop-blur-[4px]"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-white/60 p-6 shadow-2xl flex flex-col max-h-[82vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-[#ef629f]" />
            <h3 className="text-lg font-semibold text-gray-900">Pencarian Global</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input */}
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            ref={inputRef}
            type="text"
            className="flex h-11 w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-10 pr-4 text-sm focus:border-[#ef629f] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#ef629f]/10 transition-all text-slate-900 placeholder:text-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari aset, laporan, transfer, jadwal pemeliharaan..."
          />
          {isLoading && enabled && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#ef629f]/60" />
          )}
        </div>

        {/* Tabs — only show after typing */}
        {enabled && !isLoading && totalCount > 0 && (
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-3 py-1 text-xs font-semibold border transition-all ${
                  activeTab === tab
                    ? 'bg-[#ef629f] text-white border-transparent'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {TAB_LABELS[tab]}
                {tabCounts[tab] > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === tab ? 'bg-white/25' : 'bg-slate-100'}`}>
                    {tabCounts[tab]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {!enabled ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
              <Search className="h-8 w-8 mb-2 opacity-40 text-[#ef629f]" />
              <p className="text-sm font-medium">Mulai ketik minimal 2 karakter</p>
              <p className="text-xs mt-1 text-slate-400">Cari aset, laporan masalah, transfer, dan jadwal pemeliharaan</p>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
              <Loader2 className="h-8 w-8 animate-spin mb-2 text-[#ef629f]/60" />
              <p className="text-sm font-medium">Mencari di semua data...</p>
            </div>
          ) : totalCount === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted">
              <X className="h-8 w-8 mb-2 opacity-40 text-danger" />
              <p className="text-sm font-medium">Tidak ada hasil ditemukan</p>
              <p className="text-xs mt-1">Coba kata kunci lain atau periksa ejaan Anda.</p>
            </div>
          ) : (
            <>
              {/* Assets */}
              {showAssets && assets.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Package className="h-3.5 w-3.5 text-purple-500" />
                      Aset ({assets.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => goTo('/dashboard/rooms')}
                      className="text-xs text-[#ef629f] hover:underline flex items-center gap-0.5"
                    >
                      Lihat semua <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {assets.map((asset) => (
                      <div
                        key={asset.id}
                        className="rounded-2xl border border-white/50 bg-white/60 p-3.5 shadow-sm hover:bg-white/80 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-3"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-800 text-sm truncate">{asset.namaBarang}</p>
                            <StatusBadge status={asset.status} />
                          </div>
                          <p className="text-xs text-muted">
                            <span className="font-medium text-slate-600">Kode:</span> {asset.kodeBarang} ·{' '}
                            <Building2 className="h-3 w-3 inline text-[#ef629f]" />{' '}
                            {asset.roomCode ?? asset.roomId}{asset.roomName ? ` — ${asset.roomName}` : ''}
                          </p>
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 gap-1 rounded-xl text-xs"
                            onClick={() => goTo(`/dashboard/reports?openForm=true&roomId=${asset.roomId}&assetId=${asset.id}`)}
                          >
                            <ClipboardPlus className="h-3 w-3" /> Lapor
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 gap-1 rounded-xl text-xs bg-[#ef629f] text-white hover:bg-[#ef629f]/90"
                            onClick={() => goTo(`/dashboard/asset-transfers?roomId=${asset.roomId}&assetId=${asset.id}`)}
                          >
                            <ArrowRightLeft className="h-3 w-3" /> Pindah
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reports */}
              {showReports && reports.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <FileText className="h-3.5 w-3.5 text-blue-500" />
                      Laporan Masalah ({reports.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => goTo('/dashboard/reports')}
                      className="text-xs text-[#ef629f] hover:underline flex items-center gap-0.5"
                    >
                      Lihat semua <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {reports.map((report) => (
                      <button
                        key={report.id}
                        type="button"
                        onClick={() => goTo(`/dashboard/reports?id=${report.id}`)}
                        className="w-full rounded-2xl border border-white/50 bg-white/60 p-3.5 shadow-sm hover:bg-white/80 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 text-sm truncate">{report.title}</p>
                            <p className="text-xs text-muted mt-0.5">
                              <Building2 className="h-3 w-3 inline text-[#ef629f]" />{' '}
                              {report.roomName ?? report.roomId}
                              {report.reporterName ? ` · ${report.reporterName}` : ''}
                            </p>
                          </div>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            report.status === 'COMPLETED' ? 'bg-green-50 text-green-600 border-green-200' :
                            report.status === 'IN_PROGRESS' || report.status === 'ASSIGNED' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                            report.status === 'PENDING' || report.status === 'AI_ANALYSIS' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                            'bg-rose-50 text-rose-600 border-rose-200'
                          }`}>
                            {STATUS_MAP[report.status] ?? report.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Transfers */}
              {showTransfers && transfers.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <ArrowRightLeft className="h-3.5 w-3.5 text-emerald-500" />
                      Transfer Aset ({transfers.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => goTo('/dashboard/asset-transfers')}
                      className="text-xs text-[#ef629f] hover:underline flex items-center gap-0.5"
                    >
                      Lihat semua <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {transfers.map((transfer) => (
                      <div
                        key={transfer.id}
                        className="rounded-2xl border border-white/50 bg-white/60 p-3.5 shadow-sm flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{transfer.assetName ?? transfer.assetId}</p>
                          <p className="text-xs text-muted mt-0.5">
                            {transfer.fromRoomName} → {transfer.toRoomName}
                            {transfer.requesterName ? ` · ${transfer.requesterName}` : ''}
                          </p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          transfer.status === 'APPROVED' ? 'bg-green-50 text-green-600 border-green-200' :
                          transfer.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                          'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {STATUS_MAP[transfer.status] ?? transfer.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Maintenance */}
              {showMaintenance && maintenance.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <Wrench className="h-3.5 w-3.5 text-orange-500" />
                      Jadwal Pemeliharaan ({maintenance.length})
                    </div>
                    <button
                      type="button"
                      onClick={() => goTo('/dashboard/maintenance')}
                      className="text-xs text-[#ef629f] hover:underline flex items-center gap-0.5"
                    >
                      Lihat semua <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {maintenance.map((sched) => (
                      <div
                        key={sched.id}
                        className="rounded-2xl border border-white/50 bg-white/60 p-3.5 shadow-sm flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{sched.title}</p>
                          <p className="text-xs text-muted mt-0.5">
                            <Calendar className="h-3 w-3 inline text-[#ef629f]" />{' '}
                            {sched.scheduledDate
                              ? new Date(sched.scheduledDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                              : '-'}
                            {sched.roomName ? ` · ${sched.roomName}` : ''}
                            {sched.assigneeName ? ` · ${sched.assigneeName}` : ''}
                          </p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          sched.status === 'DONE' ? 'bg-green-50 text-green-600 border-green-200' :
                          sched.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          sched.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                          sched.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-600 border-amber-200'
                        }`}>
                          {STATUS_MAP[sched.status] ?? sched.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
