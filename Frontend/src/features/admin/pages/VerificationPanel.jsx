// src/features/admin/pages/VerificationPanel.jsx
import { useState } from 'react'
import { usePendingVerifications, useApproveLawyer, useRejectLawyer, useApprovePolice, useRejectPolice, useUserDocuments } from '../api/adminApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import EmptyState from '@/components/common/EmptyState'
import { ShieldCheck, Users, Shield, CheckCircle, X, Loader2, Eye, Mail, Phone, Briefcase, MapPin, FileText } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10"><h1 className="text-2xl font-bold">Verification Panel</h1><p className="text-violet-100 text-sm mt-1">Review and verify lawyer/police registrations • {data?.totalPending || 0} pending</p></div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-sm">
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
          <TabsTrigger value="lawyers">Lawyers ({lawyers.length})</TabsTrigger>
          <TabsTrigger value="police">Police ({police.length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState icon={CheckCircle} title="No pending verifications" description="All registrations have been processed." />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item._id} className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${item._type === 'lawyer' ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-rose-500 to-red-600'}`}>
                        {item.userId?.name?.[0] || '?'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{item.userId?.name}</div>
                        <Badge className={`text-[10px] capitalize ${item._type === 'lawyer' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} border-0`}>{item._type}</Badge>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5"><Mail className="h-3 w-3 text-slate-400" />{item.userId?.email}</div>
                      <div className="flex items-center gap-1.5"><Phone className="h-3 w-3 text-slate-400" />{item.userId?.phone}</div>
                      {item._type === 'lawyer' && (<>
                        <div className="flex items-center gap-1.5"><Briefcase className="h-3 w-3 text-slate-400" />Bar: {item.barId || 'N/A'}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-slate-400" />{item.city}, {item.state}</div>
                      </>)}
                      {item._type === 'police' && (<>
                        <div className="flex items-center gap-1.5"><Shield className="h-3 w-3 text-slate-400" />{item.stationName || 'N/A'}</div>
                        <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-slate-400" />{item.district}, {item.state}</div>
                      </>)}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-green-600" onClick={() => handleApprove(item)} disabled={approveLawyer.isPending || approvePolice.isPending}>
                      {(approveLawyer.isPending || approvePolice.isPending) ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="mr-1 h-3.5 w-3.5" />} Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200" onClick={() => setRejectDialog(item)}><X className="mr-1 h-3.5 w-3.5" /> Reject</Button>
                    <Button size="sm" variant="ghost" className="text-xs" onClick={() => setViewDocsUserId(item.userId?._id)}><Eye className="mr-1 h-3 w-3" /> Docs</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={(o) => !o && setRejectDialog(null)}>
        <DialogContent><DialogHeader><DialogTitle>Reject Verification</DialogTitle></DialogHeader>
          <Textarea placeholder="Reason for rejection..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} />
          <DialogFooter><Button variant="outline" onClick={() => setRejectDialog(null)}>Cancel</Button><Button variant="destructive" onClick={handleReject}>Reject</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Documents Dialog */}
      <Dialog open={!!viewDocsUserId} onOpenChange={(o) => !o && setViewDocsUserId(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>User Documents</DialogTitle></DialogHeader>
          {docsLoading ? <div className="space-y-2">{[1,2].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(docsData?.documents || []).length === 0 ? <p className="text-sm text-slate-500">No documents found.</p> : docsData.documents.map((doc, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4 text-blue-500" /><span className="truncate max-w-xs">{doc.public_id}</span></div>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"><Button size="sm" variant="outline"><Eye className="mr-1 h-3 w-3" /> View</Button></a>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
