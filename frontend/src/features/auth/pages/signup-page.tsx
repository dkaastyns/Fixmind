import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { GlassCard } from '@/components/ui/glass-card'
import { Alert } from '@/components/ui/feedback'
import { registerRequest } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { handleApiError } from '@/lib/utils'

const schema = z.object({
  fullName: z.string().min(2, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(8, 'Nomor telepon minimal 8 karakter'),
  password: z.string().min(8, 'Minimal 8 karakter'),
  confirmPassword: z.string().min(8, 'Minimal 8 karakter'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'Anda harus menyetujui Ketentuan Layanan',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Kata sandi tidak cocok',
  path: ['confirmPassword'],
})

type Form = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
  })

  const mutation = useMutation({
    mutationFn: (v: Form) =>
      registerRequest({
        fullName: v.fullName,
        email: v.email,
        password: v.password,
        phone: v.phone,
      }),
    onSuccess: (res) => {
      setSession(res.data.user, res.data.accessToken)
      toast.success('Akun berhasil dibuat!')
      navigate('/dashboard', { replace: true })
    },
    onError: (e: Error) => handleApiError(e),
  })

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-white">
      {/* Full-screen Background Image with slow zoom animation */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 4, ease: 'easeOut' }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/bg-dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
        {/* Light overlay matching landing page */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[6px]" />
        
        {/* AI Glowing Orbs */}
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#ef629f]/20 rounded-full mix-blend-multiply filter blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, -40, 0] }} 
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[100px]" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -30, 0] }} 
          transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }}
          className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-purple-400/15 rounded-full mix-blend-multiply filter blur-[120px]" 
        />

        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/95" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Link to="/" className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-white/80 overflow-hidden p-2 transition-transform hover:scale-105">
              <img src="/logo.png" alt="Logo Semarang" className="h-full w-full object-contain" />
            </Link>
          </motion.div>
          <h1 className="text-2xl font-semibold text-slate-900 drop-shadow-sm">
            Daftar ke <span className="text-gradient font-bold drop-shadow">FixMind</span>
          </h1>
          <p className="mt-2 text-sm text-slate-700 font-medium drop-shadow-sm">Mulai laporkan dan pantau perbaikan fasilitas</p>
        </div>

        <GlassCard className="p-8 shadow-2xl shadow-[#ef629f]/15 border-white/80 bg-white/80 backdrop-blur-xl">
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="fullName">Nama Lengkap</label>
              <Input id="fullName" placeholder="Goat Satoru" {...form.register('fullName')} disabled={mutation.isPending} className="bg-white/90 focus:bg-white transition-colors border-white/60 text-slate-900 placeholder:text-slate-400 disabled:opacity-60" />
              {form.formState.errors.fullName && (
                <p className="text-xs text-danger">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="nama@email.com" {...form.register('email')} disabled={mutation.isPending} className="bg-white/90 focus:bg-white transition-colors border-white/60 text-slate-900 placeholder:text-slate-400 disabled:opacity-60" />
              {form.formState.errors.email && (
                <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="phone">Nomor Telepon</label>
              <Input id="phone" placeholder="08123456789" {...form.register('phone')} disabled={mutation.isPending} className="bg-white/90 focus:bg-white transition-colors border-white/60 text-slate-900 placeholder:text-slate-400 disabled:opacity-60" />
              {form.formState.errors.phone && (
                <p className="text-xs text-danger">{form.formState.errors.phone.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">Kata Sandi</label>
              <PasswordInput id="password" placeholder="••••••••" {...form.register('password')} disabled={mutation.isPending} className="bg-white/90 focus:bg-white transition-colors border-white/60 text-slate-900 placeholder:text-slate-400 disabled:opacity-60" />
              {form.formState.errors.password && (
                <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">Konfirmasi Kata Sandi</label>
              <PasswordInput id="confirmPassword" placeholder="••••••••" {...form.register('confirmPassword')} disabled={mutation.isPending} className="bg-white/90 focus:bg-white transition-colors border-white/60 text-slate-900 placeholder:text-slate-400 disabled:opacity-60" />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-danger">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-sm text-slate-700">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  {...form.register('agreeToTerms')}
                  disabled={mutation.isPending}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-white/60 bg-white/70 text-[#ef629f] focus:ring-[#ef629f]/30 cursor-pointer"
                />
                <span className="leading-tight select-none">
                  Saya menyetujui{' '}
                  <Link to="/terms" className="font-semibold text-[#ef629f] hover:text-pink-500 hover:underline">
                    Ketentuan Layanan
                  </Link>{' '}
                  dan kebijakan penggunaan FixMind.
                </span>
              </label>
              {form.formState.errors.agreeToTerms && (
                <p className="text-xs text-danger pl-[26px]">{form.formState.errors.agreeToTerms.message}</p>
              )}
            </div>
            {mutation.isError && <Alert>{(mutation.error as Error).message}</Alert>}
            <Button type="submit" className="w-full mt-2 h-11 text-base shadow-[0_0_20px_rgba(239,98,159,0.3)] hover:shadow-[0_0_30px_rgba(239,98,159,0.5)] hover:-translate-y-1 transition-all duration-300" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Mendaftarkan Akun...</>
              ) : 'Daftar Sekarang'}
            </Button>
          </form>
          <AnimatePresence>
            {mutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-500"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ef629f]" />
                <span>Sedang membuat akun Anda...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <p className="mt-6 text-center text-sm text-slate-600">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-[#ef629f] hover:text-pink-500 hover:underline">
              Masuk di sini
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
