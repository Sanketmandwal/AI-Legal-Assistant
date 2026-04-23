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
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mb-5 shadow-inner">
        <Icon className="h-9 w-9 text-slate-300" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
