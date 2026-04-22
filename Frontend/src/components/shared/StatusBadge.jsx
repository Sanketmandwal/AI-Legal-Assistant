// src/components/shared/StatusBadge.jsx
import { Badge } from '@/components/ui/badge'

const STATUS_CONFIG = {
  // FIR statuses
  submitted: { label: 'Submitted', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  accepted: { label: 'Accepted', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' },
  investigating: { label: 'Investigating', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  resolved: { label: 'Resolved', className: 'bg-green-100 text-green-800 border-green-200' },
  closed: { label: 'Closed', className: 'bg-slate-100 text-slate-800 border-slate-200' },

  // Consultation statuses
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  declined: { label: 'Declined', className: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 border-slate-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' },
  not_requested: { label: 'Not Requested', className: 'bg-slate-100 text-slate-600 border-slate-200' },

  // Chat
  active: { label: 'Active', className: 'bg-green-100 text-green-800 border-green-200' },

  // Verification
  approved: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-200' },

  // Availability
  available: { label: 'Available', className: 'bg-green-100 text-green-800 border-green-200' },
  busy: { label: 'Busy', className: 'bg-orange-100 text-orange-800 border-orange-200' },
  offline: { label: 'Offline', className: 'bg-slate-100 text-slate-600 border-slate-200' },
}

export default function StatusBadge({ status, className = '' }) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  }

  return (
    <Badge variant="outline" className={`${config.className} font-medium text-xs ${className}`}>
      {config.label}
    </Badge>
  )
}
