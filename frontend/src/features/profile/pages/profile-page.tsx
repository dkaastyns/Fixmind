import { useRef, useState, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { KeyRound, User as UserIcon, Camera, Loader2, Phone, UserCircle, X, Trash2, Mail, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { NotificationBell } from '@/components/ui/notification-bell'
import { useAuthStore } from '@/stores/auth-store'
import { updateProfileRequest, changePasswordRequest, uploadAvatarRequest, deleteAvatarRequest } from '@/lib/api-client'
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
  const [showProfileConfirmModal, setShowProfileConfirmModal] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync state with user store once user hydrates or changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName ?? '')
      setPhone(user.phone ?? '')
    }
  }, [user])

  // Safety loading guard to prevent rendering crashes if user session is hydrating
  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#F9D141]" />
      </div>
    )
  }

  // Upload Avatar Mutation
  const uploadAvatarMut = useMutation({
    mutationFn: (file: File) => uploadAvatarRequest(token, file),
    onSuccess: (res) => {
      if (res.data) {
        setUser(res.data)
        toast.success('Foto profil berhasil diubah')
        setShowPreviewModal(false)
      }
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Gagal mengunggah foto profil')
    },
  })

  // Delete Avatar Mutation
  const deleteAvatarMut = useMutation({
    mutationFn: () => deleteAvatarRequest(token),
    onSuccess: (res) => {
      if (res.data) {
        setUser(res.data)
        toast.success('Foto profil berhasil dihapus')
        setShowPreviewModal(false)
      }
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Gagal menghapus foto profil')
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
        setShowProfileConfirmModal(false)
      }
    },
    onError: (err: any) => {
      toast.error(err.message ?? 'Gagal memperbarui profil')
      setShowProfileConfirmModal(false)
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
    setShowProfileConfirmModal(true)
  }

  const handleConfirmProfileUpdate = () => {
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
    <div className="w-full">
      
      {/* === DESKTOP VIEW === */}
      <div className="hidden lg:block relative -mx-6 -mt-6 mb-10 pb-10">
        {/* Desktop Banner */}
        <div className="h-[260px] w-full relative rounded-b-[40px] overflow-hidden shadow-md">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url(/new-bg_dprd.jpg)' }}
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        {/* Main Content overlapping banner */}
        <div className="relative z-10 px-8 -mt-[120px]">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-12"
          >
            
            {/* Left Column: Profile Card 3D */}
        <div className="lg:col-span-4 flex justify-center items-start pt-2">
          {/* Hidden File Input for Avatar Upload */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/jpeg, image/png, image/webp"
            onChange={handleAvatarChange}
            disabled={uploadAvatarMut.isPending}
          />
          <div className="relative">
            {/* Wrapper for golden gradient border */}
            <div className="w-64 h-64 md:w-72 md:h-72 rounded-[3rem] p-2 bg-gradient-to-br from-[#FFD641] via-[#d9a416] to-[#FFD641] shadow-2xl shadow-yellow-500/30">
              <div className="w-full h-full rounded-[2.6rem] overflow-hidden bg-white">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <UserIcon className="w-28 h-28" />
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowPreviewModal(true)}
              style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
              className="absolute bottom-2 right-2 md:bottom-3 md:right-3 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-all border-4 border-white"
            >
              <Camera className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Update Profile Form */}
          <div className="group bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-50 text-[#d9a416] group-hover:rotate-12 transition-transform duration-300">
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
                    className="h-11 rounded-xl bg-white shadow-sm hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#F9D141]/10 transition-all duration-300 border-slate-200 focus:border-[#F9D141]/50 font-medium"
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
                      className="h-11 pl-9 rounded-xl bg-white shadow-sm hover:bg-slate-50 focus:bg-white focus:ring-4 focus:ring-[#F9D141]/10 transition-all duration-300 border-slate-200 focus:border-[#F9D141]/50 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
                  className="rounded-xl text-white font-bold hover:opacity-90 active:scale-95 h-11 px-8 shadow-md border-none transition-all cursor-pointer"
                  disabled={profileMut.isPending}
                >
                  {profileMut.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                  ) : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="group bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-gray-100 shadow-xl shadow-gray-200/50 relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300">
            {/* decorative subtle background */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none group-hover:opacity-[0.04] group-hover:scale-110 transition-all duration-500">
              <KeyRound className="w-40 h-40" />
            </div>

            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:rotate-12 transition-transform duration-300">
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
                    style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
                    className="rounded-xl text-white hover:opacity-90 active:scale-95 h-11 px-6 font-bold shadow-md border-none w-full md:w-auto transition-all cursor-pointer"
                    disabled={passwordMut.isPending}
                  >
                    Perbarui Kata Sandi
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
          </motion.div>
        </div>
      </div>

      {/* === MOBILE VIEW === */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="block lg:hidden min-h-screen bg-[#F5F5F5] pb-24 -mt-4 -mx-4 overflow-x-hidden relative"
      >
        {/* Header with background image */}
        <div className="relative h-[280px] w-full rounded-b-[40px] overflow-hidden shadow-md">
          <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url(/new-bg_dprd.jpg)' }}
          />
          <div className="absolute inset-0 bg-black/60" />

          {/* Top Nav */}
          <div className="relative z-10 flex items-center justify-between p-4 pt-6">
            <button onClick={() => window.dispatchEvent(new CustomEvent('open-mobile-menu'))} className="text-[#F9D141] hover:text-yellow-300">
              <Menu className="w-7 h-7" />
            </button>
            <h1 className="text-2xl font-light text-white tracking-wide">Profile</h1>
            <NotificationBell align="right" className="text-[#F9D141] bg-transparent border-none shadow-none hover:bg-white/10 p-1" />
          </div>

          {/* User Info overlay */}
          <div className="relative z-10 px-6 pt-4">
            <p className="text-white/80 text-sm mb-1">{user?.isAdmin ? 'Administrator' : 'User'}</p>
            <h2 className="text-3xl font-light text-white mb-2 leading-tight">{user?.fullName}</h2>
            <div className="flex items-center text-white/80 gap-2 text-sm">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Circular Avatar */}
        <div className="relative z-20 flex justify-center -mt-[60px]">
          <div className="relative">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-[#F5F5F5] bg-white shadow-lg">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <UserIcon className="w-12 h-12" />
                </div>
              )}
            </div>
            <button 
              onClick={() => setShowPreviewModal(true)}
              className="absolute bottom-1 right-1 bg-[#F9D141] text-black p-2.5 rounded-full shadow-md hover:bg-[#e0bc38] transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 pt-8 space-y-6">
          {/* Read Only Fields */}
          <div>
            <label className="text-[11px] font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Peran Dalam Sistem</label>
            <div className="bg-gray-200/50 rounded-xl px-4 py-3 text-[13px] font-bold text-gray-600 inline-block">
              {user?.isAdmin ? 'ADMINISTRATOR' : 'PENGGUNA STANDAR'}
            </div>
          </div>
          
          <div>
            <label className="text-[11px] font-bold text-gray-400 mb-1.5 block uppercase tracking-wider">Alamat Email</label>
            <div className="bg-gray-200/50 rounded-xl px-4 py-3 flex items-center gap-2 border border-gray-300/30">
               <Mail className="w-4 h-4 text-gray-500" />
               <span className="text-sm font-bold text-gray-800">{user?.email}</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">* Email digunakan sebagai identitas unik dan tidak dapat diubah sendiri.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Nama Lengkap</label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
                className="h-12 rounded-xl bg-white shadow-sm font-bold text-gray-800 border-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Nomor Telepon (Opsional)</label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="h-12 rounded-xl bg-white shadow-sm font-bold text-gray-800 border-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={profileMut.isPending}
                style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
                className="rounded-xl text-white font-bold hover:opacity-90 active:scale-95 h-11 px-8 shadow-md border-none transition-all"
              >
                {profileMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Simpan
              </Button>
            </div>
          </form>

          <hr className="border-gray-300/50 my-8" />

          {/* Password Section */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Ubah Kata Sandi</h3>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Password Saat Ini</label>
              <PasswordInput
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                required
                className="h-12 rounded-xl bg-white shadow-sm font-medium border-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Password Baru</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                required
                className="h-12 rounded-xl bg-white shadow-sm font-medium border-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">Konfirmasi Password Baru</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                required
                className="h-12 rounded-xl bg-white shadow-sm font-medium border-none"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={passwordMut.isPending}
                style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
                className="rounded-xl text-white font-bold hover:opacity-90 active:scale-95 h-11 px-6 shadow-md border-none w-full transition-all"
              >
                {passwordMut.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Perbarui Kata Sandi
              </Button>
            </div>
          </form>

        </div>
      </motion.div>


      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            key="confirm-password-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
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
                  style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
                  className="flex-1 rounded-xl text-white hover:opacity-90 h-11 font-bold shadow-md border-none"
                  onClick={handleConfirmPasswordChange}
                  disabled={passwordMut.isPending}
                >
                  {passwordMut.isPending ? 'Memproses...' : 'Ya, Ubah'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Confirmation Modal */}
      <AnimatePresence>
        {showProfileConfirmModal && (
          <motion.div
            key="confirm-profile-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowProfileConfirmModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white p-7 text-center shadow-2xl border border-gray-100"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-500 shadow-inner">
                <UserCircle className="h-7 w-7" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">Simpan Perubahan?</h3>
              <p className="mb-8 text-sm text-gray-500 leading-relaxed">
                Anda yakin ingin menyimpan perubahan informasi profil ini?
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1 rounded-xl text-gray-700 bg-gray-100 hover:bg-gray-200 h-11 font-semibold"
                  onClick={() => setShowProfileConfirmModal(false)}
                  disabled={profileMut.isPending}
                >
                  Batal
                </Button>
                <Button
                  style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
                  className="flex-1 rounded-xl text-white hover:opacity-90 h-11 font-bold shadow-md border-none"
                  onClick={handleConfirmProfileUpdate}
                  disabled={profileMut.isPending}
                >
                  {profileMut.isPending ? 'Menyimpan...' : 'Ya, Simpan'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview & Change Modal */}
      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            key="preview-avatar-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setShowPreviewModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm md:max-w-md overflow-hidden rounded-[2rem] bg-white p-6 shadow-2xl border border-gray-100 flex flex-col items-center animate-none"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPreviewModal(false)}
                className="absolute right-5 top-5 rounded-full p-1.5 hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-gray-900 mb-5">Foto Profil</h3>

              {/* Large Image View */}
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-[2rem] overflow-hidden bg-slate-50 shadow-inner border border-slate-200/80 mb-6 relative">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
                    <UserIcon className="w-24 h-24" />
                  </div>
                )}
                
                {(uploadAvatarMut.isPending || deleteAvatarMut.isPending) && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center backdrop-blur-[1px]">
                    <Loader2 className="h-10 w-10 animate-spin text-[#F9D141]" />
                  </div>
                )}
              </div>

              {/* Edit / Change Actions */}
              <div className="w-full space-y-2.5">
                <Button
                  style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
                  className="w-full rounded-xl text-white font-bold hover:opacity-90 active:scale-95 h-11 flex items-center justify-center gap-2 shadow-md border-none cursor-pointer transition-all"
                  onClick={() => {
                    fileInputRef.current?.click()
                  }}
                  disabled={uploadAvatarMut.isPending || deleteAvatarMut.isPending}
                >
                  <Camera className="w-4 h-4" />
                  Pilih Foto Baru
                </Button>

                {user?.avatarUrl && (
                  <Button
                    style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
                    className="w-full rounded-xl text-white font-bold hover:opacity-90 active:scale-95 h-11 flex items-center justify-center gap-2 shadow-md border-none cursor-pointer transition-all"
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin menghapus foto profil ini?')) {
                        deleteAvatarMut.mutate()
                      }
                    }}
                    disabled={uploadAvatarMut.isPending || deleteAvatarMut.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                    Hapus Foto Profil
                  </Button>
                )}

                <Button
                  style={{ background: 'linear-gradient(90deg, #FFD641 0%, #515151 100%)' }}
                  className="w-full rounded-xl text-white font-bold hover:opacity-90 active:scale-95 h-11 shadow-md border-none cursor-pointer transition-all"
                  onClick={() => setShowPreviewModal(false)}
                  disabled={uploadAvatarMut.isPending || deleteAvatarMut.isPending}
                >
                  Tutup
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
