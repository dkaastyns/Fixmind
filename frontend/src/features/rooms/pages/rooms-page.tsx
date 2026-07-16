/* eslint-disable react-hooks/set-state-in-effect */
import { useRef, useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [showAssetForm, setShowAssetForm] = useState(false)

  const [isDeletingRooms, setIsDeletingRooms] = useState(false)
  const [isDeletingAssets, setIsDeletingAssets] = useState(false)

  const [selectedRoomsToDelete, setSelectedRoomsToDelete] = useState<string[]>([])
  const [selectedAssetsToDelete, setSelectedAssetsToDelete] = useState<string[]>([])
  
  const [showConfirmRoomDelete, setShowConfirmRoomDelete] = useState(false)
  const [showConfirmAssetDelete, setShowConfirmAssetDelete] = useState(false)

  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') ?? ''

  // Search/Filters states
  const [roomSearch, setRoomSearch] = useState(initialSearch)
  const [assetSearch, setAssetSearch] = useState(initialSearch)

  useEffect(() => {
    const q = searchParams.get('search') ?? ''
    setRoomSearch(q)
    setAssetSearch(q)
  }, [searchParams])

  // Import Excel state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importRoomId, setImportRoomId] = useState<string>('')
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const headerImportInputRef = useRef<HTMLInputElement>(null)

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token) })
  
  const assets = useQuery({
    queryKey: ['assets', selectedRoom],
    queryFn: () => fetchAssets(token, { roomId: selectedRoom ?? undefined, limit: 200 }),
    enabled: !!selectedRoom,
  })

  // Selected Room Object Helper
  const selectedRoomObj = useMemo(() => {
    return rooms.data?.data.find((r) => r.id === selectedRoom)
  }, [rooms.data?.data, selectedRoom])

  // Filtered rooms list based on search
  const filteredRooms = useMemo(() => {
    const list = rooms.data?.data ?? []
    if (!roomSearch.trim()) return list
    const q = roomSearch.toLowerCase()
    return list.filter((r) => 
      r.code.toLowerCase().includes(q) || 
      r.name.toLowerCase().includes(q) ||
      (r.building && r.building.toLowerCase().includes(q))
    )
  }, [rooms.data?.data, roomSearch])

  // Filtered assets list based on search
  const filteredAssets = useMemo(() => {
    const list = assets.data?.data ?? []
    if (!assetSearch.trim()) return list
    const q = assetSearch.toLowerCase()
    return list.filter((a) => 
      a.namaBarang.toLowerCase().includes(q) || 
      a.kodeBarang.toLowerCase().includes(q) ||
      a.nomorRegister.toLowerCase().includes(q) ||
      (a.merkType && a.merkType.toLowerCase().includes(q)) ||
      a.idpemda.toLowerCase().includes(q)
    )
  }, [assets.data?.data, assetSearch])

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
            <Button
              variant="secondary"
              onClick={() => downloadTemplateMut.mutate()}
              disabled={downloadTemplateMut.isPending}
              title="Download template Excel untuk import aset"
              className="gap-1.5 h-10 px-3.5 border-slate-200 text-slate-700 bg-white/70 hover:bg-slate-50 transition-all font-semibold rounded-xl text-xs"
            >
              <Download className="h-4 w-4 text-[#d9a416]" />
              Download Template
            </Button>

            <input
              ref={headerImportInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleHeaderImportFileChange}
            />
            <Button
              variant="secondary"
              onClick={() => headerImportInputRef.current?.click()}
              disabled={importAssetsMut.isPending}
              title="Import aset dari file Excel"
              className="gap-1.5 h-10 px-3.5 border-slate-200 text-slate-700 bg-white/70 hover:bg-slate-50 transition-all font-semibold rounded-xl text-xs"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              {importAssetsMut.isPending ? 'Mengimport...' : 'Import Excel'}
            </Button>

            {/* Tombol Tambah Aset Manual */}
            <Button
              variant="secondary"
              onClick={() => {
                if (!selectedRoom) {
                  toast.error('Pilih ruangan terlebih dahulu di daftar sebelah kiri untuk menambah aset.')
                  return
                }
                setShowAssetForm(true)
              }}
              title="Tambah aset baru secara manual"
              className="gap-1.5 h-10 px-3.5 border-slate-200 text-slate-700 bg-white/70 hover:bg-slate-50 transition-all font-semibold rounded-xl text-xs"
            >
              <Plus className="h-4 w-4 text-amber-500" />
              Tambah Aset
            </Button>

            <Button 
              onClick={() => setShowRoomForm(true)} 
              className="gap-1.5 h-10 px-4 bg-[#F9D141] hover:bg-[#d9a416] text-white shadow-md hover:shadow-lg transition-all font-semibold rounded-xl text-xs"
            >
              <Plus className="h-4 w-4" /> Tambah Ruangan
            </Button>
          </div>
        ) : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr] items-start">
        {/* Left Column: Ruangan */}
        <GlassCard className="p-0 overflow-hidden border border-white/40 bg-white/80 shadow-md backdrop-blur-xl">
          {/* Header Panel Ruangan */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#d9a416]" />
              <span className="font-bold text-slate-700 text-sm">Daftar Ruangan ({filteredRooms.length})</span>
            </div>
            <div className="flex items-center gap-1.5">
              {isAdmin && !isDeletingRooms && rooms.data?.data && rooms.data.data.length > 0 && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setIsDeletingRooms(true)} 
                  className="h-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 text-xs font-bold rounded-lg"
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
                    className="h-8 text-xs font-bold rounded-lg"
                  >
                    Batal
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => setShowConfirmRoomDelete(true)} 
                    disabled={selectedRoomsToDelete.length === 0} 
                    className="h-8 text-xs font-bold rounded-lg px-2.5"
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
                className="pl-9 h-9 text-xs rounded-lg border-slate-200 focus:border-[#F9D141]/50 bg-white"
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
              />
            </div>
          </div>

          {/* List Ruangan */}
          {rooms.isLoading ? (
            <div className="p-4"><ListSkeleton count={5} /></div>
          ) : !filteredRooms.length ? (
            <div className="py-12"><EmptyState title="Tidak ada ruangan" description={roomSearch ? "Kriteria pencarian Anda tidak cocok" : undefined} /></div>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              {filteredRooms.map((r) => (
                <li
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  aria-selected={selectedRoom === r.id}
                  className={cn(
                    'group flex cursor-pointer items-center justify-between px-4 py-3.5 transition-all duration-200 focus:outline-none focus:bg-slate-50',
                    selectedRoom === r.id && !isDeletingRooms
                      ? 'bg-gradient-to-r from-[#F9D141]/10 to-[#F9D141]/5 border-l-4 border-l-[#d9a416] pl-3'
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
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
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                      <Building2 className="w-4 h-4 text-[#d9a416]/75" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn('font-bold text-sm truncate', selectedRoom === r.id && !isDeletingRooms ? 'text-[#d9a416]' : 'text-slate-800')}>
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
                </li>
              ))}
            </ul>
          )}
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
                  className="h-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 text-xs font-bold rounded-lg"
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
                    className="h-8 text-xs font-bold rounded-lg"
                  >
                    Batal
                  </Button>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={() => setShowConfirmAssetDelete(true)} 
                    disabled={selectedAssetsToDelete.length === 0} 
                    className="h-8 text-xs font-bold rounded-lg px-2.5"
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
              <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3.5">
                <ArrowRight className="w-5 h-5 -rotate-45" />
              </div>
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
                    className="pl-9 h-9 text-xs rounded-lg border-slate-200 focus:border-[#F9D141]/50 bg-white"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* List Aset */}
              {assets.isLoading ? (
                <div className="p-4"><ListSkeleton count={4} /></div>
              ) : !filteredAssets.length ? (
                <div className="py-12">
                  <EmptyState 
                    title="Tidak ada aset" 
                    description={assetSearch ? "Kriteria pencarian Anda tidak cocok" : "Belum ada inventaris terdaftar di ruangan ini"} 
                  />
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {filteredAssets.map((a) => (
                    <li 
                      key={a.id} 
                      className={cn(
                        "flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3.5 transition-colors gap-3",
                        isDeletingAssets ? "cursor-pointer hover:bg-rose-50/20" : "hover:bg-slate-50/50"
                      )}
                      onClick={() => {
                        if (isDeletingAssets) {
                          toggleAssetDelete(a.id)
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
                        <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl mt-0.5 shrink-0">
                          <Package className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="font-bold text-slate-800 text-sm truncate">{a.namaBarang}</p>
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
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </GlassCard>
      </div>

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
      {selectedRoom && (
        <AssetFormModal
          isOpen={showAssetForm}
          token={token}
          roomId={selectedRoom}
          onClose={() => setShowAssetForm(false)}
          onSuccess={() => { 
            qc.invalidateQueries({ queryKey: ['assets'] })
            setShowAssetForm(false)
            toast.success('Aset berhasil ditambahkan') 
          }}
        />
      )}

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
                  className="bg-[#F9D141] hover:bg-[#d9a416] text-white font-semibold rounded-xl"
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
  roomId,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  token: string
  roomId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const [idpemda, setIdpemda] = useState('')
  const [kodeBarang, setKodeBarang] = useState('')
  const [nomorRegister, setNomorRegister] = useState('')
  const [namaBarang, setNamaBarang] = useState('')
  const [merkType, setMerkType] = useState('')

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

              <div className="flex justify-end gap-3 pt-3.5 border-t border-slate-100">
                <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
                  Batal
                </Button>
                <Button 
                  onClick={() => mutation.mutate()} 
                  disabled={!idpemda || !kodeBarang || !nomorRegister || !namaBarang || !merkType || mutation.isPending} 
                  className="bg-[#F9D141] hover:bg-[#d9a416] text-white font-semibold rounded-xl"
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
