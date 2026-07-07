import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
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

const schema = z.object({
  fullName: z.string().min(2, 'Nama wajib diisi'),
  email: z.email('Email tidak valid'),
  password: z.string().min(8, 'Minimal 8 karakter'),
  phone: z.string().optional(),
})

type Form = z.infer<typeof schema>

export function SignupPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', email: '', password: '', phone: '' },
  })

  const mutation = useMutation({
    mutationFn: (v: Form) => registerRequest(v),
    onSuccess: (res) => {
      setSession(res.data.user, res.data.accessToken)
      toast.success('Akun berhasil dibuat!')
      navigate('/dashboard', { replace: true })
    },
    onError: (e: Error) => toast.error(e.message),
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
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[4px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/60 to-white/95" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/80 backdrop-blur-md shadow-xl border border-white/60 overflow-hidden p-2 transition-transform hover:scale-105">
            <img src="/logo.png" alt="Logo Semarang" className="h-full w-full object-contain" />
          </Link>
          <h1 className="text-2xl font-semibold text-slate-900 drop-shadow-sm">
            Daftar ke <span className="text-gradient font-bold drop-shadow">FixMind</span>
          </h1>
          <p className="mt-2 text-sm text-slate-700 font-medium drop-shadow-sm">Mulai laporkan dan pantau perbaikan fasilitas</p>
        </div>

        <GlassCard className="p-8 shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-white/60 bg-white/80 backdrop-blur-xl">
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="fullName">Nama Lengkap</label>
              <Input id="fullName" placeholder="John Doe" {...form.register('fullName')} className="bg-white/90 focus:bg-white transition-colors border-white/60 text-slate-900 placeholder:text-slate-400" />
              {form.formState.errors.fullName && (
                <p className="text-xs text-danger">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="nama@email.com" {...form.register('email')} className="bg-white/90 focus:bg-white transition-colors border-white/60 text-slate-900 placeholder:text-slate-400" />
              {form.formState.errors.email && (
                <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="phone">Telepon (Opsional)</label>
              <Input id="phone" placeholder="08123456789" {...form.register('phone')} className="bg-white/90 focus:bg-white transition-colors border-white/60 text-slate-900 placeholder:text-slate-400" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="password">Kata Sandi</label>
              <PasswordInput id="password" placeholder="••••••••" {...form.register('password')} className="bg-white/90 focus:bg-white transition-colors border-white/60 text-slate-900 placeholder:text-slate-400" />
              {form.formState.errors.password && (
                <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
              )}
            </div>
            {mutation.isError && <Alert>{(mutation.error as Error).message}</Alert>}
            <Button type="submit" className="w-full mt-2 h-11 text-base shadow-lg hover:shadow-xl transition-all" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sedang Mendaftar...' : 'Daftar Sekarang'}
            </Button>
          </form>
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
