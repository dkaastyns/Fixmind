import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { GlassCard } from '@/components/ui/glass-card'
import { Alert } from '@/components/ui/feedback'
import { registerRequest } from '@/lib/api-client'
import { useAuthStore } from '@/stores/auth-store'

const schema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Minimum 8 characters'),
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
      toast.success('Account created!')
      navigate('/dashboard', { replace: true })
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link to="/" className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-lg">
            <Wrench className="h-7 w-7 text-white" />
          </Link>
          <h1 className="text-2xl font-semibold">
            Create your <span className="text-gradient">FixMind</span> account
          </h1>
          <p className="mt-2 text-sm text-muted">Report and track facility maintenance</p>
        </div>

        <GlassCard>
          <form className="space-y-4" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="fullName">Full name</label>
              <Input id="fullName" placeholder="John Doe" {...form.register('fullName')} />
              {form.formState.errors.fullName && (
                <p className="text-xs text-danger">{form.formState.errors.fullName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="you@company.com" {...form.register('email')} />
              {form.formState.errors.email && (
                <p className="text-xs text-danger">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">Phone (optional)</label>
              <Input id="phone" placeholder="08123456789" {...form.register('phone')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <PasswordInput id="password" placeholder="••••••••" {...form.register('password')} />
              {form.formState.errors.password && (
                <p className="text-xs text-danger">{form.formState.errors.password.message}</p>
              )}
            </div>
            {mutation.isError && <Alert>{(mutation.error as Error).message}</Alert>}
            <Button type="submit" className="w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#ef629f] hover:underline">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  )
}
