import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, FileSpreadsheet, Plus, Trash2, Upload, X } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import type { Room } from '@/types/api'

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

  // Import Excel state
  const [showImportModal, setShowImportModal] = useState(false)
  const [importRoomId, setImportRoomId] = useState<string>('')
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null)
  const assetImportInputRef = useRef<HTMLInputElement>(null)
  const headerImportInputRef = useRef<HTMLInputElement>(null)

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token) })
  const assets = useQuery({
    queryKey: ['assets', selectedRoom],
    queryFn: () => fetchAssets(token, { roomId: selectedRoom ?? undefined }),
    enabled: !!selectedRoom,
  })

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
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['assets'] })
      setSelectedAssetsToDelete([])
      setIsDeletingAssets(false)
      setShowConfirmAssetDelete(false)
      toast.success('Aset terpilih berhasil dihapus') 
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const importAssetsMut = useMutation({
    mutationFn: ({ roomId, file }: { roomId: string; file: File }) =>
      importAssets(token, roomId, file),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      toast.success(`${res.data.imported} aset berhasil diimport`)
      if (assetImportInputRef.current) assetImportInputRef.current.value = ''
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

  /** Dipanggil saat user memilih file dari tombol Import di header */
  const handleHeaderImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (selectedRoom) {
      // Ruangan sudah dipilih → langsung import
      importAssetsMut.mutate({ roomId: selectedRoom, file })
    } else {
      // Belum pilih ruangan → tampilkan modal pilih ruangan
      setPendingImportFile(file)
      setImportRoomId(rooms.data?.data?.[0]?.id ?? '')
      setShowImportModal(true)
    }
  }

  /** Dipanggil saat user memilih file dari tombol Import di panel aset */
  const handlePanelImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && selectedRoom) {
      importAssetsMut.mutate({ roomId: selectedRoom, file })
    }
  }

  /** Konfirmasi import dari modal */
  const handleConfirmImport = () => {
    if (!pendingImportFile || !importRoomId) {
      toast.error('Pilih ruangan terlebih dahulu')
      return
    }
    importAssetsMut.mutate({ roomId: importRoomId, file: pendingImportFile })
  }

  return (
    <div>
      <PageHeader
        title="Fasilitas & Ruangan DPRD"
        description="Daftar ruangan dan fasilitas yang tersedia untuk pelaporan"
        action={isAdmin ? (
          <div className="flex items-center gap-2">
            {/* Tombol Download Template */}
            <Button
              variant="ghost"
              onClick={() => downloadTemplateMut.mutate()}
              disabled={downloadTemplateMut.isPending}
              title="Download template Excel untuk import aset"
              className="gap-1"
            >
              <Download className="h-4 w-4" />
              Template
            </Button>

            {/* Hidden input untuk import dari header */}
            <input
              ref={headerImportInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleHeaderImportFileChange}
            />
            {/* Tombol Import Excel di header */}
            <Button
              variant="secondary"
              onClick={() => headerImportInputRef.current?.click()}
              disabled={importAssetsMut.isPending}
              title="Import aset dari file Excel"
              className="gap-1"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {importAssetsMut.isPending ? 'Import...' : 'Import Excel'}
            </Button>

            {/* Tombol Tambah Ruangan */}
            <Button onClick={() => setShowRoomForm(true)} className="gap-1">
              <Plus className="h-4 w-4" /> Tambah Ruangan
            </Button>
          </div>
        ) : undefined}
      />

      {showRoomForm && isAdmin && (
        <RoomForm
          token={token}
          onClose={() => setShowRoomForm(false)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['rooms'] }); setShowRoomForm(false); toast.success('Ruangan berhasil ditambahkan') }}
        />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/40 px-4 py-3">
            <span className="font-medium">Ruangan</span>
            <div className="flex items-center gap-2">
              {isAdmin && !isDeletingRooms && rooms.data?.data && rooms.data.data.length > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setIsDeletingRooms(true)} className="h-8">
                  <Trash2 className="h-4 w-4 mr-1" /> Hapus
                </Button>
              )}
              {isAdmin && isDeletingRooms && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => { setIsDeletingRooms(false); setSelectedRoomsToDelete([]); }} className="h-8">
                    Batal
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setShowConfirmRoomDelete(true)} disabled={selectedRoomsToDelete.length === 0} className="h-8">
                    Hapus Terpilih ({selectedRoomsToDelete.length})
                  </Button>
                </>
              )}
            </div>
          </div>
          {rooms.isLoading ? (
            <ListSkeleton count={5} />
          ) : !rooms.data?.data.length ? (
            <EmptyState title="Tidak ada ruangan" />
          ) : (
            <ul>
              {rooms.data.data.map((r) => (
                <li
                  key={r.id}
                  className={cn(
                    'group flex cursor-pointer items-center justify-between border-b border-white/20 px-4 py-3 transition-all duration-200 hover:bg-white/50',
                    selectedRoom === r.id && !isDeletingRooms ? 'bg-white/60 border-l-4 border-l-[#ef629f] pl-3' : 'border-l-4 border-l-transparent'
                  )}
                  onClick={() => {
                    if (isDeletingRooms) {
                      toggleRoomDelete(r.id)
                    } else {
                      setSelectedRoom(r.id)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {isAdmin && isDeletingRooms && (
                      <input 
                        type="checkbox" 
                        checked={selectedRoomsToDelete.includes(r.id)} 
                        onChange={() => toggleRoomDelete(r.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-[#ef629f] focus:ring-[#ef629f] cursor-pointer"
                      />
                    )}
                    <div>
                      <p className={cn('font-medium', selectedRoom === r.id && !isDeletingRooms ? 'text-[#ef629f]' : 'text-foreground')}>{r.code}</p>
                      <p className="text-sm text-muted">{r.name} · {r.building ?? '—'}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/40 px-4 py-3">
            <span className="font-medium">Aset</span>
            <div className="flex items-center gap-2">
              {isAdmin && selectedRoom && !isDeletingAssets && (
                <>
                  {assets.data?.data && assets.data.data.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={() => setIsDeletingAssets(true)} className="h-8">
                      <Trash2 className="h-4 w-4 mr-1" /> Hapus
                    </Button>
                  )}
                  {/* Input file tersembunyi untuk panel aset */}
                  <input
                    ref={assetImportInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={handlePanelImportFileChange}
                  />
                </>
              )}
              {isAdmin && selectedRoom && isDeletingAssets && (
                <>
                  <Button size="sm" variant="ghost" onClick={() => { setIsDeletingAssets(false); setSelectedAssetsToDelete([]); }} className="h-8">
                    Batal
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setShowConfirmAssetDelete(true)} disabled={selectedAssetsToDelete.length === 0} className="h-8">
                    Hapus Terpilih ({selectedAssetsToDelete.length})
                  </Button>
                </>
              )}
            </div>
          </div>
          {!selectedRoom ? (
            <p className="p-6 text-sm text-muted">Pilih ruangan untuk melihat aset</p>
          ) : assets.isLoading ? (
            <ListSkeleton count={4} />
          ) : !assets.data?.data.length ? (
            <div className="p-6">
              <EmptyState title="Tidak ada aset di ruangan ini" />
            </div>
          ) : (
            <ul>
              {assets.data.data.map((a) => (
                <li 
                  key={a.id} 
                  className={cn(
                    "flex items-center justify-between border-b border-white/20 px-4 py-3 transition-colors hover:bg-white/30",
                    isDeletingAssets ? "cursor-pointer" : ""
                  )}
                  onClick={() => {
                    if (isDeletingAssets) {
                      toggleAssetDelete(a.id)
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    {isAdmin && isDeletingAssets && (
                      <input 
                        type="checkbox" 
                        checked={selectedAssetsToDelete.includes(a.id)} 
                        onChange={() => toggleAssetDelete(a.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-gray-300 text-[#ef629f] focus:ring-[#ef629f] cursor-pointer"
                      />
                    )}
                    <div>
                      <p className="font-medium">{a.kodeBarang} - {a.namaBarang}</p>
                      <p className="text-sm text-muted">{a.nomorRegister} · {a.merkType}</p>
                      <p className="text-xs text-muted/70">ID Pemda: {a.idpemda}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      {showAssetForm && selectedRoom && isAdmin && (
        <AssetForm
          token={token}
          roomId={selectedRoom}
          onClose={() => setShowAssetForm(false)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['assets'] }); setShowAssetForm(false); toast.success('Aset berhasil ditambahkan') }}
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
            className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ef629f]/10">
                  <FileSpreadsheet className="h-5 w-5 text-[#ef629f]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Import Aset Excel</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[220px]" title={fileName}>{fileName}</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Ruangan Tujuan <span className="text-red-500">*</span>
            </label>
            {rooms.length === 0 ? (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                Belum ada ruangan. Buat ruangan dulu sebelum import.
              </p>
            ) : (
              <select
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:border-[#ef629f] focus:ring-2 focus:ring-[#ef629f]/20 focus:outline-none transition-all"
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

            <p className="mt-3 text-xs text-gray-400">
              Kolom wajib: <code className="bg-gray-100 px-1 rounded">idpemda</code>,{' '}
              <code className="bg-gray-100 px-1 rounded">kode_barang</code>,{' '}
              <code className="bg-gray-100 px-1 rounded">nomor_register</code>,{' '}
              <code className="bg-gray-100 px-1 rounded">nama_barang</code>,{' '}
              <code className="bg-gray-100 px-1 rounded">merk_type</code>
            </p>

            {/* Actions */}
            <div className="mt-5 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button
                className="flex-1 rounded-xl"
                onClick={onConfirm}
                disabled={isLoading || !selectedRoomId || rooms.length === 0}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Mengimport...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" /> Import
                  </span>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Modal konfirmasi hapus ───────────────────────────────────────────────────

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, description, isLoading }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, description: string, isLoading: boolean }) {
  if (typeof document === 'undefined') return null
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl border border-gray-100"
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10">
              <Trash2 className="h-6 w-6 text-danger" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mb-6 text-sm text-gray-500">{description}</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200" onClick={onClose} disabled={isLoading}>
                Batal
              </Button>
              <Button variant="danger" className="flex-1 rounded-xl" onClick={onConfirm} disabled={isLoading}>
                {isLoading ? 'Menghapus...' : 'Ya, Hapus'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ─── Form tambah ruangan ──────────────────────────────────────────────────────

function RoomForm({ token, onClose, onSuccess }: { token: string; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [building, setBuilding] = useState('')
  const [floor, setFloor] = useState('')

  const mutation = useMutation({
    mutationFn: () => createRoom(token, { name, code, building, floor }),
    onSuccess,
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <GlassCard className="mb-6">
      <h2 className="font-medium">Tambah Ruangan Baru</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input placeholder="Nama Ruangan" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Kode (mis. RSG-1)" value={code} onChange={(e) => setCode(e.target.value)} />
        <Input placeholder="Gedung" value={building} onChange={(e) => setBuilding(e.target.value)} />
        <Input placeholder="Lantai" value={floor} onChange={(e) => setFloor(e.target.value)} />
      </div>
      <div className="mt-4 flex gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!name || !code}>Simpan</Button>
        <Button variant="ghost" onClick={onClose}>Batal</Button>
      </div>
    </GlassCard>
  )
}

// ─── Form tambah aset manual ──────────────────────────────────────────────────

function AssetForm({ token, roomId, onClose, onSuccess }: { token: string; roomId: string; onClose: () => void; onSuccess: () => void }) {
  const [idpemda, setIdpemda] = useState('')
  const [kodeBarang, setKodeBarang] = useState('')
  const [nomorRegister, setNomorRegister] = useState('')
  const [namaBarang, setNamaBarang] = useState('')
  const [merkType, setMerkType] = useState('')

  const mutation = useMutation({
    mutationFn: () => createAsset(token, { roomId, idpemda, kodeBarang, nomorRegister, namaBarang, merkType }),
    onSuccess,
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <GlassCard className="mt-4">
      <h2 className="font-medium">Tambah Aset Baru</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input placeholder="ID Pemda" value={idpemda} onChange={(e) => setIdpemda(e.target.value)} />
        <Input placeholder="Kode Barang" value={kodeBarang} onChange={(e) => setKodeBarang(e.target.value)} />
        <Input placeholder="Nomor Register" value={nomorRegister} onChange={(e) => setNomorRegister(e.target.value)} />
        <Input placeholder="Nama Barang" value={namaBarang} onChange={(e) => setNamaBarang(e.target.value)} />
        <Input placeholder="Merk dan Type" value={merkType} onChange={(e) => setMerkType(e.target.value)} />
      </div>
      <div className="mt-4 flex gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!idpemda || !kodeBarang || !nomorRegister || !namaBarang || !merkType}>Simpan</Button>
        <Button variant="ghost" onClick={onClose}>Batal</Button>
      </div>
    </GlassCard>
  )
}
