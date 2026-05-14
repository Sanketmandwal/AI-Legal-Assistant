import { useState } from 'react'
import { useIncomingRequests, useRespondToRequest } from '../api/lawyerDashApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { ListRow, PageHeader, PageStack } from '@/components/common/PageShell'
import { Inbox, CheckCircle, X, Loader2, FileText } from 'lucide-react'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function IncomingRequestsPage() {
  const [tab, setTab] = useState('pending')
  const { data, isLoading } = useIncomingRequests(tab)
  const respondMutation = useRespondToRequest()
  const [respondDialog, setRespondDialog] = useState(null)
  const [responseMsg, setResponseMsg] = useState('')

  const requests = data?.requests || []

  const handleRespond = (action) => {
    respondMutation.mutate(
      { id: respondDialog._id, action, responseMessage: responseMsg },
      { onSuccess: () => { setRespondDialog(null); setResponseMsg('') } }
    )
  }

  return (
    <PageStack>
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_34%)]" />
        <div className="relative p-6 sm:p-8">
          <PageHeader eyebrow="Requests" title="Incoming Requests" description="Review citizen consultation requests and respond with a clear next step." />
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full max-w-xl flex flex-wrap rounded-2xl border border-slate-200 bg-white p-1 h-auto gap-1">
          <TabsTrigger value="pending" className="min-w-[96px] flex-1 rounded-xl py-2.5 px-3 text-xs sm:text-sm data-active:bg-slate-900 data-active:text-white">Pending</TabsTrigger>
          <TabsTrigger value="accepted" className="min-w-[100px] flex-1 rounded-xl py-2.5 px-3 text-xs sm:text-sm data-active:bg-emerald-600 data-active:text-white">Accepted</TabsTrigger>
          <TabsTrigger value="declined" className="min-w-[100px] flex-1 rounded-xl py-2.5 px-3 text-xs sm:text-sm data-active:bg-rose-600 data-active:text-white">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-[28px]" />)}</div>
      ) : requests.length === 0 ? (
        <EmptyState icon={Inbox} title={`No ${tab} requests`} description={tab === 'pending' ? "You're all caught up." : 'No requests found.'} />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <ListRow key={req._id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-teal-50 ring-1 ring-teal-100 text-sm font-semibold text-teal-700">{req.citizenId?.name?.[0] || '?'}</div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{req.citizenId?.name || 'Citizen'}</h3>
                      <p className="text-xs text-slate-400">{req.citizenId?.email}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  {req.firId && (
                    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-900"><FileText className="h-3.5 w-3.5 text-teal-600" /><span className="font-medium">{req.firId.incident?.title}</span></div>
                      <div className="mt-2 flex items-center gap-2 flex-wrap text-xs text-slate-500"><Badge variant="outline" className="text-[10px] capitalize rounded-full border-slate-200">{req.firId.incident?.category}</Badge><span>Status: {req.firId.status}</span></div>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-slate-400">Received: {formatDate(req.createdAt)}</div>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 sm:flex-col sm:min-w-[160px]">
                    <Button size="sm" onClick={() => setRespondDialog({ ...req, action: 'accept' })} className="rounded-2xl bg-emerald-600 hover:bg-emerald-700"><CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accept</Button>
                    <Button size="sm" variant="outline" className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setRespondDialog({ ...req, action: 'decline' })}><X className="mr-1.5 h-3.5 w-3.5" /> Decline</Button>
                  </div>
                )}
              </div>
            </ListRow>
          ))}
        </div>
      )}

      <Dialog open={!!respondDialog} onOpenChange={(open) => !open && setRespondDialog(null)}>
        <DialogContent className="sm:max-w-md rounded-[28px] border-slate-200">
          <DialogHeader><DialogTitle className="text-slate-900">{respondDialog?.action === 'accept' ? 'Accept Request' : 'Decline Request'}</DialogTitle></DialogHeader>
          <Textarea placeholder="Add a message (optional)" value={responseMsg} onChange={(e) => setResponseMsg(e.target.value)} rows={4} className="rounded-2xl border-slate-200" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondDialog(null)} className="rounded-xl border-slate-200">Cancel</Button>
            <Button onClick={() => handleRespond(respondDialog?.action === 'accept' ? 'accepted' : 'declined')} disabled={respondMutation.isPending} variant={respondDialog?.action === 'accept' ? 'default' : 'destructive'} className="rounded-xl">
              {respondMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              {respondDialog?.action === 'accept' ? 'Accept & Create Chat' : 'Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageStack>
  )
}