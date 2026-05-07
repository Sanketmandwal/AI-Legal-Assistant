// src/components/shared/DocumentPreviewModal.jsx
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ChevronLeft, ChevronRight, Download, Image, File, Video,
  FileText, ZoomIn, ZoomOut, X, Maximize2
} from 'lucide-react'

/**
 * Derive a human-friendly display name from a Cloudinary public_id or filename.
 *
 * e.g.  "secure/users/69ae…/aadhar/auhoinxij0kvgd0vi6xy" → "Aadhar Document"
 *       "secure/users/69ae…/role-docs"                   → "Role Document"
 *       "IMG_20230915_123456.jpg"                         → "IMG_20230915_123456.jpg"
 */
export function friendlyDocName(publicId, filename, index) {
  // If we have a real filename (not a cloudinary hash), prefer it
  if (filename && !filename.match(/^[a-z0-9]{20,}$/i)) return filename

  if (!publicId) return filename || `Document ${(index ?? 0) + 1}`

  const id = publicId.toLowerCase()

  // Aadhar documents
  if (id.includes('aadhar')) return `Aadhaar Card ${index != null && index > 0 ? index + 1 : ''}`

  // Role documents (bar certificate, police ID, etc.)
  if (id.includes('role-doc') || id.includes('role_doc')) return `Role Verification Document ${index != null && index > 0 ? index + 1 : ''}`

  // Evidence
  if (id.includes('evidence')) return `Evidence File ${index != null ? index + 1 : ''}`

  // FIR
  if (id.includes('fir')) return `FIR Attachment ${index != null ? index + 1 : ''}`

  // Chat attachments
  if (id.includes('chat')) return `Chat Attachment ${index != null ? index + 1 : ''}`

  // Fallback: try to extract meaningful last segment
  const segments = publicId.split('/')
  const last = segments[segments.length - 1]

  // If it looks like a hash (all lowercase alphanumeric), use generic name
  if (/^[a-z0-9]{10,}$/.test(last)) {
    // Check parent folder for context
    const parent = segments.length > 1 ? segments[segments.length - 2] : ''
    if (parent === 'aadhar') return `Aadhaar Card ${index != null && index > 0 ? index + 1 : ''}`
    if (parent.includes('role')) return `Role Document ${index != null && index > 0 ? index + 1 : ''}`
    return `Document ${(index ?? 0) + 1}`
  }

  // Otherwise, prettify the last segment
  return last
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim() || `Document ${(index ?? 0) + 1}`
}

const RESOURCE_ICONS = { image: Image, video: Video, raw: File }
const RESOURCE_COLORS = {
  image: { icon: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  video: { icon: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  raw: { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
}

function getResourceType(url, explicitType) {
  if (explicitType) return explicitType
  if (!url) return 'raw'
  const lower = url.toLowerCase()
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/)) return 'image'
  if (lower.match(/\.(mp4|mov|avi|webm|mkv)(\?|$)/)) return 'video'
  return 'raw'
}

/**
 * Premium document preview modal with in-app viewing.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - documents: Array<{ url, publicId?, filename?, resourceType? }>
 * - initialIndex?: number (which document to show first)
 * - title?: string
 */
export default function DocumentPreviewModal({ open, onClose, documents = [], initialIndex = 0, title = 'Document Preview' }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [zoom, setZoom] = useState(1)

  if (!documents.length) return null

  const doc = documents[currentIndex] || documents[0]
  const resType = getResourceType(doc.url, doc.resourceType)
  const displayName = friendlyDocName(doc.publicId || doc.public_id, doc.filename, currentIndex)
  const ResIcon = RESOURCE_ICONS[resType] || File
  const colors = RESOURCE_COLORS[resType] || RESOURCE_COLORS.raw

  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < documents.length - 1

  const goTo = (idx) => { setCurrentIndex(idx); setZoom(1) }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5 bg-card">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors.bg} ${colors.border} border`}>
              <ResIcon className={`h-4 w-4 ${colors.icon}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{displayName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">{resType}</Badge>
                {documents.length > 1 && (
                  <span className="text-[10px] text-muted-foreground">{currentIndex + 1} of {documents.length}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {resType === 'image' && (
              <>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} disabled={zoom <= 0.5}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-[10px] text-muted-foreground w-8 text-center">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.min(3, z + 0.25))} disabled={zoom >= 3}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            {doc.url && (
              <a href={doc.url} download className="inline-flex">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Preview Area */}
        <div className="relative flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 min-h-[400px] max-h-[60vh] overflow-auto">
          {resType === 'image' && doc.url ? (
            <div className="flex items-center justify-center w-full h-full p-4 overflow-auto">
              <img
                src={doc.url}
                alt={displayName}
                className="max-w-full max-h-[55vh] rounded-lg shadow-lg object-contain transition-transform duration-200 select-none"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                draggable={false}
              />
            </div>
          ) : resType === 'video' && doc.url ? (
            <div className="flex items-center justify-center w-full p-6">
              <video
                src={doc.url}
                controls
                className="max-w-full max-h-[55vh] rounded-lg shadow-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-16 px-8">
              <div className={`h-20 w-20 rounded-2xl ${colors.bg} ${colors.border} border-2 flex items-center justify-center`}>
                <ResIcon className={`h-10 w-10 ${colors.icon}`} />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground text-sm">{displayName}</p>
                <p className="text-xs text-muted-foreground mt-1">This file type cannot be previewed in-app</p>
              </div>
              {doc.url && (
                <a href={doc.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="mt-2">
                    <Maximize2 className="mr-1.5 h-3.5 w-3.5" /> Open in New Tab
                  </Button>
                </a>
              )}
            </div>
          )}

          {/* Nav Arrows */}
          {hasPrev && (
            <button
              onClick={() => goTo(currentIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 dark:bg-slate-800/90 border border-border shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-foreground" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={() => goTo(currentIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 dark:bg-slate-800/90 border border-border shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-foreground" />
            </button>
          )}
        </div>

        {/* Thumbnails strip (when multiple docs) */}
        {documents.length > 1 && (
          <div className="border-t border-border bg-card px-5 py-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {documents.map((d, i) => {
                const rt = getResourceType(d.url, d.resourceType)
                const name = friendlyDocName(d.publicId || d.public_id, d.filename, i)
                const Icon = RESOURCE_ICONS[rt] || File
                const c = RESOURCE_COLORS[rt] || RESOURCE_COLORS.raw
                const isActive = i === currentIndex
                return (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={`shrink-0 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${isActive
                      ? 'border-primary/40 bg-primary/5 text-primary shadow-sm'
                      : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:border-border'
                      }`}
                  >
                    {rt === 'image' && d.url ? (
                      <img src={d.url} alt="" className="h-7 w-7 rounded-md object-cover shrink-0" />
                    ) : (
                      <div className={`h-7 w-7 rounded-md ${c.bg} flex items-center justify-center shrink-0`}>
                        <Icon className={`h-3.5 w-3.5 ${c.icon}`} />
                      </div>
                    )}
                    <span className="max-w-[100px] truncate">{name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
