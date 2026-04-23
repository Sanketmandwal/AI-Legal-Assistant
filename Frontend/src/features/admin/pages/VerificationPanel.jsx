// src/features/admin/pages/VerificationPanel.jsx
import { useState } from 'react'
import { usePendingVerifications, useApproveLawyer, useRejectLawyer, useApprovePolice, useRejectPolice, useUserDocuments } from '../api/adminApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import EmptyState from '@/components/common/EmptyState'
import { ListRow, PageHeader, PageStack } from '@/components/common/PageShell'
import { Users, Shield, CheckCircle, X, Loader2, Eye, Mail, Phone, Briefcase, MapPin, FileText } from 'lucide-react'

export default function VerificationPanel() {
  const { data, isLoading } = usePendingVerifications()
  const [tab, setTab] = useState('all')
  const [rejectDialog, setRejectDialog] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [viewDocsUserId, setViewDocsUserId] = useState(null)

  const approveLawyer = useApproveLawyer()
  const rejectLawyer = useRejectLawyer()
  const approvePolice = useApprovePolice()
  const rejectPolice = useRejectPolice()
  const { data: docsData, isLoading: docsLoading } = useUserDocuments(viewDocsUserId)

  const lawyers = data?.lawyers || []
  const police = data?.police || []
  const all = [...lawyers.map(l => ({ ...l, _type: 'lawyer' })), ...police.map(p => ({ ...p, _type: 'police' }))]
  const items = tab === 'lawyers' ? lawyers.map(l => ({ ...l, _type: 'lawyer' })) : tab === 'police' ? police.map(p => ({ ...p, _type: 'police' })) : all

  const handleApprove = (item) => {
    if (item._type === 'lawyer') approveLawyer.mutate(item._id)
    else approvePolice.mutate(item._id)
  }

  const handleReject = () => {
    if (!rejectDialog) return
    if (rejectDialog._type === 'lawyer') rejectLawyer.mutate({ id: rejectDialog._id, reason: rejectReason })
    else rejectPolice.mutate({ id: rejectDialog._id, reason: rejectReason })
    setRejectDialog(null); setRejectReason('')
  }

  return (
    <PageStack>
      <PageHeader eyebrow="Verification" title="Verification Panel" description={`Review lawyer and police registrations. ${data?.totalPending || 0} pending.`} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-sm grid-cols-3">
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="lawyers">Lawyers ({lawyers.length})</TabsTrigger>
          <TabsTrigger value="police">Police ({police.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={CheckCircle} title="No pending verifications" description="All registrations have been processed." />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ListRow key={item._id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {item.userId?.name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{item.userId?.name}</div>
                      <Badge variant="outline" className="text-[10px] capitalize">{item._type}</Badge>
                    </div>
                  </div>

                  <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
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

                <div className="flex flex-wrap gap-2 sm:flex-col">
                  <Button size="sm" onClick={() => handleApprove(item)} disabled={approveLawyer.isPending || approvePolice.isPending}>
                    {(approveLawyer.isPending || approvePolice.isPending) ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="mr-1 h-3.5 w-3.5" />} Approve
                  </Button>
                  <Button size="sm" variant="outline" className="border-destructive/25 text-destructive hover:bg-destructive/10" onClick={() => setRejectDialog(item)}><X className="mr-1 h-3.5 w-3.5" /> Reject</Button>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => setViewDocsUserId(item.userId?._id)}><Eye className="mr-1 h-3 w-3" /> Docs</Button>
                </div>
              </div>
            </ListRow>
          ))}
        </div>
      )}

      <Dialog open={!!rejectDialog} onOpenChange={(o) => !o && setRejectDialog(null)}>
        <DialogContent><DialogHeader><DialogTitle>Reject Verification</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          <DialogFooter><Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button><Button variant="destructive" onClick={handleReject}>Reject</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewDocsUserId} onOpenChange={(o) => !o && setViewDocsUserId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>User Documents</DialogTitle></DialogHeader>
          {docsLoading ? <div className="space-y-2">{[1, 2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> : (
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {(docsData?.documents || []).length === 0 ? <p className="text-sm text-muted-foreground">No documents found.</p> : docsData.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-3">
                  <div className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-primary" /><span className="max-w-xs truncate">{doc.public_id}</span></div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><Eye className="mr-1 h-3 w-3" /> View</Button></a>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageStack>
  )
}
