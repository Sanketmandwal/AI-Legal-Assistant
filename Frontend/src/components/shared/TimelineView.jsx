// src/components/shared/TimelineView.jsx
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  AlertCircle,
  FileText,
  Shield,
  User,
  Info,
  ArrowRight,
} from 'lucide-react'

const EVENT_ICONS = {
  status_update: ArrowRight,
  police_update: Shield,
  citizen_update: User,
  evidence_added: FileText,
  system_note: Info,
}

const EVENT_COLORS = {
  status_update: 'bg-blue-500',
  police_update: 'bg-rose-500',
  citizen_update: 'bg-indigo-500',
  evidence_added: 'bg-emerald-500',
  system_note: 'bg-slate-400',
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function TimelineView({ events = [] }) {
  if (!events.length) {
    return <p className="text-sm text-slate-500 text-center py-4">No timeline events yet.</p>
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

      <div className="space-y-4">
        {events.map((event, index) => {
          const Icon = EVENT_ICONS[event.type] || Info
          const color = EVENT_COLORS[event.type] || 'bg-slate-400'

          return (
            <div key={event._id || index} className="relative flex gap-4 items-start">
              {/* Dot */}
              <div
                className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${color} shrink-0`}
              >
                <Icon className="h-4 w-4 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 bg-white rounded-lg border border-slate-100 p-3 shadow-sm">
                <p className="text-sm text-slate-800">{event.message}</p>

                {event.meta?.oldStatus && event.meta?.newStatus && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.meta.oldStatus}
                    </Badge>
                    <ArrowRight className="h-3 w-3 text-slate-400" />
                    <Badge variant="outline" className="text-xs capitalize">
                      {event.meta.newStatus}
                    </Badge>
                  </div>
                )}

                {event.attachments?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {event.attachments.map((att, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {att.filename}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                  {event.byUserId?.name && <span>by {event.byUserId.name}</span>}
                  {event.byRole && (
                    <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">
                      {event.byRole}
                    </Badge>
                  )}
                  {event.createdAt && <span>• {formatDate(event.createdAt)}</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
