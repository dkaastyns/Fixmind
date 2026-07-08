import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-danger/10 text-danger',
  success: 'bg-success/10 text-success',
} as const

export function Alert({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode
  variant?: keyof typeof variants
  className?: string
}) {
  return (
    <p className={cn('rounded-xl px-3 py-2 text-sm', variants[variant], className)}>
      {children}
    </p>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-lg font-medium">{title}</p>
      {description && <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-warning/15 text-warning',
    AI_ANALYSIS: 'bg-info/15 text-info',
    REVIEWED: 'bg-info/15 text-info',
    ASSIGNED: 'bg-info/15 text-info',
    IN_PROGRESS: 'bg-warning/15 text-warning',
    COMPLETED: 'bg-success/15 text-success',
    CANCELLED: 'bg-muted/20 text-muted',
    REJECTED: 'bg-danger/15 text-danger',
    APPROVED: 'bg-success/15 text-success',
    LOW: 'bg-success/15 text-success',
    MEDIUM: 'bg-warning/15 text-warning',
    HIGH: 'bg-danger/15 text-danger',
    CRITICAL: 'bg-danger/20 text-danger',
  }

  const labels: Record<string, string> = {
    PENDING: 'Menunggu',
    AI_ANALYSIS: 'Analisis AI',
    REVIEWED: 'Ditinjau',
    ASSIGNED: 'Ditugaskan',
    IN_PROGRESS: 'Sedang Dikerjakan',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
    REJECTED: 'Ditolak',
    APPROVED: 'Disetujui',
    LOW: 'Rendah',
    MEDIUM: 'Sedang',
    HIGH: 'Tinggi',
    CRITICAL: 'Kritis',
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-lg px-2.5 py-0.5 text-xs font-medium capitalize',
        colors[status] ?? 'bg-white/50 text-muted',
      )}
    >
      {labels[status] ?? status.replace(/_/g, ' ').toLowerCase()}
    </span>
  )
}
