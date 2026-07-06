import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader, StatusBadge } from '@/components/ui/feedback'
import { createUser, deleteUser, fetchUsers, updateUser } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import type { UserRole } from '@/types/api'

export function UsersPage() {
  const token = useAuthStore((s) => s.accessToken)!
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleFilter],
    queryFn: () => fetchUsers(token, roleFilter ? { role: roleFilter } : undefined),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(token, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deleted') },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => updateUser(token, id, { isActive }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Status updated') },
    onError: (e: Error) => toast.error(e.message),
  })

  const users = data?.data ?? []

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola administrator, teknisi, dan pengguna aplikasi DPRD"
        action={
          <Button onClick={() => setShowForm(true)}><Plus className="h-4 w-4" /> Tambah Pengguna</Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(['', 'ADMIN', 'TECHNICIAN', 'USER'] as const).map((r) => (
          <button
            key={r || 'all'}
            onClick={() => setRoleFilter(r)}
            className={`rounded-xl px-3 py-1.5 text-sm ${
              roleFilter === r ? 'gradient-primary text-white' : 'glass text-muted'
            }`}
          >
            {r || 'All'}
          </button>
        ))}
      </div>

      {showForm && (
        <UserForm
          token={token}
          onClose={() => setShowForm(false)}
          onSuccess={() => { qc.invalidateQueries({ queryKey: ['users'] }); setShowForm(false); toast.success('User created') }}
        />
      )}

      <GlassCard className="overflow-hidden p-0">
        {isLoading ? (
          <p className="p-6 text-sm text-muted">Loading...</p>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/40 text-left text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/20 hover:bg-white/30">
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3"><StatusBadge status={u.role} /></td>
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
                    <span className="ml-2 text-xs text-muted">{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => deleteMut.mutate(u.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  )
}

function UserForm({ token, onClose, onSuccess }: { token: string; onClose: () => void; onSuccess: () => void }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserRole>('USER')

  const mutation = useMutation({
    mutationFn: () => createUser(token, { fullName, email, password, role }),
    onSuccess,
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <GlassCard className="mb-6">
      <h2 className="font-medium">New User</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <select
          className="flex h-10 rounded-xl border border-white/60 bg-white/70 px-3 text-sm"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
        >
          <option value="USER">User</option>
          <option value="TECHNICIAN">Technician</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>
      <div className="mt-4 flex gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!fullName || !email || password.length < 8}>Save</Button>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </div>
    </GlassCard>
  )
}
