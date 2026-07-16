import { cn } from '@/lib/utils'

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'flex h-10 w-full rounded-xl border border-white/60 bg-white/70 px-3 py-2 text-sm text-foreground shadow-sm backdrop-blur-sm transition-colors placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F9D141]/30',
        className,
      )}
      {...props}
    />
  )
}
