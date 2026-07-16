import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, UserCheck, Shield, Trash2, KeyRound, X, Lock, Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { GlassCard } from '@/components/ui/glass-card'
import { EmptyState, PageHeader } from '@/components/ui/feedback'
import { TableSkeleton } from '@/components/ui/skeleton'
import { createUser, deleteUser, fetchUsers, updateUser } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

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

  // User deletion states
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
  const [deleteUserName, setDeleteUserName] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['users', isAdminFilter],
    queryFn: () => fetchUsers(token, typeof isAdminFilter === 'boolean' ? { isAdmin: isAdminFilter } : undefined),
  })

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(token, id),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Pengguna berhasil dihapus') 
      setShowDeleteModal(false)
    },
    onError: (e: Error) => {
      toast.error(e.message)
      setShowDeleteModal(false)
    },
  })

  const triggerDeleteUser = (id: string, name: string) => {
    setDeleteUserId(id)
    setDeleteUserName(name)
    setShowDeleteModal(true)
  }

  const updateMut = useMutation({
    mutationFn: ({ id, isActive }: { id: string, isActive: boolean }) => updateUser(token, id, { isActive }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['users'] })
      toast.success('Status aktif pengguna diperbarui') 
    },
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

  // Local filtering
  const filteredUsers = useMemo(() => {
    return users
  }, [users])

  // Statistics calculation
  const stats = useMemo(() => {
    return {
      total: users.length,
      admins: users.filter(u => u.isAdmin).length,
      active: users.filter(u => u.isActive).length,
    }
  }, [users])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna"
        description="Kelola akun administrator dan pengguna aplikasi E-Lapor DPRD Kota Semarang."
        action={
          <div className="w-fit">
            <Button onClick={() => setShowForm(true)} className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Tambah Pengguna
            </Button>
          </div>
        }
      />

      {/* Overview Statistics Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <GlassCard className="p-5 flex items-center gap-4 border border-white/40">
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 shadow-inner">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Akun</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {isLoading ? '...' : stats.total}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4 border border-white/40">
          <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-500 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Administrator</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {isLoading ? '...' : stats.admins}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-5 flex items-center gap-4 border border-white/40">
          <div className="p-3.5 rounded-xl bg-green-500/10 text-green-500 shadow-inner">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengguna Aktif</p>
            <p className="text-2xl font-extrabold text-slate-800 mt-0.5">
              {isLoading ? '...' : stats.active}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Add User Form Section */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -15 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -15 }}
            className="overflow-hidden"
          >
            <UserForm
              token={token}
              onClose={() => setShowForm(false)}
              onSuccess={() => { 
                qc.invalidateQueries({ queryKey: ['users'] })
                setShowForm(false)
                toast.success('Pengguna baru berhasil ditambahkan') 
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard className="space-y-4 border border-white/40 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 p-4 border-b border-white/20">
          {/* Filter Status Tabs */}
          <div className="flex gap-1 bg-slate-200/50 p-1 rounded-xl border border-slate-200/40 text-xs overflow-x-auto self-start">
            {(['', true, false] as const).map((r) => {
              const labels: Record<string, string> = { '': 'Semua', true: 'ADMIN', false: 'USER' }
              return (
                <button
                  key={r === '' ? 'all' : String(r)}
                  onClick={() => setIsAdminFilter(r)}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                    isAdminFilter === r ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {labels[String(r)]}
                </button>
              )
            })}
          </div>
        </div>

        {/* User Table list */}
        {isLoading ? (
          <div className="p-4">
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState 
            title="Tidak ada pengguna ditemukan" 
            description="Belum ada pengguna dalam kategori filter ini."
          />
        ) : (
          <>
            {/* Mobile View: Cards */}
            <div className="grid gap-4 p-4 md:hidden">
              {filteredUsers.map((u) => (
                <div key={u.id} className="p-4 rounded-xl border border-white/50 bg-white/70 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                        {u.fullName?.charAt(0).toUpperCase() ?? 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{u.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    {u.isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 border border-purple-200/50">
                        <Shield className="w-3 h-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-200/50">
                        <User className="w-3 h-3" /> Pengguna
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Status Akun</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMut.mutate({ id: u.id, isActive: !u.isActive })}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shadow-inner border border-slate-200/50 ${
                          u.isActive ? 'bg-green-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                            u.isActive ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-bold ${u.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                        {u.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 border-t border-slate-100 pt-2.5">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="flex-1 h-9 text-xs rounded-xl flex items-center justify-center gap-1" 
                      onClick={() => triggerResetPassword(u.id, u.fullName)}
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Reset Sandi
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 h-9 text-xs rounded-xl text-red-500 hover:text-red-700 hover:bg-red-500/5 border border-transparent hover:border-red-200/40 gap-1 flex items-center justify-center" 
                      onClick={() => triggerDeleteUser(u.id, u.fullName)}
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Hapus
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/20 text-left text-xs font-bold text-slate-400 uppercase tracking-wider bg-white/10">
                    <th className="px-5 py-3.5">Nama Lengkap</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Peran</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="divide-y divide-white/15"
                >
                  {filteredUsers.map((u) => (
                    <motion.tr 
                      key={u.id} 
                      variants={itemVariants}
                      className="hover:bg-white/30 transition-colors"
                    >
                      {/* User profile avatar initials & name */}
                      <td className="px-5 py-3.5 font-semibold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                            {u.fullName?.charAt(0).toUpperCase() ?? 'U'}
                          </div>
                          <span className="truncate max-w-[180px]">{u.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 font-medium">{u.email}</td>
                      
                      {/* Role badge tag */}
                      <td className="px-5 py-3.5">
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 border border-purple-200/50">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 border border-blue-200/50">
                            <User className="w-3 h-3" /> Pengguna
                          </span>
                        )}
                      </td>

                      {/* Active toggle button */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateMut.mutate({ id: u.id, isActive: !u.isActive })}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none shadow-inner border border-slate-200/50 ${
                              u.isActive ? 'bg-green-500' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                                u.isActive ? 'translate-x-4' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-bold ${u.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                            {u.isActive ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </div>
                      </td>

                      {/* Actions panel */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8 text-xs rounded-xl flex items-center gap-1" 
                            onClick={() => triggerResetPassword(u.id, u.fullName)}
                          >
                            <KeyRound className="w-3.5 h-3.5 text-slate-500" /> Reset Sandi
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-xs rounded-xl text-red-500 hover:text-red-700 hover:bg-red-500/5 border border-transparent hover:border-red-200/40 gap-1" 
                            onClick={() => triggerDeleteUser(u.id, u.fullName)}
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </>
        )}
      </GlassCard>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
              onClick={() => setShowResetModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-md relative z-10"
            >
              <GlassCard className="p-6 bg-white shadow-2xl border-white/80 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/10 text-amber-600 rounded-xl">
                    <KeyRound className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Reset Kata Sandi</h3>
                    <p className="text-xs text-slate-500 font-medium">Reset sandi untuk akun <strong>{resetUserName}</strong>.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Kata Sandi Baru
                    </label>
                    <PasswordInput
                      placeholder="Masukkan kata sandi baru (min. 8 karakter)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="secondary"
                    className="flex-1 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 border-none"
                    onClick={() => setShowResetModal(false)}
                    disabled={resetPasswordMut.isPending}
                  >
                    Batal
                  </Button>
                  <Button
                    className="flex-1 rounded-xl"
                    onClick={() => resetPasswordMut.mutate(newPassword)}
                    disabled={newPassword.length < 8 || resetPasswordMut.isPending}
                  >
                    {resetPasswordMut.isPending ? 'Menyimpan...' : 'Simpan Sandi'}
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          if (deleteUserId) {
            deleteMut.mutate(deleteUserId)
          }
        }}
        title="Hapus Pengguna"
        description={`Apakah Anda yakin ingin menghapus pengguna ${deleteUserName}? Tindakan ini tidak dapat dibatalkan.`}
        isLoading={deleteMut.isPending}
      />
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
    <GlassCard className="mb-6 border border-white/50 relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-black/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
        <span className="w-1.5 h-4.5 rounded bg-[#F9D141]"></span>
        Registrasi Pengguna Baru
      </h2>
      <p className="text-xs text-slate-500 mt-1">Daftarkan akun administrator atau user baru untuk sistem E-Lapor.</p>
      
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" /> Nama Lengkap
          </label>
          <Input placeholder="Contoh: Budi Santoso" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> Alamat Email
          </label>
          <Input placeholder="Contoh: budi@dprd.semarangkota.go.id" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Kata Sandi Akun
          </label>
          <PasswordInput placeholder="Minimal 8 karakter" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Peran / Role Akun
          </label>
          <select
            className="w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-[#F9D141] focus:ring-2 focus:ring-[#F9D141]/20 font-medium text-slate-800"
            value={String(isAdmin)}
            onChange={(e) => setIsAdmin(e.target.value === 'true')}
          >
            <option value="false">Pengguna Biasa (User)</option>
            <option value="true">Administrator (Admin)</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <Button onClick={() => mutation.mutate()} disabled={!fullName || !email || password.length < 8}>
          {mutation.isPending ? 'Menyimpan...' : 'Simpan Akun'}
        </Button>
        <Button variant="secondary" onClick={onClose}>Batal</Button>
      </div>
    </GlassCard>
  )
}
