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
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Tag,
  ShieldCheck,
  Calendar,
  ArrowRightLeft,
  AlertTriangle,
  Hash,
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
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
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

  // Search/Filters states
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
  }, [assetSearch, selectedRoom])

  // Import Excel state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importRoomId, setImportRoomId] = useState<string>('')
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const headerImportInputRef = useRef<HTMLInputElement>(null)

  const rooms = useQuery({ 
    queryKey: ['rooms', roomSearch, roomPage], 
    queryFn: () => fetchRooms(token, { limit: 10, page: roomPage, search: roomSearch.trim() || undefined }) 
  })
  
  const assets = useQuery({
    queryKey: ['assets', selectedRoom, assetSearch, assetPage],
    queryFn: () => fetchAssets(token, { 
      roomId: selectedRoom ?? undefined, 
      limit: 10, 
      page: assetPage,
      search: assetSearch.trim() || undefined
    }),
    enabled: !!selectedRoom,
  })

  const roomsList = rooms.data?.data ?? []
  const roomsMeta = rooms.data?.meta
  const roomsTotalPages = roomsMeta ? Math.ceil(roomsMeta.total / roomsMeta.limit) : 1

  const assetsList = assets.data?.data ?? []
  const assetsMeta = assets.data?.meta
  const assetsTotalPages = assetsMeta ? Math.ceil(assetsMeta.total / assetsMeta.limit) : 1

  // Selected Room Object Helper
  const selectedRoomObj = useMemo(() => {
    return roomsList.find((r) => r.id === selectedRoom)
  }, [roomsList, selectedRoom])

  const deleteRoomMut = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map(id => deleteRoom(token, id)))
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rooms'] })
      setSelectedRoomsToDelete([])
      setIsDeletingRooms(false)
      setShowConfirmRoomDelete(false)
      setSelectedRoom(null)
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
    mutationFn: ({ roomId, file }: { roomId: string; file: File }) =>
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
    if (selectedRoom) {
      importAssetsMut.mutate({ roomId: selectedRoom, file })
    } else {
      setPendingImportFile(file)
      setImportRoomId(rooms.data?.data?.[0]?.id ?? '')
      setShowImportModal(true)
    }
  }



  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const handleExportExcel = async () => {
    setIsExportingExcel(true)
    try {
      await toast.promise(exportRoomsExcel(token), {
        loading: 'Sedang mengekspor data ruangan ke Excel...',
        success: 'File Excel berhasil diunduh!',
        error: 'Gagal mengekspor data ke Excel.',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleExportPdf = async () => {
    setIsExportingPdf(true)
    try {
      await toast.promise(exportRoomsPdf(token), {
        loading: 'Sedang mengekspor data ruangan ke PDF...',
        success: 'File PDF berhasil diunduh!',
        error: 'Gagal mengekspor data ke PDF.',
      })
    } catch (err) {
      console.error(err)
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleConfirmImport = () => {
    if (!pendingImportFile || !importRoomId) {
      toast.error('Pilih ruangan terlebih dahulu')
      return
    }
    importAssetsMut.mutate({ roomId: importRoomId, file: pendingImportFile })
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Fasilitas & Ruangan' }]} />
      <PageHeader
        title="Fasilitas & Ruangan DPRD"
        description="Daftar ruangan dan fasilitas yang tersedia untuk pelaporan dan inventarisasi."
        action={isAdmin ? (
          <div className="flex flex-wrap items-center gap-2">
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Button
                variant="secondary"
                onClick={() => setShowExportModal(true)}
                disabled={isExportingExcel || isExportingPdf}
                title="Export data ruangan & aset ke Excel atau PDF"
                className="gap-1.5 h-10 px-3.5 border-slate-200 text-slate-700 bg-white/70 hover:bg-white hover:shadow-md transition-all duration-200 font-semibold rounded-xl text-xs cursor-pointer"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                Export Data
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Button
                variant="secondary"
                onClick={() => downloadTemplateMut.mutate()}
                disabled={downloadTemplateMut.isPending}
                title="Download template Excel untuk import aset"
                className="gap-1.5 h-10 px-3.5 border-slate-200 text-slate-700 bg-white/70 hover:bg-white hover:shadow-md transition-all duration-200 font-semibold rounded-xl text-xs cursor-pointer"
              >
                <motion.div whileHover={{ y: 2 }} transition={{ repeat: Infinity, duration: 0.8, repeatType: "reverse" }}>
                  <Download className="h-4 w-4 text-[#d9a416]" />
                </motion.div>
                Download Template
              </Button>
            </motion.div>

            <input
              ref={headerImportInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleHeaderImportFileChange}
            />
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Button
                variant="secondary"
                onClick={() => headerImportInputRef.current?.click()}
                disabled={importAssetsMut.isPending}
                title="Import aset dari file Excel"
                className="gap-1.5 h-10 px-3.5 border-slate-200 text-slate-700 bg-white/70 hover:bg-white hover:shadow-md transition-all duration-200 font-semibold rounded-xl text-xs cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                {importAssetsMut.isPending ? 'Mengimport...' : 'Import Excel'}
              </Button>
            </motion.div>

            {/* Tombol Tambah Aset Manual */}
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Button
                variant="secondary"
                onClick={() => setShowAssetForm(true)}
                title="Tambah aset baru secara manual"
                className="gap-1.5 h-10 px-3.5 border-slate-200 text-slate-700 bg-white/70 hover:bg-white hover:shadow-md transition-all duration-200 font-semibold rounded-xl text-xs cursor-pointer"
              >
                <Plus className="h-4 w-4 text-amber-500" />
                Tambah Aset
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Button 
                onClick={() => setShowRoomForm(true)} 
                className="gap-1.5 h-10 px-4 bg-[#d9a416] hover:bg-[#b88b12] text-white shadow-md hover:shadow-lg transition-all duration-200 font-extrabold rounded-xl text-xs cursor-pointer"
              >
                <Plus className="h-4 w-4 text-white" /> Tambah Ruangan
              </Button>
            </motion.div>
          </div>
        ) : undefined}
      />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start"
      >
        {/* Left Column: Ruangan */}
        <GlassCard className="p-0 overflow-hidden border border-white/40 bg-white/80 shadow-md backdrop-blur-xl">
          {/* Header Panel Ruangan */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#d9a416]" />
              <span className="font-bold text-slate-700 text-sm">Daftar Ruangan ({roomsMeta?.total ?? roomsList.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isAdmin && !isDeletingRooms && rooms.data?.data && rooms.data.data.length > 0 && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsDeletingRooms(true)} 
                  className="h-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 text-xs font-bold rounded-lg cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                </Button>
              )}
              {isAdmin && isDeletingRooms && (
                <>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => { setIsDeletingRooms(false); setSelectedRoomsToDelete([]); }} 
                    className="h-8 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => setShowConfirmRoomDelete(true)} 
                    disabled={selectedRoomsToDelete.length === 0} 
                    className="h-8 text-xs font-bold rounded-lg px-2.5 cursor-pointer"
                  >
                    Hapus Terpilih ({selectedRoomsToDelete.length})
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Search Ruangan */}
          <div className="p-3 border-b border-slate-100 bg-white/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari kode, nama ruangan, atau gedung..."
                className="pl-9 h-9 text-xs rounded-lg border-slate-200 focus:border-[#F9D141]/50 bg-white transition-all focus:ring-2 focus:ring-[#F9D141]/20"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List Ruangan */}
          {rooms.isLoading ? (
            <div className="p-4"><ListSkeleton count={5} /></div>
          ) : !roomsList.length ? (
            <div className="py-12"><EmptyState title="Tidak ada ruangan" description={roomSearch ? "Kriteria pencarian Anda tidak cocok" : undefined} /></div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto relative">
              {roomsList.map((r, index) => {
                const isSelected = selectedRoom === r.id && !isDeletingRooms
                return (
                  <motion.li
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.03 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.99 }}
                    role="button"
                    tabIndex={0}
                    aria-selected={selectedRoom === r.id}
                    className={cn(
                      'group relative flex cursor-pointer items-center justify-between px-4 py-3.5 transition-colors duration-200 focus:outline-none',
                      isSelected
                        ? 'bg-gradient-to-r from-[#F9D141]/15 to-[#F9D141]/5 pl-4'
                        : 'hover:bg-slate-50/80'
                    )}
                    onClick={() => {
                      if (isDeletingRooms) {
                        toggleRoomDelete(r.id)
                      } else {
                        setSelectedRoom(r.id)
                        setAssetSearch('')
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        if (isDeletingRooms) {
                          toggleRoomDelete(r.id)
                        } else {
                          setSelectedRoom(r.id)
                          setAssetSearch('')
                        }
                      }
                    }}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="activeRoomPill"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-[#d9a416] rounded-r-md shadow-sm"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                    <div className="flex items-center gap-3 min-w-0">
                      {isAdmin && isDeletingRooms && (
                        <input 
                          type="checkbox" 
                          checked={selectedRoomsToDelete.includes(r.id)} 
                          onChange={() => toggleRoomDelete(r.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-slate-300 text-[#d9a416] focus:ring-[#F9D141] cursor-pointer"
                        />
                      )}
                      <motion.div 
                        whileHover={{ scale: 1.12, rotate: 6 }} 
                        className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all shrink-0"
                      >
                        <Building2 className="w-4 h-4 text-[#d9a416]" />
                      </motion.div>
                      <div className="min-w-0">
                        <p className={cn('font-bold text-sm truncate', isSelected ? 'text-[#d9a416]' : 'text-slate-800')}>
                          {r.code}
                        </p>
                        <p className="text-xs text-slate-500 truncate font-semibold">{r.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {r.building && (
                        <span className="bg-slate-100 border border-slate-200/60 text-slate-600 px-1.5 py-0.5 rounded text-[10px] font-bold max-w-[85px] truncate">
                          {r.building}
                        </span>
                      )}
                      {r.floor && (
                        <span className="bg-amber-50 border border-amber-100 text-[#d9a416] px-1.5 py-0.5 rounded text-[10px] font-bold">
                          Lt {r.floor}
                        </span>
                      )}
                    </div>
                  </motion.li>
                )
              })}
            </ul>
          )}

            <div className="flex items-center justify-between border-t border-slate-200/50 pt-3 mt-3 px-1">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                Hal {roomPage} dari {Math.max(1, roomsTotalPages)}
              </span>
              <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
                <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200 cursor-pointer" disabled={roomPage === 1} onClick={() => setRoomPage(1)}>
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200 cursor-pointer" disabled={roomPage === 1} onClick={() => setRoomPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                
                <select 
                  value={roomPage}
                  onChange={(e) => setRoomPage(Number(e.target.value))}
                  className="mx-1 h-8 px-1 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none cursor-pointer disabled:opacity-50"
                  disabled={roomsTotalPages <= 1}
                >
                  {Array.from({ length: Math.max(1, roomsTotalPages) }, (_, i) => i + 1).map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200 cursor-pointer" disabled={roomPage >= roomsTotalPages} onClick={() => setRoomPage(p => Math.min(roomsTotalPages, p + 1))}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200 cursor-pointer" disabled={roomPage >= roomsTotalPages} onClick={() => setRoomPage(Math.max(1, roomsTotalPages))}>
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
        </GlassCard>

        {/* Right Column: Aset */}
        <GlassCard className="p-0 overflow-hidden border border-white/40 bg-white/80 shadow-md backdrop-blur-xl">
          {/* Header Panel Aset */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-[#d9a416]" />
              <span className="font-bold text-slate-700 text-sm">
                Aset Ruangan {selectedRoomObj ? `(${selectedRoomObj.code})` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {isAdmin && selectedRoom && !isDeletingAssets && assets.data?.data && assets.data.data.length > 0 && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsDeletingAssets(true)} 
                  className="h-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold rounded-lg cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                </Button>
              )}
              {isAdmin && selectedRoom && isDeletingAssets && (
                <>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => { setIsDeletingAssets(false); setSelectedAssetsToDelete([]); }} 
                    className="h-8 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Batal
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => setShowConfirmAssetDelete(true)} 
                    disabled={selectedAssetsToDelete.length === 0} 
                    className="h-8 text-xs font-bold rounded-lg px-2.5 cursor-pointer"
                  >
                    Hapus Terpilih ({selectedAssetsToDelete.length})
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Search/View Aset */}
          {!selectedRoom ? (
            <div className="py-24 text-center">
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                className="mx-auto w-14 h-14 rounded-2xl bg-amber-50 text-[#d9a416] border border-amber-100/80 shadow-md flex items-center justify-center mb-4"
              >
                <ArrowRight className="w-6 h-6 -rotate-45" />
              </motion.div>
              <h4 className="text-sm font-bold text-slate-700">Pilih Ruangan Terlebih Dahulu</h4>
              <p className="text-xs text-slate-400 max-w-[280px] mx-auto mt-1 leading-relaxed">
                Silakan pilih salah satu ruangan di daftar sebelah kiri untuk melihat, mengimport, atau menambahkan inventaris aset.
              </p>
            </div>
          ) : (
            <>
              {/* Search Aset */}
              <div className="p-3 border-b border-slate-100 bg-white/50">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Cari nama barang, kode, merk, atau nomor register..."
                    className="pl-9 h-9 text-xs rounded-lg border-slate-200 focus:border-[#F9D141]/50 bg-white transition-all focus:ring-2 focus:ring-[#F9D141]/20"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* List Aset */}
              {assets.isLoading ? (
                <div className="p-4"><ListSkeleton count={4} /></div>
              ) : !assetsList.length ? (
                <div className="py-12">
                  <EmptyState 
                    title="Tidak ada aset" 
                    description={assetSearch ? "Kriteria pencarian Anda tidak cocok" : "Belum ada inventaris terdaftar di ruangan ini"} 
                  />
                </div>
              ) : (
                <motion.ul 
                  key={selectedRoom ?? 'no-room'}
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: {
                      opacity: 1,
                      transition: { staggerChildren: 0.05 }
                    }
                  }}
                  className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto"
                >
                  {assetsList.map((a) => (
                    <motion.li 
                      key={a.id} 
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        show: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ y: -2, backgroundColor: isDeletingAssets ? 'rgba(254, 242, 242, 0.5)' : 'rgba(248, 250, 252, 0.95)' }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "group flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3.5 transition-all gap-3 rounded-xl mx-1 my-0.5 border border-transparent cursor-pointer",
                        isDeletingAssets 
                          ? "hover:bg-rose-50/30 hover:border-rose-200/50" 
                          : "hover:border-[#F9D141]/40 hover:shadow-sm"
                      )}
                      onClick={() => {
                        if (isDeletingAssets) {
                          toggleAssetDelete(a.id)
                        } else {
                          setSelectedAssetForDetail(a)
                          setShowAssetDetailModal(true)
                        }
                      }}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {isAdmin && isDeletingAssets && (
                          <input 
                            type="checkbox" 
                            checked={selectedAssetsToDelete.includes(a.id)} 
                            onChange={() => toggleAssetDelete(a.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-4 w-4 rounded border-slate-300 text-[#d9a416] focus:ring-[#F9D141] cursor-pointer mt-1"
                          />
                        )}
                        <motion.div 
                          whileHover={{ scale: 1.15, rotate: 10 }}
                          className="p-2 bg-amber-500/10 text-amber-600 rounded-xl mt-0.5 shrink-0 group-hover:bg-[#F9D141]/25 transition-colors"
                        >
                          <Package className="w-4 h-4" />
                        </motion.div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-slate-800 text-sm truncate group-hover:text-amber-700 transition-colors">
                              {a.namaBarang}
                            </p>
                            <span className="text-[10px] text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity font-semibold hidden sm:inline">
                              • Klik untuk detail
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1 text-[10px] text-slate-500 font-bold">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/40">Kode: {a.kodeBarang}</span>
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/40">Reg: {a.nomorRegister}</span>
                            {a.merkType && (
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/40 truncate max-w-[150px]" title={a.merkType}>
                                {a.merkType}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold">ID Pemda: {a.idpemda}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <StatusBadge status={a.status} />
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}

              <div className="flex items-center justify-between border-t border-slate-200/50 pt-3 mt-4 px-1">
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                  Hal {assetPage} dari {Math.max(1, assetsTotalPages)}
                </span>
                <div className="flex items-center gap-1 w-full sm:w-auto justify-between sm:justify-end">
                  <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200 cursor-pointer" disabled={assetPage === 1} onClick={() => setAssetPage(1)}>
                    <ChevronsLeft className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200 cursor-pointer" disabled={assetPage === 1} onClick={() => setAssetPage(p => Math.max(1, p - 1))}>
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  
                  <select 
                    value={assetPage}
                    onChange={(e) => setAssetPage(Number(e.target.value))}
                    className="mx-1 h-8 px-1 bg-white border border-slate-200 rounded-lg text-xs font-medium outline-none cursor-pointer disabled:opacity-50"
                    disabled={assetsTotalPages <= 1}
                  >
                    {Array.from({ length: Math.max(1, assetsTotalPages) }, (_, i) => i + 1).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>

                  <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200 cursor-pointer" disabled={assetPage >= assetsTotalPages} onClick={() => setAssetPage(p => Math.min(assetsTotalPages, p + 1))}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="secondary" size="sm" className="px-1.5 h-8 border-slate-200 cursor-pointer" disabled={assetPage >= assetsTotalPages} onClick={() => setAssetPage(Math.max(1, assetsTotalPages))}>
                    <ChevronsRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </GlassCard>
      </motion.div>

      {/* Room Creation Modal Form */}
      <RoomFormModal
        isOpen={showRoomForm}
        token={token}
        onClose={() => setShowRoomForm(false)}
        onSuccess={() => { 
          qc.invalidateQueries({ queryKey: ['rooms'] })
          setShowRoomForm(false)
          toast.success('Ruangan berhasil ditambahkan') 
        }}
      />

      {/* Asset Creation Modal Form */}
      <AssetFormModal
        isOpen={showAssetForm}
        token={token}
        initialRoomId={selectedRoom || ''}
        rooms={rooms.data?.data ?? []}
        onClose={() => setShowAssetForm(false)}
        onSuccess={() => { 
          qc.invalidateQueries({ queryKey: ['assets'] })
          setShowAssetForm(false)
          toast.success('Aset berhasil ditambahkan') 
        }}
      />

      {/* Modal pilih ruangan saat import dari header tanpa ruangan dipilih */}
      <ImportRoomPickerModal
        isOpen={showImportModal}
        rooms={rooms.data?.data ?? []}
        selectedRoomId={importRoomId}
        fileName={pendingImportFile?.name ?? ''}
        isLoading={importAssetsMut.isPending}
        onSelectRoom={setImportRoomId}
        onConfirm={handleConfirmImport}
        onClose={() => {
          setShowImportModal(false)
          setPendingImportFile(null)
          setImportRoomId('')
          if (headerImportInputRef.current) headerImportInputRef.current.value = ''
        }}
      />

      {/* Confirmation Modals */}
      <DeleteConfirmationModal
        isOpen={showConfirmRoomDelete}
        onClose={() => setShowConfirmRoomDelete(false)}
        onConfirm={() => deleteRoomMut.mutate(selectedRoomsToDelete)}
        title="Hapus Ruangan"
        description={`Apakah Anda yakin ingin menghapus ${selectedRoomsToDelete.length} ruangan yang dipilih? Semua aset di dalamnya juga akan terhapus secara permanen.`}
        isLoading={deleteRoomMut.isPending}
      />

      <DeleteConfirmationModal
        isOpen={showConfirmAssetDelete}
        onClose={() => setShowConfirmAssetDelete(false)}
        onConfirm={() => deleteAssetMut.mutate(selectedAssetsToDelete)}
        title="Hapus Aset"
        description={`Apakah Anda yakin ingin menghapus ${selectedAssetsToDelete.length} aset yang dipilih secara permanen?`}
        isLoading={deleteAssetMut.isPending}
      />

      {/* Export Format Picker Modal */}
      <ExportRoomsPickerModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        isExportingExcel={isExportingExcel}
        isExportingPdf={isExportingPdf}
      />

      {/* Asset Detail Pop-up Modal */}
      <AssetDetailModal
        isOpen={showAssetDetailModal}
        asset={selectedAssetForDetail}
        room={selectedRoomObj ?? null}
        onClose={() => {
          setShowAssetDetailModal(false)
          setSelectedAssetForDetail(null)
        }}
        onReportIssue={(asset, room) => {
          setShowAssetDetailModal(false)
          setSelectedAssetForDetail(null)
          navigate(`/dashboard/reports?openForm=true&roomId=${room?.id || asset.roomId}&assetId=${asset.id}`)
        }}
        onTransferAsset={(asset, room) => {
          setShowAssetDetailModal(false)
          setSelectedAssetForDetail(null)
          navigate(`/dashboard/asset-transfers?roomId=${room?.id || asset.roomId}&assetId=${asset.id}`)
        }}
      />
    </div>
  )
}

// ─── Modal pilih ruangan untuk import ────────────────────────────────────────

function ImportRoomPickerModal({
  isOpen,
  rooms,
  selectedRoomId,
  fileName,
  isLoading,
  onSelectRoom,
  onConfirm,
  onClose,
}: {
  isOpen: boolean
  rooms: Room[]
  selectedRoomId: string
  fileName: string
  isLoading: boolean
  onSelectRoom: (id: string) => void
  onConfirm: () => void
  onClose: () => void
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
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#d9a416]">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800">Import Aset Excel</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[200px]" title={fileName}>{fileName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Pilih ruangan */}
            <div className="space-y-1.5 mb-4">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Pilih Ruangan Tujuan *
              </label>
              {rooms.length === 0 ? (
                <p className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
                  Belum ada ruangan. Buat ruangan dulu sebelum import.
                </p>
              ) : (
                <select
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#F9D141] focus:ring-4 focus:ring-[#F9D141]/10 focus:outline-none transition-all font-semibold"
                  value={selectedRoomId}
                  onChange={(e) => onSelectRoom(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">— Pilih ruangan —</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.code} — {r.name} {r.building ? `(${r.building})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <p className="text-[10px] leading-relaxed text-slate-400 font-medium bg-slate-50 border border-slate-100 rounded-lg p-2.5">
              💡 <strong>Catatan:</strong> Pastikan header kolom wajib di file Excel Anda adalah: <code className="bg-slate-200 px-1 rounded font-bold text-slate-700">idpemda</code>,{' '}
              <code className="bg-slate-200 px-1 rounded font-bold text-slate-700">kode_barang</code>,{' '}
              <code className="bg-slate-200 px-1 rounded font-bold text-slate-700">nomor_register</code>,{' '}
              <code className="bg-slate-200 px-1 rounded font-bold text-slate-700">nama_barang</code>, dan{' '}
              <code className="bg-slate-200 px-1 rounded font-bold text-slate-700">merk_type</code>.
            </p>

            {/* Actions */}
            <div className="mt-5 flex gap-3 border-t border-slate-100 pt-3.5 justify-end">
              <Button
                variant="secondary"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading || !selectedRoomId || rooms.length === 0}
                className="bg-[#F9D141] hover:bg-[#d9a416] text-white"
              >
                {isLoading ? 'Mengimport...' : 'Import Sekarang'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}



// ─── Modal Form Tambah Ruangan ──────────────────────────────────────────────────────

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
  const [building, setBuilding] = useState('')
  const [floor, setFloor] = useState('')

  const mutation = useMutation({
    mutationFn: () => createRoom(token, { name, code, building, floor }),
    onSuccess: () => {
      setName('')
      setCode('')
      setBuilding('')
      setFloor('')
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
                    <h3 className="text-base font-bold text-slate-800">Tambah Ruangan Baru</h3>
                    <p className="text-xs text-slate-500">Lengkapi kolom untuk membuat ruangan baru.</p>
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
                <div className="space-y-1.5">
                  <label htmlFor="room-name" className="text-xs font-semibold text-slate-600">Nama Ruangan *</label>
                  <Input 
                    id="room-name"
                    placeholder="Contoh: Ruang Rapat Paripurna" 
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
    mutationFn: () => createAsset(token, { roomId, idpemda, kodeBarang, nomorRegister, namaBarang, merkType }),
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
                    <p className="text-xs text-slate-500">Daftarkan inventaris barang baru secara manual.</p>
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
                  <label htmlFor="asset-room" className="text-xs font-semibold text-slate-600">Pilih Ruangan *</label>
                  <select
                    id="asset-room"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full text-sm py-2 px-3 rounded-xl border border-slate-200 bg-white focus:border-[#F9D141] focus:ring-[#F9D141] outline-none"
                  >
                    <option value="" disabled>— Pilih ruangan —</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code} — {r.name} {r.building ? `(${r.building})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="asset-name" className="text-xs font-semibold text-slate-600">Nama Barang *</label>
                  <Input 
                    id="asset-name"
                    placeholder="Contoh: AC Split 2 PK" 
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
                    placeholder="Contoh: Daikin Inverter Smile" 
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
                  disabled={!roomId || !idpemda || !kodeBarang || !nomorRegister || !namaBarang || !merkType || mutation.isPending} 
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
            {/* Header */}
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

            {/* Selection Grid */}
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

            {/* Footer */}
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
  onReportIssue,
  onTransferAsset,
}: {
  isOpen: boolean
  asset: Asset | null
  room: Room | null
  onClose: () => void
  onReportIssue?: (asset: Asset, room: Room | null) => void
  onTransferAsset?: (asset: Asset, room: Room | null) => void
}) {
  if (typeof document === 'undefined' || !asset) return null

  const formattedDate = asset.createdAt
    ? new Date(asset.createdAt).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '-'

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
            {/* Ambient Gold Gradient Top Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#F9D141] via-amber-400 to-[#d9a416]" />

            {/* Header */}
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

            {/* Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Asset Hero Card */}
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

              {/* Technical Specifications Grid */}
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

                  {room?.description && (
                    <p className="text-xs text-slate-500 bg-white/70 rounded-xl p-2.5 border border-slate-100 leading-relaxed">
                      {room.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Quick Actions */}
            <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onReportIssue && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9 text-xs font-bold border border-amber-300/80 bg-amber-50/60 text-amber-800 hover:bg-amber-100/70 rounded-xl flex-1 sm:flex-initial cursor-pointer"
                    onClick={() => onReportIssue(asset, room)}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                    Laporkan Masalah
                  </Button>
                )}
                {onTransferAsset && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="h-9 text-xs font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 rounded-xl flex-1 sm:flex-initial cursor-pointer"
                    onClick={() => onTransferAsset(asset, room)}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                    Ajukan Mutasi
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
