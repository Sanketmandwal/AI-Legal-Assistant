import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function PageStack({ children, className = '' }) {
  return <div className={cn('w-full space-y-8', className)}>{children}</div>
}

export function PageHeader({ title, description, eyebrow, action, meta, className = '' }) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card p-5 shadow-sm shadow-slate-950/5 sm:p-7', className)}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          {eyebrow && <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</div>}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
            {description && <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}
          </div>
          {meta && <div className="flex flex-wrap gap-2 pt-1">{meta}</div>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
      </div>
    </section>
  )
}

export function StatCard({ icon: Icon, label, value, loading, helper }) {
  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          {loading ? <Skeleton className="mb-2 h-8 w-16 rounded-md" /> : <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>}
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          {helper && <div className="mt-1 text-xs text-muted-foreground">{helper}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

export function ActionCard({ icon: Icon, title, description, trailing }) {
  return (
    <Card className="h-full transition-colors hover:border-primary/30 hover:bg-accent/30">
      <CardContent className="flex h-full items-center gap-4 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground">{title}</div>
          {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
        </div>
        {trailing}
      </CardContent>
    </Card>
  )
}

export function ListRow({ children, className = '' }) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/30 hover:bg-accent/25', className)}>
      {children}
    </div>
  )
}
