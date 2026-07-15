import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Alert } from '@/components/ui/feedback'
import { registerRequest } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { handleApiError } from '@/lib/utils'

const schema = z.object({
  fullName: z.string().min(2, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
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
      }),
    onSuccess: (res) => {
      setSession(res.data.user, res.data.accessToken)
      toast.success('Akun berhasil dibuat!')
      navigate('/dashboard', { replace: true })
    },
    onError: (e: Error) => handleApiError(e),
  })

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      
      {/* Full-screen Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/new-bg_dprd.jpg"
          alt="Latar Belakang DPRD"
          className="h-full w-full object-cover"
        />
        {/* Dark overlay with slight blur */}
        <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]" />
      </div>

      {/* Curved Neon Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-1" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          d="M -10,35 Q 20,40 10,80"
          fill="none"
          stroke="#00d2ff"
          strokeWidth="0.8"
          className="opacity-70 blur-[1px]"
        />
        <path
          d="M 110,0 Q 50,20 40,65"
          fill="none"
          stroke="#00d2ff"
          strokeWidth="0.8"
          className="opacity-70 blur-[1px]"
        />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10 my-8"
      >
        {/* Logo and Titles */}
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="max-w-[280px] sm:max-w-[320px] transition-transform hover:scale-105 duration-300">
              <img src="/jdih-logo.png" alt="JDIH Kota Semarang" className="w-full h-auto object-contain [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.8))]" />
            </div>
          </div>
          
          <h1 className="text-2xl font-semibold text-white drop-shadow-sm">
            <span className="text-[#ffd043]">Daftar ke </span>
            <span className="font-extrabold">FixMind</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium">
            Mulai laporkan dan pantau perbaikan fasilitas
          </p>
        </div>

        {/* Register Card - Dark Glassmorphism style */}
        <div className="glass-dark p-6 sm:p-8 shadow-2xl border-white/10 bg-slate-950/45 backdrop-blur-xl">
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
            
            {/* Nama Lengkap */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-white" htmlFor="fullName">
                Nama Lengkap
              </label>
              <Input
                id="fullName"
                placeholder="Goat Satoru"
                {...form.register('fullName')}
                disabled={mutation.isPending}
                className="bg-white/95 focus:bg-white transition-colors border-none text-slate-800 placeholder:text-slate-400 disabled:opacity-60 h-11 rounded-2xl"
              />
              {form.formState.errors.fullName && (
                <p className="text-xs text-red-400">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-white" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                {...form.register('email')}
                disabled={mutation.isPending}
                className="bg-white/95 focus:bg-white transition-colors border-none text-slate-800 placeholder:text-slate-400 disabled:opacity-60 h-11 rounded-2xl"
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>
              )}
            </div>

            {/* Kata Sandi */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-white" htmlFor="password">
                Kata Sandi
              </label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...form.register('password')}
                disabled={mutation.isPending}
                className="bg-white/95 focus:bg-white transition-colors border-none text-slate-800 placeholder:text-slate-400 disabled:opacity-60 h-11 rounded-2xl pr-10"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
              )}
            </div>

            {/* Konfirmasi Kata Sandi */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-semibold text-white" htmlFor="confirmPassword">
                Konfirmasi
              </label>
              <PasswordInput
                id="confirmPassword"
                placeholder="••••••••"
                {...form.register('confirmPassword')}
                disabled={mutation.isPending}
                className="bg-white/95 focus:bg-white transition-colors border-none text-slate-800 placeholder:text-slate-400 disabled:opacity-60 h-11 rounded-2xl pr-10"
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-red-400">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs sm:text-sm text-slate-200">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  {...form.register('agreeToTerms')}
                  disabled={mutation.isPending}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-white/10 text-[#ffd043] focus:ring-[#ffd043]/30 cursor-pointer accent-[#ffd043]"
                />
                <span className="leading-tight select-none">
                  Saya menyetujui{' '}
                  <Link to="/terms" className="font-semibold text-[#ffd043] hover:underline">
                    Ketentuan Layanan
                  </Link>{' '}
                  dan{' '}
                  <Link to="/privacy" className="font-semibold text-[#ffd043] hover:underline">
                    kebijakan penggunaan FixMind.
                  </Link>
                </span>
              </label>
              {form.formState.errors.agreeToTerms && (
                <p className="text-xs text-red-400 pl-[26px]">{form.formState.errors.agreeToTerms.message}</p>
              )}
            </div>

            {mutation.isError && <Alert>{(mutation.error as Error).message}</Alert>}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-4 h-11 rounded-2xl text-white font-bold gradient-gold shadow-[0_4px_15px_rgba(255,214,65,0.2)] hover:opacity-95 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mendaftarkan Akun...
                </>
              ) : (
                'Daftar sekarang!'
              )}
            </button>
          </form>

          <AnimatePresence>
            {mutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-300"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#ffd043]" />
                <span>Sedang membuat akun Anda...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Link */}
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-300">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-[#ffd043] hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

