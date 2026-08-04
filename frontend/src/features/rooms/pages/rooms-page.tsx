/* eslint-disable react-hooks/set-state-in-effect */
import { useRef, useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Download,
  FileSpreadsheet,
  Plus,
  Trash2,
  X,
  Building2,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Tag,
  ShieldCheck,
  Calendar,
  ArrowRightLeft,
  Hash,
  Car,
  Layers,
  Eye,
  Filter,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
import { ListSkeleton } from '@/components/ui/skeleton'
import {
  createAsset,
  createRoom,
  deleteAsset,
  deleteRoom,
  downloadAssetTemplate,
  fetchAssets,
  fetchRooms,
  importAssets,
  exportRoomsExcel,
  exportRoomsPdf,
} from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { cn, handleApiError } from '@/lib/utils'
import type { Room, Asset } from '@/types/api'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { HelpTooltip } from '@/components/ui/help-tooltip'

export function RoomsPage() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const qc = useQueryClient()
  const navigate = useNavigate()

  // Main Active Tab: 'assets' (default!) or 'rooms'
  const [activeTab, setActiveTab] = useState<'assets' | 'rooms'>('assets')

  // Selected Room Filter for Asset View: 'ALL', 'UNASSIGNED', or roomId
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('ALL')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL')

  const [showRoomForm, setShowRoomForm] = useState(false)
  const [showAssetForm, setShowAssetForm] = useState(false)

  const [isDeletingRooms, setIsDeletingRooms] = useState(false)
  const [isDeletingAssets, setIsDeletingAssets] = useState(false)

  const [selectedRoomsToDelete, setSelectedRoomsToDelete] = useState<string[]>([])
  const [selectedAssetsToDelete, setSelectedAssetsToDelete] = useState<string[]>([])
  
  const [showConfirmRoomDelete, setShowConfirmRoomDelete] = useState(false)
  const [showConfirmAssetDelete, setShowConfirmAssetDelete] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)

  // Detail Asset Modal State
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null)
  const [showAssetDetailModal, setShowAssetDetailModal] = useState(false)

  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''

  // Search & Pagination states
  const [roomSearch, setRoomSearch] = useState(initialSearch)
  const [assetSearch, setAssetSearch] = useState(initialSearch)
  const [roomPage, setRoomPage] = useState(1)
  const [assetPage, setAssetPage] = useState(1)

  useEffect(() => {
    const q = searchParams.get('search') ?? ''
    setRoomSearch(q)
    setAssetSearch(q)
  }, [searchParams])

  useEffect(() => {
    setRoomPage(1)
  }, [roomSearch])

  useEffect(() => {
    setAssetPage(1)
  }, [assetSearch, selectedRoomFilter, selectedStatusFilter])

  // Import Excel state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importRoomId, setImportRoomId] = useState<string>('')
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const headerImportInputRef = useRef<HTMLInputElement>(null)

  // Fetch Rooms
  const rooms = useQuery({ 
    queryKey: ['rooms', roomSearch, roomPage], 
    queryFn: () => fetchRooms(token, { limit: 100, page: roomPage, search: roomSearch.trim() || undefined }) 
  })

  // Fetch ALL Assets (or filtered by room/status/search)
  const assets = useQuery({
    queryKey: ['assets', selectedRoomFilter, selectedStatusFilter, assetSearch, assetPage],
    queryFn: () => fetchAssets(token, { 
      roomId: selectedRoomFilter === 'ALL' ? undefined : selectedRoomFilter, 
      limit: 10, 
      page: assetPage,
      search: assetSearch.trim() || undefined
    }),
  })

  const roomsList = rooms.data?.data ?? []
  const roomsMeta = rooms.data?.meta

  const assetsList = assets.data?.data ?? []
  const assetsMeta = assets.data?.meta
  const assetsTotalPages = assetsMeta ? Math.ceil(assetsMeta.total / assetsMeta.limit) : 1

  // Filter Assets locally by status if needed
  const filteredAssetsList = useMemo(() => {
    if (selectedStatusFilter === 'ALL') return assetsList
    return assetsList.filter((a) => a.status === selectedStatusFilter)
  }, [assetsList, selectedStatusFilter])

  // Overview Stats
  const totalAssetsCount = assetsMeta?.total ?? assetsList.length
  const assignedAssetsCount = useMemo(() => {
    return assetsList.filter((a) => !!a.roomId || !!a.roomName).length
  }, [assetsList])
  const unassignedAssetsCount = useMemo(() => {
    return assetsList.filter((a) => !a.roomId && !a.roomName).length
  }, [assetsList])

  // Delete Mutations
  const deleteRoomMut = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => deleteRoom(token, id)))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] })
      setSelectedRoomsToDelete([])
      setIsDeletingRooms(false)
      setShowConfirmRoomDelete(false)
      toast.success('Ruangan terpilih berhasil dihapus') 
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteAssetMut = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => deleteAsset(token, id)))
    },
    onSuccess: (_, ids) => { 
      const deletedItems = ids
        .map(id => assets.data?.data.find(a => a.id === id))
        .filter((a): a is Asset => !!a)

      qc.invalidateQueries({ queryKey: ['assets'] })
      setSelectedAssetsToDelete([])
      setIsDeletingAssets(false)
      setShowConfirmAssetDelete(false)
      
      toast.success('Aset terpilih berhasil dihapus', {
        action: {
          label: 'Urungkan',
          onClick: () => {
            toast.promise(
              Promise.all(
                deletedItems.map(item =>
                  createAsset(token, {
                    roomId: item.roomId,
                    idpemda: item.idpemda,
                    kodeBarang: item.kodeBarang,
                    nomorRegister: item.nomorRegister,
                    namaBarang: item.namaBarang,
                    merkType: item.merkType,
                  })
                )
              ),
              {
                loading: 'Mengembalikan aset...',
                success: () => {
                  qc.invalidateQueries({ queryKey: ['assets'] })
                  return 'Aset berhasil dikembalikan!'
                },
                error: 'Gagal mengembalikan aset.',
              }
            )
          }
        }
      })
    },
    onError: (e: Error) => handleApiError(e),
  })

  const importAssetsMut = useMutation({
    mutationFn: ({ roomId, file }: { roomId?: string | null; file: File }) =>
      importAssets(token, roomId, file),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      toast.success(`${res.data.imported} aset berhasil diimport`)
      if (headerImportInputRef.current) headerImportInputRef.current.value = ''
      setShowImportModal(false)
      setPendingImportFile(null)
      setImportRoomId('')
    },
    onError: (e: Error) => {
      toast.error(e.message)
    },
  })

  const downloadTemplateMut = useMutation({
    mutationFn: () => downloadAssetTemplate(token),
    onSuccess: () => toast.success('Template Excel berhasil diunduh'),
    onError: (e: Error) => toast.error(e.message),
  })

  const toggleRoomDelete = (id: string) => {
    setSelectedRoomsToDelete(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleAssetDelete = (id: string) => {
    setSelectedAssetsToDelete(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleHeaderImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingImportFile(file)
    setImportRoomId('')
    setShowImportModal(true)
  }

  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const handleExportExcel = async () => {
    setIsExportingExcel(true)
    try {
      await toast.promise(exportRoomsExcel(token), {
        loading: 'Sedang mengekspor data ruangan ke Excel...',
        success: 'File Excel berhasil diunduh!',
        error: (e) => e.message ?? 'Gagal mengekspor Excel',
      })
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleExportPdf = async () => {
    setIsExportingPdf(true)
    try {
      await toast.promise(exportRoomsPdf(token), {
        loading: 'Sedang membuat PDF rekap data fasilitas...',
        success: 'Dokumen PDF berhasil diunduh!',
        error: (e) => e.message ?? 'Gagal mengekspor PDF',
      })
    } finally {
      setIsExportingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fasilitas & Ruangan' }]} />
      <PageHeader
        title="Fasilitas & Aset DPRD Kota Semarang"
        description="Kelola seluruh daftar inventaris barang kantor, kendaraan dinas, serta fasilitas gedung secara terpadu."
        action={isAdmin ? (
          <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2.5">
            {/* Group 1: Data Utilities */}
            <div className="flex items-center gap-1 p-1 bg-white/90 border border-slate-200/80 rounded-2xl shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExportModal(true)}
                disabled={isExportingExcel || isExportingPdf}
                title="Export data ruangan & aset ke Excel atau PDF"
                className="gap-1.5 h-8 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>Export</span>
              </Button>

              <div className="h-4 w-[1px] bg-slate-200" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadTemplateMut.mutate()}
                disabled={downloadTemplateMut.isPending}
                title="Download template Excel untuk import aset"
                className="gap-1.5 h-8 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[#d9a416]" />
                <span>Template</span>
              </Button>

              <div className="h-4 w-[1px] bg-slate-200" />

              <input
                ref={headerImportInputRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleHeaderImportFileChange}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => headerImportInputRef.current?.click()}
                disabled={importAssetsMut.isPending}
                title="Import aset dari file Excel"
                className="gap-1.5 h-8 px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                <span>{importAssetsMut.isPending ? 'Mengimport...' : 'Import'}</span>
              </Button>
            </div>

            {/* Group 2: Primary Add Actions */}
            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button
                  onClick={() => setShowAssetForm(true)}
                  title="Tambah aset baru secara manual"
                  className="gap-1.5 h-9 px-3.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-white" />
                  <span>Tambah Aset</span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button 
                  onClick={() => setShowRoomForm(true)} 
                  title="Tambah ruangan baru"
                  className="gap-1.5 h-9 px-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs shadow-md shadow-slate-900/20 cursor-pointer"
                >
                  <Plus className="h-4 w-4 text-white" />
                  <span>Tambah Ruangan</span>
                </Button>
              </motion.div>
            </div>
          </div>
        ) : undefined}
      />

      {/* OVERVIEW STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 bg-white/80 border-slate-200/80 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Aset</p>
            <h4 className="text-xl font-black text-slate-800">{totalAssetsCount}</h4>
            <p className="text-[10px] text-slate-500 font-medium">Seluruh inventaris barang</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-white/80 border-slate-200/80 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-blue-500/10 text-blue-600 rounded-2xl shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aset Ruangan</p>
            <h4 className="text-xl font-black text-slate-800">{assignedAssetsCount}</h4>
            <p className="text-[10px] text-slate-500 font-medium">Terdaftar di ruangan gedung</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-white/80 border-slate-200/80 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Aset Tanpa Ruangan</p>
            <h4 className="text-xl font-black text-slate-800">{unassignedAssetsCount}</h4>
            <p className="text-[10px] text-slate-500 font-medium">Kendaraan, pot, outdoor, dsb</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 bg-white/80 border-slate-200/80 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all">
          <div className="p-3 bg-slate-500/10 text-slate-700 rounded-2xl shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Ruangan</p>
            <h4 className="text-xl font-black text-slate-800">{roomsMeta?.total ?? roomsList.length}</h4>
            <p className="text-[10px] text-slate-500 font-medium">Ruangan gedung DPRD</p>
          </div>
        </GlassCard>
      </div>

      {/* MAIN NAVIGATION TABS: All Assets (Default) vs Rooms */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('assets')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer',
              activeTab === 'assets'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
            )}
          >
            <Package className="w-4 h-4" />
            Semua Aset Inventaris ({totalAssetsCount})
          </button>

          <button
            onClick={() => setActiveTab('rooms')}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer',
              activeTab === 'rooms'
                ? 'bg-slate-800 text-white shadow-md shadow-slate-800/20'
                : 'bg-white/60 text-slate-600 hover:bg-white hover:text-slate-900 border border-slate-200/60'
            )}
          >
            <Building2 className="w-4 h-4" />
            Daftar Ruangan Gedung ({roomsMeta?.total ?? roomsList.length})
          </button>
        </div>

        {activeTab === 'assets' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAssetSearch('')
              setSelectedRoomFilter('ALL')
              setSelectedStatusFilter('ALL')
              setAssetPage(1)
            }}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filter
          </Button>
        )}
      </div>

      {/* TAB 1: ALL ASSETS INVENTORY VIEW */}
      {activeTab === 'assets' && (
        <GlassCard className="p-0 overflow-hidden border border-white/60 bg-white/90 shadow-lg backdrop-blur-xl space-y-0">
          {/* Filter Bar */}
          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama aset, kode barang, merk/tipe, ID Pemda, atau nama ruangan..."
                value={assetSearch}
                onChange={(e) => setAssetSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Ruangan Select */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <Filter className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-500 shrink-0">Ruangan:</span>
                <select
                  value={selectedRoomFilter}
                  onChange={(e) => setSelectedRoomFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">Semua Ruangan & Outdoor</option>
                  <option value="UNASSIGNED">🚗 Tanpa Ruangan (Aset Luar / Mobil / Pot)</option>
                  <optgroup label="Daftar Ruangan Gedung">
                    {roomsList.map((r) => (
                      <option key={r.id} value={r.id}>
                        📍 [{r.code}] {r.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Filter Status Select */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
                <span className="font-semibold text-slate-500 shrink-0">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none cursor-pointer text-xs"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="OPERATIONAL">Operasional</option>
                  <option value="NEEDS_MAINTENANCE">Perlu Pemeliharaan</option>
                  <option value="DAMAGED">Rusak</option>
                </select>
              </div>

              {/* Bulk Delete Trigger */}
              {isAdmin && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsDeletingAssets(!isDeletingAssets)}
                  className={cn(
                    'h-10 text-xs font-bold rounded-xl transition-all',
                    isDeletingAssets
                      ? 'bg-rose-500 text-white hover:bg-rose-600'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  {isDeletingAssets ? 'Batal Hapus' : 'Mode Hapus Massal'}
                </Button>
              )}
            </div>
          </div>

          {/* Asset List Table */}
          {assets.isLoading ? (
            <div className="p-6">
              <ListSkeleton count={5} />
            </div>
          ) : filteredAssetsList.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="Tidak Ada Aset Ditemukan"
                description={
                  assetSearch || selectedRoomFilter !== 'ALL' || selectedStatusFilter !== 'ALL'
                    ? 'Tidak ada inventaris barang yang sesuai dengan kata kunci atau filter terpilih.'
                    : 'Belum ada data aset yang terdaftar dalam sistem.'
                }
                action={
                  isAdmin ? (
                    <Button
                      onClick={() => setShowAssetForm(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Tambah Aset Pertama
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-slate-500 uppercase tracking-wider font-bold">
                    {isDeletingAssets && <th className="p-3 w-10 text-center">#</th>}
                    <th className="py-3 px-4">Nama Aset & Merk/Tipe</th>
                    <th className="py-3 px-4">Kode & Identifikasi</th>
                    <th className="py-3 px-4">Keterangan Lokasi / Ruangan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssetsList.map((asset) => {
                    const hasRoom = !!asset.roomId || !!asset.roomName
                    return (
                      <tr
                        key={asset.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedAssetForDetail(asset)
                          setShowAssetDetailModal(true)
                        }}
                      >
                        {isDeletingAssets && (
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedAssetsToDelete.includes(asset.id)}
                              onChange={() => toggleAssetDelete(asset.id)}
                              className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4 cursor-pointer"
                            />
                          </td>
                        )}

                        {/* Nama Aset */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/50 shrink-0 group-hover:scale-105 transition-transform">
                              <Package className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs leading-snug group-hover:text-amber-600 transition-colors">
                                {asset.namaBarang}
                              </p>
                              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mt-0.5">
                                <Tag className="w-3 h-3 text-slate-400" />
                                {asset.merkType || 'Umum / Standard'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Kode & ID Pemda */}
                        <td className="py-3.5 px-4 font-mono">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-700 text-[11px]">{asset.kodeBarang}</p>
                            <p className="text-[10px] text-slate-400 font-sans">
                              ID Pemda: <span className="font-mono font-semibold text-slate-600">{asset.idpemda}</span>
                            </p>
                          </div>
                        </td>

                        {/* Keterangan Lokasi / Ruangan (Crucial User Requirement!) */}
                        <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                          {hasRoom ? (
                            <button
                              onClick={() => {
                                if (asset.roomId) {
                                  setSelectedRoomFilter(asset.roomId)
                                  toast.info(`Menampilkan aset di ruangan: ${asset.roomName ?? asset.roomCode}`)
                                }
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] font-bold hover:bg-amber-100/70 transition-all cursor-pointer"
                              title="Klik untuk menyaring aset di ruangan ini"
                            >
                              <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{asset.roomName || asset.roomCode || 'Ruangan Gedung'}</span>
                              {asset.roomCode && (
                                <span className="text-[10px] text-amber-600 font-mono">({asset.roomCode})</span>
                              )}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-bold">
                              <Car className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>Tanpa Ruangan (Aset Luar / Mobil / Pot)</span>
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <StatusBadge status={asset.status} />
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedAssetForDetail(asset)
                                setShowAssetDetailModal(true)
                              }}
                              title="Lihat Rincian Detail Aset"
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                navigate(`/dashboard/transfers?assetId=${asset.id}`)
                              }}
                              title="Ajukan Mutasi / Pindah Ruangan"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <ArrowRightLeft className="w-4 h-4" />
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setSelectedAssetsToDelete([asset.id])
                                  setShowConfirmAssetDelete(true)
                                }}
                                title="Hapus Aset"
                                className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bulk Delete Bar */}
          {isDeletingAssets && selectedAssetsToDelete.length > 0 && (
            <div className="p-3 bg-rose-50 border-t border-rose-100 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800">
                {selectedAssetsToDelete.length} aset terpilih untuk dihapus
              </span>
              <Button
                size="sm"
                onClick={() => setShowConfirmAssetDelete(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
              >
                Hapus Terpilih
              </Button>
            </div>
          )}

          {/* Pagination */}
          {assetsTotalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
              <span className="text-xs text-slate-500 font-medium">
                Halaman <span className="font-bold text-slate-800">{assetPage}</span> dari {assetsTotalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={assetPage <= 1}
                  onClick={() => setAssetPage(1)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={assetPage <= 1}
                  onClick={() => setAssetPage((p) => Math.max(1, p - 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={assetPage >= assetsTotalPages}
                  onClick={() => setAssetPage((p) => Math.min(assetsTotalPages, p + 1))}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={assetPage >= assetsTotalPages}
                  onClick={() => setAssetPage(assetsTotalPages)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* TAB 2: ROOMS LIST VIEW */}
      {activeTab === 'rooms' && (
        <GlassCard className="p-0 overflow-hidden border border-white/60 bg-white/90 shadow-lg backdrop-blur-xl space-y-0">
          <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari kode ruangan, nama ruangan, atau gedung..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-xs focus:border-amber-500"
              />
            </div>

            {isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsDeletingRooms(!isDeletingRooms)}
                className={cn(
                  'h-10 text-xs font-bold rounded-xl transition-all shrink-0',
                  isDeletingRooms
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                )}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {isDeletingRooms ? 'Batal Hapus Mode' : 'Mode Hapus Massal'}
              </Button>
            )}
          </div>

          {rooms.isLoading ? (
            <div className="p-6">
              <ListSkeleton count={5} />
            </div>
          ) : roomsList.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="Tidak Ada Ruangan Ditemukan"
                description={
                  roomSearch
                    ? 'Tidak ada ruangan yang sesuai dengan kata kunci pencarian Anda.'
                    : 'Belum ada daftar ruangan terdaftar dalam gedung DPRD.'
                }
                action={
                  isAdmin ? (
                    <Button
                      onClick={() => setShowRoomForm(true)}
                      className="bg-[#d9a416] hover:bg-[#b88b12] text-white font-extrabold rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-1.5" /> Tambah Ruangan Baru
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {roomsList.map((room) => {
                return (
                  <GlassCard
                    key={room.id}
                    className="p-4 bg-white hover:border-amber-400/60 transition-all shadow-sm hover:shadow-md cursor-pointer space-y-3 group"
                    onClick={() => {
                      setSelectedRoomFilter(room.id)
                      setActiveTab('assets')
                      toast.info(`Menampilkan aset untuk ruangan: ${room.name}`)
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                            {room.code}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 mt-1 leading-snug">
                            {room.name}
                          </h4>
                        </div>
                      </div>

                      {isDeletingRooms && (
                        <input
                          type="checkbox"
                          checked={selectedRoomsToDelete.includes(room.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            toggleRoomDelete(room.id)
                          }}
                          className="rounded text-rose-500 focus:ring-rose-500 h-4 w-4 cursor-pointer"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span className="font-medium">
                        {room.building ? room.building : 'Gedung Utama'}
                        {room.floor ? ` • Lt. ${room.floor}` : ''}
                      </span>

                      <span className="text-amber-600 font-bold text-[11px] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                        Lihat Aset &rarr;
                      </span>
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}
        </GlassCard>
      )}

      {/* MODAL FORM TAMBAH RUANGAN */}
      <RoomFormModal
        isOpen={showRoomForm}
        token={token}
        onClose={() => setShowRoomForm(false)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['rooms'] })
          setShowRoomForm(false)
          toast.success('Ruangan baru berhasil ditambahkan!')
        }}
      />

      {/* MODAL FORM TAMBAH ASET (OPTIONAL ROOM) */}
      <AssetFormModal
        isOpen={showAssetForm}
        token={token}
        initialRoomId={selectedRoomFilter !== 'ALL' && selectedRoomFilter !== 'UNASSIGNED' ? selectedRoomFilter : ''}
        rooms={roomsList}
        onClose={() => setShowAssetForm(false)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: ['assets'] })
          setShowAssetForm(false)
          toast.success('Aset baru berhasil ditambahkan!')
        }}
      />

      {/* EXPORT PICKER MODAL */}
      <ExportRoomsPickerModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        isExportingExcel={isExportingExcel}
        isExportingPdf={isExportingPdf}
      />

      {/* IMPORT EXCEL PICKER MODAL */}
      <ImportRoomPickerModal
        isOpen={showImportModal}
        rooms={roomsList}
        selectedRoomId={importRoomId}
        file={pendingImportFile}
        onSelectRoom={setImportRoomId}
        onClose={() => {
          setShowImportModal(false)
          setPendingImportFile(null)
        }}
        onConfirm={() => {
          if (pendingImportFile) {
            importAssetsMut.mutate({ roomId: importRoomId || null, file: pendingImportFile })
          }
        }}
        isImporting={importAssetsMut.isPending}
      />

      {/* ASSET DETAIL MODAL */}
      <AssetDetailModal
        isOpen={showAssetDetailModal}
        asset={selectedAssetForDetail}
        room={roomsList.find(r => r.id === selectedAssetForDetail?.roomId) ?? null}
        onClose={() => {
          setShowAssetDetailModal(false)
          setSelectedAssetForDetail(null)
        }}
        onTransferAsset={(asset) => {
          setShowAssetDetailModal(false)
          navigate(`/dashboard/transfers?assetId=${asset.id}`)
        }}
      />

      {/* DELETE CONFIRMATION MODALS */}
      <DeleteConfirmationModal
        isOpen={showConfirmRoomDelete}
        title="Hapus Ruangan Terpilih?"
        description={`Apakah Anda yakin ingin menghapus ${selectedRoomsToDelete.length} ruangan terpilih? Aset di dalam ruangan ini akan menjadi tanpa ruangan.`}
        isLoading={deleteRoomMut.isPending}
        onClose={() => setShowConfirmRoomDelete(false)}
        onConfirm={() => deleteRoomMut.mutate(selectedRoomsToDelete)}
      />

      <DeleteConfirmationModal
        isOpen={showConfirmAssetDelete}
        title="Hapus Aset Terpilih?"
        description={`Apakah Anda yakin ingin menghapus ${selectedAssetsToDelete.length} barang aset terpilih?`}
        isLoading={deleteAssetMut.isPending}
        onClose={() => setShowConfirmAssetDelete(false)}
        onConfirm={() => deleteAssetMut.mutate(selectedAssetsToDelete)}
      />
    </div>
  )
}

// ─── Modal Form Tambah Ruangan ───────────────────────────────────────────────

function RoomFormModal({
  isOpen,
  token,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  token: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [floor, setFloor] = useState('')
  const [building, setBuilding] = useState('')
  const [description, setDescription] = useState('')

  const mutation = useMutation({
    mutationFn: () => createRoom(token, { name, code, floor, building, description }),
    onSuccess: () => {
      setName('')
      setCode('')
      setFloor('')
      setBuilding('')
      setDescription('')
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-lg relative z-10"
          >
            <GlassCard className="p-6 bg-white shadow-2xl border-white/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-[#d9a416] rounded-xl shadow-inner">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Tambah Ruangan Gedung</h3>
                    <p className="text-xs text-slate-500">Daftarkan lokasi atau nama ruangan baru.</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="room-name" className="text-xs font-semibold text-slate-600">Nama Ruangan *</label>
                  <Input 
                    id="room-name"
                    placeholder="Contoh: Ruangan Paripurna" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="rounded-xl border-slate-200 focus:border-[#F9D141]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="room-code" className="text-xs font-semibold text-slate-600">Kode Ruangan *</label>
                  <Input 
                    id="room-code"
                    placeholder="Contoh: R-PRP-3" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    className="rounded-xl border-slate-200 focus:border-[#F9D141]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="room-building" className="text-xs font-semibold text-slate-600">Gedung</label>
                  <Input 
                    id="room-building"
                    placeholder="Contoh: Gedung Paripurna" 
                    value={building} 
                    onChange={(e) => setBuilding(e.target.value)} 
                    className="rounded-xl border-slate-200 focus:border-[#F9D141]/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="room-floor" className="text-xs font-semibold text-slate-600">Lantai</label>
                  <Input 
                    id="room-floor"
                    placeholder="Contoh: 3" 
                    value={floor} 
                    onChange={(e) => setFloor(e.target.value)} 
                    className="rounded-xl border-slate-200 focus:border-[#F9D141]/50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3.5 border-t border-slate-100">
                <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
                  Batal
                </Button>
                <Button 
                  onClick={() => mutation.mutate()} 
                  disabled={!name || !code || mutation.isPending} 
                  className="bg-[#d9a416] hover:bg-[#b88b12] text-white font-extrabold rounded-xl cursor-pointer"
                >
                  {mutation.isPending ? 'Menyimpan...' : 'Simpan Ruangan'}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Modal Form Tambah Aset ──────────────────────────────────────────────────

function AssetFormModal({
  isOpen,
  token,
  initialRoomId,
  rooms,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  token: string
  initialRoomId: string
  rooms: any[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [roomId, setRoomId] = useState(initialRoomId)
  const [idpemda, setIdpemda] = useState('')
  const [kodeBarang, setKodeBarang] = useState('')
  const [nomorRegister, setNomorRegister] = useState('')
  const [namaBarang, setNamaBarang] = useState('')
  const [merkType, setMerkType] = useState('')

  useEffect(() => {
    if (isOpen) {
      setRoomId(initialRoomId)
    }
  }, [isOpen, initialRoomId])

  const mutation = useMutation({
    mutationFn: () => createAsset(token, { roomId: roomId || null, idpemda, kodeBarang, nomorRegister, namaBarang, merkType }),
    onSuccess: () => {
      setIdpemda('')
      setKodeBarang('')
      setNomorRegister('')
      setNamaBarang('')
      setMerkType('')
      onSuccess()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-xl relative z-10"
          >
            <GlassCard className="p-6 bg-white shadow-2xl border-white/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl shadow-inner">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Tambah Aset Baru</h3>
                    <p className="text-xs text-slate-500">Daftarkan inventaris barang kantor atau aset luar (mobil/pot) secara manual.</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="asset-room" className="text-xs font-semibold text-slate-600">Pilih Ruangan / Lokasi (Opsional)</label>
                  <select
                    id="asset-room"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white focus:border-[#F9D141] focus:ring-[#F9D141] outline-none font-medium"
                  >
                    <option value="">🚗 Tanpa Ruangan (Aset Luar / Mobil / Pot / Umum)</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        📍 {r.code} — {r.name} {r.building ? `(${r.building})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="asset-name" className="text-xs font-semibold text-slate-600">Nama Barang *</label>
                    <Input 
                      id="asset-name"
                      placeholder="Contoh: Mobil Dinas / Pot Bunga / AC Split" 
                      value={namaBarang} 
                      onChange={(e) => setNamaBarang(e.target.value)} 
                      className="rounded-xl border-slate-200 focus:border-[#F9D141]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="asset-idpemda" className="text-xs font-semibold text-slate-600">
                      ID Pemda *
                      <HelpTooltip text="Nomor identifikasi aset milik Pemerintah Daerah" />
                    </label>
                    <Input 
                      id="asset-idpemda"
                      placeholder="Contoh: 12.01.03.04" 
                      value={idpemda} 
                      onChange={(e) => setIdpemda(e.target.value)} 
                      className="rounded-xl border-slate-200 focus:border-[#F9D141]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="asset-code" className="text-xs font-semibold text-slate-600">
                      Kode Barang *
                      <HelpTooltip text="Kode klasifikasi kategori barang inventaris" />
                    </label>
                    <Input 
                      id="asset-code"
                      placeholder="Contoh: 3.05.01.02.002" 
                      value={kodeBarang} 
                      onChange={(e) => setKodeBarang(e.target.value)} 
                      className="rounded-xl border-slate-200 focus:border-[#F9D141]/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="asset-register" className="text-xs font-semibold text-slate-600">Nomor Register *</label>
                    <Input 
                      id="asset-register"
                      placeholder="Contoh: 0041" 
                      value={nomorRegister} 
                      onChange={(e) => setNomorRegister(e.target.value)} 
                      className="rounded-xl border-slate-200 focus:border-[#F9D141]/50"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label htmlFor="asset-merk" className="text-xs font-semibold text-slate-600">Merk & Tipe *</label>
                    <Input 
                      id="asset-merk"
                      placeholder="Contoh: Toyota Pajero / Keramik Hias / Daikin" 
                      value={merkType} 
                      onChange={(e) => setMerkType(e.target.value)} 
                      className="rounded-xl border-slate-200 focus:border-[#F9D141]/50"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3.5 border-t border-slate-100">
                <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
                  Batal
                </Button>
                <Button 
                  onClick={() => mutation.mutate()} 
                  disabled={!idpemda || !kodeBarang || !nomorRegister || !namaBarang || !merkType || mutation.isPending} 
                  className="bg-[#d9a416] hover:bg-[#b88b12] text-white font-extrabold rounded-xl cursor-pointer"
                >
                  {mutation.isPending ? 'Menyimpan...' : 'Simpan Aset'}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Modal Import Excel Picker ───────────────────────────────────────────────

function ImportRoomPickerModal({
  isOpen,
  rooms,
  selectedRoomId,
  file,
  onSelectRoom,
  onClose,
  onConfirm,
  isImporting,
}: {
  isOpen: boolean
  rooms: Room[]
  selectedRoomId: string
  file: File | null
  onSelectRoom: (roomId: string) => void
  onClose: () => void
  onConfirm: () => void
  isImporting: boolean
}) {
  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md relative z-10"
          >
            <GlassCard className="p-6 bg-white shadow-2xl border-white/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Import Excel Aset</h3>
                    <p className="text-xs text-slate-500">Pilih lokasi rujukan aset (opsional).</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-1.5 text-gray-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {file && (
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Pilih Ruangan Tujuan (Opsional)</label>
                <select
                  value={selectedRoomId}
                  onChange={(e) => onSelectRoom(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 outline-none focus:border-amber-500"
                >
                  <option value="">🚗 Tanpa Ruangan (Aset Luar / Mobil / Pot / Umum)</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      📍 {r.code} — {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <Button variant="secondary" onClick={onClose} disabled={isImporting}>
                  Batal
                </Button>
                <Button
                  onClick={onConfirm}
                  disabled={isImporting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                >
                  {isImporting ? 'Mengimport...' : 'Mulai Import'}
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function ExportRoomsPickerModal({
  isOpen,
  onExportExcel,
  onExportPdf,
  onClose,
  isExportingExcel,
  isExportingPdf,
}: {
  isOpen: boolean
  onExportExcel: () => void
  onExportPdf: () => void
  onClose: () => void
  isExportingExcel: boolean
  isExportingPdf: boolean
}) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#d9a416]">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Export Data Fasilitas</h3>
                  <p className="text-[11px] text-slate-400">Pilih format dokumen untuk diunduh</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onExportExcel()
                  onClose()
                }}
                disabled={isExportingExcel || isExportingPdf}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-center cursor-pointer group"
              >
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Format Excel</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Multi-sheet lengkap</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  onExportPdf()
                  onClose()
                }}
                disabled={isExportingExcel || isExportingPdf}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-slate-100 hover:border-rose-200 hover:bg-rose-50/50 transition-all text-center cursor-pointer group"
              >
                <div className="p-3 rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Format PDF</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Siap cetak & rapi</p>
                </div>
              </motion.button>
            </div>

            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full rounded-xl text-slate-500 hover:bg-slate-50 border-slate-200 font-semibold"
            >
              Batal
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Modal Detail Aset & Ruangan ─────────────────────────────────────────────

function AssetDetailModal({
  isOpen,
  asset,
  room,
  onClose,
  onTransferAsset,
}: {
  isOpen: boolean
  asset: Asset | null
  room: Room | null
  onClose: () => void
  onTransferAsset?: (asset: Asset) => void
}) {
  if (typeof document === 'undefined' || !asset) return null

  const formattedDate = asset.createdAt
    ? new Date(asset.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-'

  const hasRoom = !!room || !!asset.roomName || !!asset.roomId

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-white shadow-2xl border border-slate-100/90 max-h-[90vh] flex flex-col z-10"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-[#F9D141] via-amber-400 to-[#d9a416]" />

            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-200/50 shadow-sm">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Detail Inventaris Aset</h3>
                  <p className="text-xs text-slate-400 font-medium">Informasi spesifikasi barang dan lokasi ruangan</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              <div className="rounded-2xl bg-gradient-to-br from-amber-500/5 via-slate-50 to-amber-500/10 p-4 border border-amber-200/40">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      <Tag className="w-3 h-3" />
                      {asset.merkType || 'Umum / Standard'}
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-800 leading-snug pt-1">
                      {asset.namaBarang}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 pt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ID Pemda:{' '}
                      <span className="font-bold text-slate-700 font-mono">{asset.idpemda}</span>
                    </p>
                  </div>
                  <div className="self-start">
                    <StatusBadge status={asset.status} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-[#d9a416]" />
                  Spesifikasi & Identifikasi
                </h5>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Kode Barang</p>
                    <p className="text-xs font-bold text-slate-800 font-mono truncate" title={asset.kodeBarang}>
                      {asset.kodeBarang}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Nomor Register</p>
                    <p className="text-xs font-bold text-slate-800 font-mono truncate" title={asset.nomorRegister}>
                      {asset.nomorRegister}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Merk / Tipe</p>
                    <p className="text-xs font-bold text-slate-800 truncate" title={asset.merkType}>
                      {asset.merkType || '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase">Tanggal Registrasi</p>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{formattedDate}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Room & Location Details Card */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#d9a416]" />
                  Lokasi & Ruangan Terdaftar
                </h5>
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2.5">
                  {hasRoom ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 bg-amber-50 text-[#d9a416] rounded-lg shrink-0">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {room?.name ?? asset.roomName ?? 'Ruangan Terdaftar'}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500">
                            Kode: <span className="font-mono font-bold text-slate-700">{room?.code ?? asset.roomCode ?? '-'}</span>
                          </p>
                        </div>
                      </div>
                      {(room?.building || room?.floor) && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                            {room?.building ?? 'Gedung Utama'}
                            {room?.floor ? ` • Lt. ${room.floor}` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">Tanpa Ruangan (Aset Luar / Mobil / Pot)</p>
                        <p className="text-[11px] text-slate-500">Barang ini tidak terikat pada ruangan gedung tertentu.</p>
                      </div>
                    </div>
                  )}

                  {room?.description && (
                    <p className="text-xs text-slate-500 bg-white/70 rounded-xl p-2.5 border border-slate-100 leading-relaxed">
                      {room.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onTransferAsset && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9 text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 rounded-xl flex-1 sm:flex-initial cursor-pointer"
                    onClick={() => onTransferAsset(asset)}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                    Ajukan Mutasi Ruangan
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-9 px-4 text-xs font-bold rounded-xl w-full sm:w-auto cursor-pointer"
                onClick={onClose}
              >
                Tutup
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
