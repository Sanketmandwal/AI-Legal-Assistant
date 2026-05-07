// src/components/shared/TimelineView.jsx
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import DocumentPreviewModal, { friendlyDocName } from '@/components/shared/DocumentPreviewModal'
import {
  ArrowRight, Shield, User, Info, Image, File, Video,
  FileText, Download, ExternalLink, Eye
} from 'lucide-react'

const EVENT_ICONS = {
  status_update: ArrowRight,
  police_update: Shield,
  citizen_update: User,
  evidence_added: Image,
  system_note: Info,
}

const EVENT_COLORS = {
  status_update: 'bg-blue-500',
  police_update: 'bg-rose-500',
  citizen_update: 'bg-indigo-500',
  evidence_added: 'bg-emerald-500',
  system_note: 'bg-slate-400',
}

const RESOURCE_ICONS = { image: Image, video: Video, raw: File }

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function EvidenceItem({ att, onClick }) {
  const ResIcon = RESOURCE_ICONS[att.resourceType] || File
  const isImage = att.resourceType === 'image'
  const signedUrl = att.signedUrl || att.url
  const displayName = friendlyDocName(att.publicId, att.filename, null)

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-all cursor-pointer" onClick={onClick}>
      {isImage && signedUrl ? (
        <div className="relative">
          <img src={signedUrl} alt={displayName} className="w-full h-28 object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button size="sm" variant="secondary"><Eye className="mr-1 h-3 w-3" /> Preview</Button>
          </div>
        </div>
      ) : null}
      <div className="p-2.5 flex items-center gap-2">
        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${isImage ? 'bg-blue-50' : att.resourceType === 'video' ? 'bg-purple-50' : 'bg-amber-50'}`}>
          <ResIcon className={`h-3.5 w-3.5 ${isImage ? 'text-blue-500' : att.resourceType === 'video' ? 'text-purple-500' : 'text-amber-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-slate-800 truncate">{displayName}</div>
          <div className="text-[10px] text-slate-400 capitalize">{att.resourceType}</div>
        </div>
        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
            <Eye className="h-3 w-3 text-primary" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TimelineView({ events = [] }) {
  const [previewDoc, setPreviewDoc] = useState(null)

  if (!events.length) {
    return <p className="text-sm text-slate-500 text-center py-6">No timeline events yet.</p>
  }

  const handleEvidenceClick = (eventAttachments, index) => {
    const docs = eventAttachments.map((att, i) => ({
      url: att.signedUrl || att.url,
      publicId: att.publicId,
      filename: att.filename,
      resourceType: att.resourceType,
    }))
    setPreviewDoc({ docs, index })
  }

  return (
    <>
      <div className="relative">
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-slate-300 via-slate-200 to-transparent" />

        <div className="space-y-5">
          {events.map((event, index) => {
            const Icon = EVENT_ICONS[event.type] || Info
            const color = EVENT_COLORS[event.type] || 'bg-slate-400'
            const hasEvidence = event.attachments?.length > 0

            return (
              <div key={event._id || index} className="relative flex gap-4 items-start">
                <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full ${color} shrink-0 shadow-sm`}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>

                <div className="flex-1 min-w-0 rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-800 leading-relaxed break-words whitespace-pre-wrap">{event.message}</p>

                  {event.meta?.oldStatus && event.meta?.newStatus && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-[11px] capitalize">{event.meta.oldStatus}</Badge>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <Badge variant="outline" className="text-[11px] capitalize font-semibold">{event.meta.newStatus}</Badge>
                    </div>
                  )}

                  {/* Evidence Gallery */}
                  {hasEvidence && (
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Evidence Files ({event.attachments.length})
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {event.attachments.map((att, i) => (
                          <EvidenceItem key={i} att={att} onClick={() => handleEvidenceClick(event.attachments, i)} />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-[11px] text-slate-400">
                    {event.byUserId?.name && <span className="font-medium text-slate-500">{event.byUserId.name}</span>}
                    {event.byRole && <Badge variant="outline" className="text-[9px] capitalize px-1.5 py-0">{event.byRole}</Badge>}
                    {event.createdAt && <span>• {formatDate(event.createdAt)}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <DocumentPreviewModal
        open={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        documents={previewDoc?.docs || []}
        initialIndex={previewDoc?.index || 0}
        title="Evidence Preview"
      />
    </>
  )
}
