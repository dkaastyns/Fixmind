import { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
import {
  createAsset,
  createRoom,
  deleteAsset,
  deleteRoom,
  fetchAssets,
  fetchRooms,
} from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

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

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token) })
  const assets = useQuery({
    queryKey: ['assets', selectedRoom],
    queryFn: () => fetchAssets(token, selectedRoom ?? undefined),
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

  const toggleRoomDelete = (id: string) => {
    setSelectedRoomsToDelete(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleAssetDelete = (id: string) => {
    setSelectedAssetsToDelete(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  return (
    <div>
      <PageHeader
        title="Fasilitas & Ruangan DPRD"
        description="Daftar ruangan dan fasilitas yang tersedia untuk pelaporan"
        action={isAdmin ? (
          <Button onClick={() => setShowRoomForm(true)}><Plus className="h-4 w-4" /> Tambah Ruangan</Button>
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
          {!rooms.data?.data.length ? (
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
                  <Button size="sm" variant="ghost" onClick={() => setShowAssetForm(true)} className="h-8">
                    <Plus className="h-4 w-4 mr-1" /> Tambah
                  </Button>
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
          ) : !assets.data?.data.length ? (
            <EmptyState title="Tidak ada aset di ruangan ini" />
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
                      <p className="font-medium">{a.assetCode} — {a.name}</p>
                      <p className="text-sm text-muted">{a.category}</p>
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

function AssetForm({ token, roomId, onClose, onSuccess }: { token: string; roomId: string; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState('')
  const [assetCode, setAssetCode] = useState('')
  const [category, setCategory] = useState('')

  const mutation = useMutation({
    mutationFn: () => createAsset(token, { roomId, name, assetCode, category }),
    onSuccess,
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <GlassCard className="mt-4">
      <h2 className="font-medium">Tambah Aset Baru</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Input placeholder="Nama Aset" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Kode Aset" value={assetCode} onChange={(e) => setAssetCode(e.target.value)} />
        <Input placeholder="Kategori" value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div className="mt-4 flex gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!name || !assetCode || !category}>Simpan</Button>
        <Button variant="ghost" onClick={onClose}>Batal</Button>
      </div>
    </GlassCard>
  )
}
