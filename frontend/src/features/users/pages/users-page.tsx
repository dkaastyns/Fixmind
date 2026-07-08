import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader } from '@/components/ui/feedback'
import { TableSkeleton } from '@/components/ui/skeleton'
import { createUser, deleteUser, fetchUsers, updateUser } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

export function UsersPage() {
  const token = useAuthStore((s) => s.accessToken)!
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [isAdminFilter, setIsAdminFilter] = useState<boolean | ''>('')
  
  // Password reset states
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [resetUserName, setResetUserName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showResetModal, setShowResetModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['users', isAdminFilter],
    queryFn: () => fetchUsers(token, typeof isAdminFilter === 'boolean' ? { isAdmin: isAdminFilter } : undefined),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(token, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Pengguna berhasil dihapus') },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => updateUser(token, id, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Status diperbarui') },
    onError: (e: Error) => toast.error(e.message),
  })

  const resetPasswordMut = useMutation({
    mutationFn: (password: string) => updateUser(token, resetUserId!, { password }),
    onSuccess: () => {
      toast.success(`Kata sandi untuk ${resetUserName} berhasil di-reset`)
      setShowResetModal(false)
      setNewPassword('')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const triggerResetPassword = (id: string, name: string) => {
    setResetUserId(id)
    setResetUserName(name)
    setNewPassword('')
    setShowResetModal(true)
  }

  const users = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun admin dan pengguna aplikasi DPRD"
        action={
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Tambah Pengguna</Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(['', true, false] as const).map((r) => {
          const labels: Record<string, string> = { '': 'Semua', true: 'ADMIN', false: 'USER' }
          return (
            <button
              key={r === '' ? 'all' : String(r)}
              onClick={() => setIsAdminFilter(r)}
              className={`rounded-xl px-3 py-1.5 text-sm ${
                isAdminFilter === r ? 'gradient-primary text-white' : 'glass text-muted'
              }`}
            >
              {labels[String(r)]}
            </button>
          )
        })}
      </div>

      {showForm && (
        <UserForm
          token={token}
          onClose={() => setShowForm(false)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); toast.success('Pengguna ditambahkan') }}
        />
      )}

      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : users.length === 0 ? (
          <EmptyState title="Tidak ada pengguna ditemukan" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left text-muted">
                <th className="px-4 py-3">Nama Lengkap</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Peran</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/20 hover:bg-white/30">
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium capitalize">
                      {u.isAdmin ? 'Admin' : 'Pengguna'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => updateMut.mutate({ id: u.id, isActive: !u.isActive })}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
                        u.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          u.isActive ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="ml-2 text-xs text-muted">{u.isActive ? 'Aktif' : 'Tidak Aktif'}</span>
                  </td>
                  <td className="px-4 py-3 flex items-center justify-end gap-2">
                    <Button variant="secondary" size="sm" className="h-8 text-xs rounded-xl" onClick={() => triggerResetPassword(u.id, u.fullName)}>Reset Sandi</Button>
                    <Button variant="ghost" size="sm" className="h-8 text-xs rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => deleteMut.mutate(u.id)}>Hapus</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowResetModal(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Kata Sandi</h3>
            <p className="text-sm text-muted mb-4">
              Masukkan kata sandi baru untuk <strong>{resetUserName}</strong>. Minimal 8 karakter.
            </p>
            <div className="space-y-4 mb-6">
              <PasswordInput
                placeholder="Kata sandi baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 border-none"
                onClick={() => setShowResetModal(false)}
                disabled={resetPasswordMut.isPending}
              >
                Batal
              </Button>
              <Button
                className="flex-1 rounded-xl bg-[#ef629f] text-white hover:bg-[#ef629f]/90"
                onClick={() => resetPasswordMut.mutate(newPassword)}
                disabled={newPassword.length < 8 || resetPasswordMut.isPending}
              >
                {resetPasswordMut.isPending ? 'Menyimpan...' : 'Simpan Sandi'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserForm({ token, onClose, onSuccess }: { token: string; onClose: () => void; onSuccess: () => void }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  const mutation = useMutation({
    mutationFn: () => createUser(token, { fullName, email, password, isAdmin }),
    onSuccess,
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <GlassCard className="mb-6">
      <h2 className="font-medium">Pengguna Baru</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input placeholder="Nama lengkap" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput placeholder="Kata sandi" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select
          className="flex h-10 rounded-xl border border-white/60 bg-white/70 px-3 text-sm"
          value={String(isAdmin)}
          onChange={(e) => setIsAdmin(e.target.value === 'true')}
        >
          <option value="false">Pengguna</option>
          <option value="true">Admin</option>
        </select>
      </div>
      <div className="mt-4 flex gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!fullName || !email || password.length < 8}>Simpan</Button>
        <Button variant="ghost" onClick={onClose}>Batal</Button>
      </div>
    </GlassCard>
  )
}
