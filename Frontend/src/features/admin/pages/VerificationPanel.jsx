import { useState } from 'react'
import { usePendingVerifications, useVerificationHistory, useApproveLawyer, useRejectLawyer, useApprovePolice, useRejectPolice, useUserDocuments } from '../api/adminApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import EmptyState from '@/components/common/EmptyState'
import { ListRow, PageHeader, PageStack } from '@/components/common/PageShell'
import DocumentPreviewModal, { friendlyDocName } from '@/components/shared/DocumentPreviewModal'
import { Users, Shield, CheckCircle, X, Loader2, Eye, Mail, Phone, Briefcase, MapPin, FileText, Image, File, Video } from 'lucide-react'

const RESOURCE_ICONS = { image: Image, video: Video, raw: File }
const RESOURCE_COLORS = {
  image: { icon: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
  video: { icon: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  raw: { icon: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
}
function getResourceType(url) {
  if (!url) return 'raw'
  const lower = url.toLowerCase()
  if (lower.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|avif)(\?|$)/) || lower.includes('/image/')) return 'image'
  if (lower.match(/\.(mp4|mov|avi|webm|mkv)(\?|$)/) || lower.includes('/video/')) return 'video'
  return 'raw'
}

export default function VerificationPanel() {
  const [viewMode, setViewMode] = useState('pending')
  const { data: pendingData, isLoading: pendingLoading } = usePendingVerifications()
  const { data: historyData, isLoading: historyLoading } = useVerificationHistory()
  const [tab, setTab] = useState('all')
  const [rejectDialog, setRejectDialog] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [viewDocsUserId, setViewDocsUserId] = useState(null)
  const [previewDoc, setPreviewDoc] = useState(null)

  const approveLawyer = useApproveLawyer()
  const rejectLawyer = useRejectLawyer()
  const approvePolice = useApprovePolice()
  const rejectPolice = useRejectPolice()
  const { data: docsData, isLoading: docsLoading } = useUserDocuments(viewDocsUserId)

  const currentData = viewMode === 'pending' ? pendingData : historyData
  const isLoading = viewMode === 'pending' ? pendingLoading : historyLoading

  const lawyers = currentData?.lawyers || []
  const police = currentData?.police || []
  const all = [...lawyers.map((l) => ({ ...l, _type: 'lawyer' })), ...police.map((p) => ({ ...p, _type: 'police' }))]
  const items = tab === 'lawyers' ? lawyers.map((l) => ({ ...l, _type: 'lawyer' })) : tab === 'police' ? police.map((p) => ({ ...p, _type: 'police' })) : all

  const handleApprove = (item) => {
    if (item._type === 'lawyer') approveLawyer.mutate(item._id)
    else approvePolice.mutate(item._id)
  }

  const handleReject = () => {
    if (!rejectDialog) return
    if (rejectDialog._type === 'lawyer') rejectLawyer.mutate({ id: rejectDialog._id, reason: rejectReason })
    else rejectPolice.mutate({ id: rejectDialog._id, reason: rejectReason })
    setRejectDialog(null)
    setRejectReason('')
  }

  const previewDocs = (docsData?.documents || []).map((doc, i) => ({
    url: doc.url,
    publicId: doc.public_id,
    resourceType: doc.resource_type || getResourceType(doc.url),
    filename: friendlyDocName(doc.public_id, null, i),
  }))

  return (
    <PageStack>
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#0f766e_100%)] p-6 sm:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader eyebrow="Verification" title="Verification Panel" description={viewMode === 'pending' ? `Review lawyer and police registrations. ${pendingData?.totalPending || 0} pending.` : `History of verifications accepted by you. ${historyData?.totalHistory || 0} completed.`} className="flex-1" />
          <div className="flex gap-2 rounded-2xl border border-white/10 p-1 bg-white/10 backdrop-blur">
            <Button variant={viewMode === 'pending' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('pending')} className={viewMode === 'pending' ? 'bg-white text-slate-900 hover:bg-white/90' : 'text-white hover:bg-white/10'}>Pending Requests</Button>
            <Button variant={viewMode === 'history' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('history')} className={viewMode === 'history' ? 'bg-white text-slate-900 hover:bg-white/90' : 'text-white hover:bg-white/10'}>Verification History</Button>
          </div>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-sm grid-cols-3 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <TabsTrigger value="all" className="rounded-xl">All ({all.length})</TabsTrigger>
          <TabsTrigger value="lawyers" className="rounded-xl">Lawyers ({lawyers.length})</TabsTrigger>
          <TabsTrigger value="police" className="rounded-xl">Police ({police.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 rounded-[28px]" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={CheckCircle} title={viewMode === 'pending' ? 'No pending verifications' : 'No history found'} description={viewMode === 'pending' ? 'All registrations have been processed.' : "You haven't verified any profiles yet."} />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ListRow key={item._id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      {item.userId?.name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{item.userId?.name}</div>
                      <Badge variant="outline" className="text-[10px] capitalize rounded-full border-slate-200">{item._type}</Badge>
                    </div>
                  </div>

                  <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
                    <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" />{item.userId?.email}</div>
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{item.userId?.phone}</div>
                    {item._type === 'lawyer' && (<>
                      <div className="flex items-center gap-1.5"><Briefcase className="h-3 w-3" />Bar: {item.barId || 'N/A'}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{item.city}, {item.state}</div>
                    </>)}
                    {item._type === 'police' && (<>
                      <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" />{item.stationName || 'N/A'}</div>
                      <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" />{item.district}, {item.state}</div>
                    </>)}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                  {viewMode === 'pending' ? (
                    <>
                      <Button size="sm" onClick={() => handleApprove(item)} disabled={approveLawyer.isPending || approvePolice.isPending} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">
                        {(approveLawyer.isPending || approvePolice.isPending) ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="mr-1 h-3.5 w-3.5" />} Approve
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-xl border-red-200 text-red-600 hover:bg-red-50" onClick={() => setRejectDialog(item)}><X className="mr-1 h-3.5 w-3.5" /> Reject</Button>
                    </>
                  ) : (
                    <div className="text-xs text-slate-500 flex flex-col items-end gap-1">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full">Approved</Badge>
                      <span>{new Date(item.verifiedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Button size="sm" variant="ghost" className="text-xs rounded-xl text-slate-600" onClick={() => setViewDocsUserId(item.userId?._id)}><Eye className="mr-1 h-3 w-3" /> Docs</Button>
                </div>
              </div>
            </ListRow>
          ))}
        </div>
      )}

      <Dialog open={!!rejectDialog} onOpenChange={(o) => !o && setRejectDialog(null)}>
        <DialogContent className="rounded-[28px] border-slate-200"><DialogHeader><DialogTitle>Reject Verification</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="rounded-xl border-slate-200 bg-slate-50/70" />
          <DialogFooter><Button variant="outline" onClick={() => setRejectDialog(null)} className="rounded-xl border-slate-200">Cancel</Button><Button variant="destructive" onClick={handleReject} className="rounded-xl">Reject</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewDocsUserId} onOpenChange={(o) => !o && setViewDocsUserId(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-hidden rounded-[28px] border-slate-200">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-emerald-600" /> User Documents</DialogTitle>
          </DialogHeader>
          {docsLoading ? (
            <div className="space-y-3 py-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : previewDocs.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600">No documents found</p>
              <p className="text-xs text-slate-400 mt-1">This user hasn't uploaded any verification documents yet.</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
              {previewDocs.map((doc, i) => {
                const resType = doc.resourceType || 'raw'
                const ResIcon = RESOURCE_ICONS[resType] || File
                const colors = RESOURCE_COLORS[resType] || RESOURCE_COLORS.raw
                return (
                  <button
                    key={i}
                    onClick={() => setPreviewDoc({ docs: previewDocs, index: i })}
                    className="w-full flex items-center gap-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-emerald-200 p-4 transition-all group text-left"
                  >
                    {resType === 'image' && doc.url ? (
                      <img src={doc.url} alt={doc.filename} className="h-14 w-14 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0" />
                    ) : (
                      <div className={`h-14 w-14 rounded-xl ${colors.bg} ${colors.border} border flex items-center justify-center shrink-0`}>
                        <ResIcon className={`h-6 w-6 ${colors.icon}`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition-colors">{doc.filename}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0 rounded-full">{resType}</Badge>
                      </div>
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-emerald-600" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <DocumentPreviewModal open={!!previewDoc} onClose={() => setPreviewDoc(null)} documents={previewDoc?.docs || []} initialIndex={previewDoc?.index || 0} title="Document Preview" />
    </PageStack>
  )
}