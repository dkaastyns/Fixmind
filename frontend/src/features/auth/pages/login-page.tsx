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
import { loginRequest } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'
import { handleApiError } from '@/lib/utils'

const schema = z.object({
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Minimal 8 karakter'),
})

type Form = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: (v: Form) => loginRequest(v.email, v.password),
    onSuccess: (res) => {
      setSession(res.data.user, res.data.accessToken)
      toast.success('Selamat datang kembali!')
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

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
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
            <span className="text-[#FFEBA1]">Masuk ke </span>
            <span className="font-extrabold">FixMind</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 font-medium">
            Kelola dan pantau perbaikan fasilitas Anda
          </p>
        </div>

        {/* Login Card - Dark Glassmorphism style */}
        <div className="p-6 sm:p-8 rounded-[24px] border border-white/10 bg-slate-950/15 shadow-[0_20px_45px_rgba(0,0,0,0.5)] backdrop-blur-[2px]">
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
            
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
                className="bg-white/95 focus:bg-white transition-colors border-none text-slate-800 placeholder:text-slate-400 disabled:opacity-60 h-11 rounded-[14px]"
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
                className="bg-white/95 focus:bg-white transition-colors border-none text-slate-800 placeholder:text-slate-400 disabled:opacity-60 h-11 rounded-[14px] pr-10"
              />
              {form.formState.errors.password && (
                <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>
              )}
            </div>

            {mutation.isError && <Alert>{(mutation.error as Error).message}</Alert>}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full mt-6 h-11 rounded-2xl text-white font-bold gradient-gold shadow-[0_8px_20px_rgba(0,0,0,0.35)] hover:opacity-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memverifikasi...
                </>
              ) : (
                'Masuk'
              )}
            </motion.button>
          </form>

          <AnimatePresence>
            {mutation.isPending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-300"
              >
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F9D141]" />
                <span>Sedang menghubungi server...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Signup Link */}
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-300">
            Belum punya akun?{' '}
            <Link to="/signup" className="font-semibold text-[#F9D141] hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

