import { useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { KeyRound, User as UserIcon, Camera, Loader2, ShieldCheck, Mail, Phone, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { GlassCard } from '@/components/ui/glass-card'
import { useAuthStore } from '@/stores/auth-store'
import { updateProfileRequest, changePasswordRequest, uploadAvatarRequest } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'

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

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload Avatar Mutation
  const uploadAvatarMut = useMutation({
    mutationFn: (file: File) => uploadAvatarRequest(token, file),
    onSuccess: (res) => {
      if (res.data) {
        setUser(res.data)
        toast.success('Foto profil berhasil diubah')
      }
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Gagal mengunggah foto profil')
    },
  })

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB')
      return
    }
    uploadAvatarMut.mutate(file)
  }

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
    setShowConfirmModal(true)
  }

  const handleConfirmPasswordChange = () => {
    passwordMut.mutate({ oldPassword, newPassword })
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* Hero / Banner Section */}
      <div className="relative mb-20 md:mb-24">
        <div className="h-40 md:h-56 w-full rounded-3xl bg-gradient-to-r from-pink-500 via-[#ef629f] to-rose-400 overflow-hidden relative shadow-lg">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl translate-y-1/2"></div>
          
          {/* Desktop Title inside Banner */}
          <div className="absolute bottom-6 left-48 md:left-52 hidden md:block z-10 text-white drop-shadow-md">
            <h1 className="text-3xl font-extrabold">{user?.fullName || 'Pengguna'}</h1>
            <p className="text-sm font-medium flex items-center gap-1.5 mt-1.5 opacity-90">
              <Mail className="w-4 h-4" />
              {user?.email}
            </p>
          </div>
        </div>

        {/* Avatar overlapping the banner */}
        <div className="absolute -bottom-16 left-8 md:left-12">
          <div className="relative group z-10">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
              onChange={handleAvatarChange}
              disabled={uploadAvatarMut.isPending}
            />
            <div 
              className="flex h-32 w-32 items-center justify-center rounded-2xl bg-white text-[#ef629f] overflow-hidden cursor-pointer shadow-2xl relative transition-all group-hover:scale-[1.02] border-4 border-slate-50/80"
              onClick={() => !uploadAvatarMut.isPending && fileInputRef.current?.click()}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-12 w-12 text-slate-300" />
              )}
              
              {uploadAvatarMut.isPending ? (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                  <Loader2 className="h-8 w-8 animate-spin text-[#ef629f]" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              )}
            </div>
            
            {/* Online badge */}
            <div className="absolute -bottom-2 -right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-slate-50 z-10 shadow-sm"></div>
          </div>
        </div>
      </div>

      {/* Mobile Title (visible only on small screens below the avatar) */}
      <div className="px-4 md:hidden text-center flex flex-col items-center">
         <h1 className="text-2xl font-bold text-slate-800">{user?.fullName || 'Pengguna'}</h1>
         <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${user?.isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                {user?.isAdmin ? 'ADMINISTRATOR' : 'PENGGUNA STANDAR'}
            </span>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column: Read-only Profile Info */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-6 border-white/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">Akun Anda</h3>
                <p className="text-xs text-slate-500">Informasi kredensial login</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Role Sistem</label>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${user?.isAdmin ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm' : 'bg-slate-50 text-slate-700 border border-slate-200 shadow-sm'}`}>
                    {user?.isAdmin ? 'ADMINISTRATOR' : 'PENGGUNA STANDAR'}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Alamat Email</label>
                <div className="mt-1.5 flex items-center gap-2.5 text-sm font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/60 shadow-sm">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user?.email}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 ml-1 leading-relaxed">* Email digunakan sebagai identitas unik login dan tidak dapat diubah sendiri.</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Update Profile Form */}
          <GlassCard className="p-6 md:p-8 border-white/60 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-[#ef629f]">
                <UserCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Profil</h3>
                <p className="text-sm text-muted">Sesuaikan nama dan kontak yang ditampilkan di sistem</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nama Lengkap</label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    required
                    className="h-11 rounded-xl bg-white shadow-sm focus:ring-4 focus:ring-[#ef629f]/10 transition-all border-slate-200 focus:border-[#ef629f]/50 font-medium"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Nomor Telepon (Opsional)</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="h-11 pl-9 rounded-xl bg-white shadow-sm focus:ring-4 focus:ring-[#ef629f]/10 transition-all border-slate-200 focus:border-[#ef629f]/50 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-[#ef629f] text-white hover:opacity-90 h-11 px-8 font-semibold shadow-md shadow-pink-500/20 transition-all"
                  disabled={profileMut.isPending}
                >
                  {profileMut.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                  ) : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </GlassCard>

          {/* Change Password Form */}
          <GlassCard className="p-6 md:p-8 border-white/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            {/* decorative subtle background */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
              <KeyRound className="w-40 h-40" />
            </div>

            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Ubah Kata Sandi</h3>
                  <p className="text-sm text-muted">Pastikan akun Anda tetap aman dengan kata sandi yang kuat</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password Saat Ini</label>
                  <PasswordInput
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password Anda saat ini"
                    required
                    className="h-11 rounded-xl bg-white shadow-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Password Baru</label>
                    <PasswordInput
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 8 karakter"
                      required
                      className="h-11 rounded-xl bg-white shadow-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Konfirmasi Password Baru</label>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      required
                      className="h-11 rounded-xl bg-white shadow-sm font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="secondary"
                    className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-200 h-11 px-6 font-semibold shadow-sm w-full md:w-auto"
                    disabled={passwordMut.isPending}
                  >
                    Perbarui Kata Sandi
                  </Button>
                </div>
              </form>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowConfirmModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-7 text-center shadow-2xl border border-gray-100"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-inner">
                <KeyRound className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Ganti Password?</h3>
              <p className="mb-8 text-sm text-gray-500 leading-relaxed">
                Anda akan mengubah kata sandi akun ini. Pastikan Anda mengingat kata sandi baru untuk login selanjutnya.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 h-11 font-semibold"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={passwordMut.isPending}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 rounded-xl bg-gray-900 text-white hover:bg-gray-800 h-11 font-semibold shadow-lg shadow-gray-900/20"
                  onClick={handleConfirmPasswordChange}
                  disabled={passwordMut.isPending}
                >
                  {passwordMut.isPending ? 'Memproses...' : 'Ya, Ubah'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
