import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
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

export function RoomsPage() {
  const token = useAuthStore((s) => s.accessToken)!
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'ADMIN'
  const qc = useQueryClient()
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [showAssetForm, setShowAssetForm] = useState(false)

  const rooms = useQuery({ queryKey: ['rooms'], queryFn: () => fetchRooms(token) })
  const assets = useQuery({
    queryKey: ['assets', selectedRoom],
    queryFn: () => fetchAssets(token, selectedRoom ?? undefined),
    enabled: !!selectedRoom,
  })

  const deleteRoomMut = useMutation({
    mutationFn: (id: string) => deleteRoom(token, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Room deleted') },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteAssetMut = useMutation({
    mutationFn: (id: string) => deleteAsset(token, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['assets'] }); toast.success('Aset berhasil dihapus') },
    onError: (e: Error) => toast.error(e.message),
  })

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
          <div className="border-b border-white/40 px-4 py-3 font-medium">Ruangan</div>
          {!rooms.data?.data.length ? (
            <EmptyState title="No rooms" />
          ) : (
            <ul>
              {rooms.data.data.map((r) => (
                <li
                  key={r.id}
                  className={`flex cursor-pointer items-center justify-between border-b border-white/20 px-4 py-3 hover:bg-white/30 ${
                    selectedRoom === r.id ? 'bg-white/40' : ''
                  }`}
                  onClick={() => setSelectedRoom(r.id)}
                >
                  <div>
                    <p className="font-medium">{r.code}</p>
                    <p className="text-sm text-muted">{r.name} · {r.building ?? '—'}</p>
                  </div>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); deleteRoomMut.mutate(r.id) }}>
                      Hapus
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="p-0 overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/40 px-4 py-3">
            <span className="font-medium">Aset</span>
            {isAdmin && selectedRoom && (
              <Button size="sm" variant="ghost" onClick={() => setShowAssetForm(true)}>
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            )}
          </div>
          {!selectedRoom ? (
            <p className="p-6 text-sm text-muted">Pilih ruangan untuk melihat aset</p>
          ) : !assets.data?.data.length ? (
            <EmptyState title="Tidak ada aset di ruangan ini" />
          ) : (
            <ul>
              {assets.data.data.map((a) => (
                <li key={a.id} className="flex items-center justify-between border-b border-white/20 px-4 py-3">
                  <div>
                    <p className="font-medium">{a.assetCode} — {a.name}</p>
                    <p className="text-sm text-muted">{a.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={a.status} />
                    {isAdmin && (
                      <Button variant="ghost" size="sm" onClick={() => deleteAssetMut.mutate(a.id)}>Hapus</Button>
                    )}
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
    </div>
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
