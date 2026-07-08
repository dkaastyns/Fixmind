import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { KeyRound, User as UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { GlassCard } from '@/components/ui/glass-card'
import { PageHeader } from '@/components/ui/feedback'
import { useAuthStore } from '@/stores/auth-store'
import { updateProfileRequest, changePasswordRequest } from '@/lib/api-client'

export function ProfilePage() {
  const { user, accessToken, setUser } = useAuthStore()
  const token = accessToken!

  // Profile Details Form State
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  // Password Form State
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // Update Profile Mutation
  const profileMut = useMutation({
    mutationFn: (data: { fullName: string; phone?: string }) =>
      updateProfileRequest(token, data),
    onSuccess: (res) => {
      if (res.data) {
        setUser(res.data)
        toast.success('Profil berhasil diperbarui')
      }
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Gagal memperbarui profil')
    },
  })

  // Change Password Mutation
  const passwordMut = useMutation({
    mutationFn: (data: { oldPassword: string; newPassword: string }) =>
      changePasswordRequest(token, data),
    onSuccess: () => {
      toast.success('Password berhasil diubah')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowConfirmModal(false)
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Gagal mengubah password')
      setShowConfirmModal(false)
    },
  })

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName.trim()) {
      toast.error('Nama Lengkap tidak boleh kosong')
      return
    }
    profileMut.mutate({ fullName, phone })
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error('Semua kolom password wajib diisi')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password baru minimal harus 8 karakter')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok')
      return
    }
    // Show confirmation modal
    setShowConfirmModal(true)
  }

  const handleConfirmPasswordChange = () => {
    passwordMut.mutate({ oldPassword, newPassword })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi profil Anda dan ubah kata sandi akun"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Profile Info Form */}
        <GlassCard className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef629f]/10 text-[#ef629f]">
              <UserIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Detail Informasi</h3>
              <p className="text-xs text-muted">Perbarui data profil umum Anda</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Alamat Email (Tidak dapat diubah)
              </label>
              <Input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="bg-gray-50/50 text-muted-foreground"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Peran / Role
              </label>
              <Input
                type="text"
                value={user?.isAdmin ? 'ADMIN' : 'USER'}
                disabled
                className="bg-gray-50/50 text-muted-foreground font-semibold"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Nama Lengkap
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Nomor Telepon (Opsional)
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Masukkan nomor telepon"
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-[#ef629f] text-white hover:bg-[#ef629f]/90"
              disabled={profileMut.isPending}
            >
              {profileMut.isPending ? 'Menyimpan...' : 'Simpan Profil'}
            </Button>
          </form>
        </GlassCard>

        {/* Change Password Form */}
        <GlassCard className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ef629f]/10 text-[#ef629f]">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">Keamanan & Password</h3>
              <p className="text-xs text-muted">Ganti password akun Anda secara berkala</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Password Lama
              </label>
              <PasswordInput
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Password Baru
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Konfirmasi Password Baru
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Masukkan ulang password baru"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800"
              disabled={passwordMut.isPending}
            >
              Ubah Password
            </Button>
          </form>
        </GlassCard>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setShowConfirmModal(false)}
          />
          <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-6 text-center shadow-2xl border border-gray-100">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ef629f]/10">
              <KeyRound className="h-6 w-6 text-[#ef629f]" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">Ubah Password</h3>
            <p className="mb-6 text-sm text-gray-500">
              Apakah Anda yakin ingin mengubah password Anda? Pastikan Anda mengingat password baru yang dimasukkan.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200"
                onClick={() => setShowConfirmModal(false)}
                disabled={passwordMut.isPending}
              >
                Batal
              </Button>
              <Button
                className="flex-1 rounded-xl bg-[#ef629f] text-white hover:bg-[#ef629f]/90"
                onClick={handleConfirmPasswordChange}
                disabled={passwordMut.isPending}
              >
                {passwordMut.isPending ? 'Memproses...' : 'Ya, Ubah'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
