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
import { loginRequest } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

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
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations for a more premium look */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-[#ef629f]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/60 backdrop-blur-md shadow-xl border border-white/40 overflow-hidden p-2 transition-transform hover:scale-105">
            <img src="/logo.png" alt="Logo Semarang" className="h-full w-full object-contain" />
          </Link>
          <h1 className="text-2xl font-semibold">
            Selamat Datang di <span className="text-gradient font-bold">FixMind</span>
          </h1>
          <p className="mt-2 text-sm text-muted">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        <GlassCard className="p-8 shadow-2xl border-white/50 bg-white/40">
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="nama@email.com" {...form.register('email')} className="bg-white/50 focus:bg-white transition-colors" />
              {form.formState.errors.email && (
                <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Kata Sandi</label>
              <PasswordInput id="password" placeholder="••••••••" {...form.register('password')} className="bg-white/50 focus:bg-white transition-colors" />
              {form.formState.errors.password && (
                <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
              )}
            </div>
            {mutation.isError && <Alert>{(mutation.error as Error).message}</Alert>}
            <Button type="submit" className="w-full mt-2 h-11 text-base shadow-lg hover:shadow-xl transition-all" disabled={mutation.isPending}>
              {mutation.isPending ? 'Sedang Masuk...' : 'Masuk'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            Belum punya akun?{' '}
            <Link to="/signup" className="font-semibold text-[#ef629f] hover:underline">
              Daftar di sini
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
