// src/components/common/EmptyState.jsx
import { Button } from '@/components/ui/button'
import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Nothing here yet',
  description = 'There are no items to display.',
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
        <Icon className="size-7" />
      </div>
      <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
