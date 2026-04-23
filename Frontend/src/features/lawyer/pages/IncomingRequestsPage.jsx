// src/features/lawyer/pages/IncomingRequestsPage.jsx
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

function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }

export default function IncomingRequestsPage() {
  const [tab, setTab] = useState('pending')
  const { data, isLoading } = useIncomingRequests(tab)
  const respondMutation = useRespondToRequest()
  const [respondDialog, setRespondDialog] = useState(null)
  const [responseMsg, setResponseMsg] = useState('')

  const requests = data?.requests || []

  const handleRespond = (action) => {
    respondMutation.mutate({ id: respondDialog._id, action, responseMessage: responseMsg }, { onSuccess: () => { setRespondDialog(null); setResponseMsg('') } })
  }

  return (
    <PageStack>
      <PageHeader eyebrow="Requests" title="Incoming Requests" description="Review citizen consultation requests and respond with a clear next step." />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-sm grid-cols-3">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : requests.length === 0 ? (
        <EmptyState icon={Inbox} title={`No ${tab} requests`} description={tab === 'pending' ? "You're all caught up." : 'No requests found.'} />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <ListRow key={req._id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{req.citizenId?.name?.[0] || '?'}</div>
                    <div><h3 className="font-semibold text-foreground">{req.citizenId?.name || 'Citizen'}</h3><p className="text-xs text-muted-foreground">{req.citizenId?.email}</p></div>
                    <StatusBadge status={req.status} />
                  </div>
                  {req.firId && (
                    <div className="mt-3 rounded-xl border border-border bg-muted/40 p-3 text-sm">
                      <div className="flex items-center gap-2 text-foreground"><FileText className="h-3.5 w-3.5 text-primary" /><span className="font-medium">{req.firId.incident?.title}</span></div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground"><Badge variant="outline" className="text-[10px] capitalize">{req.firId.incident?.category}</Badge><span>Status: {req.firId.status}</span></div>
                    </div>
                  )}
                  <div className="mt-3 text-xs text-muted-foreground">Received: {formatDate(req.createdAt)}</div>
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 sm:flex-col">
                    <Button size="sm" onClick={() => setRespondDialog({ ...req, action: 'accept' })}><CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accept</Button>
                    <Button size="sm" variant="outline" className="border-destructive/25 text-destructive hover:bg-destructive/10" onClick={() => setRespondDialog({ ...req, action: 'decline' })}><X className="mr-1.5 h-3.5 w-3.5" /> Decline</Button>
                  </div>
                )}
              </div>
            </ListRow>
          ))}
        </div>
      )}

      <Dialog open={!!respondDialog} onOpenChange={(open) => !open && setRespondDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{respondDialog?.action === 'accept' ? 'Accept Request' : 'Decline Request'}</DialogTitle></DialogHeader>
          <Textarea placeholder="Add a message (optional)" value={responseMsg} onChange={(e) => setResponseMsg(e.target.value)} rows={3} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespondDialog(null)}>Cancel</Button>
            <Button onClick={() => handleRespond(respondDialog?.action === 'accept' ? 'accepted' : 'declined')} disabled={respondMutation.isPending} variant={respondDialog?.action === 'accept' ? 'default' : 'destructive'}>
              {respondMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}{respondDialog?.action === 'accept' ? 'Accept & Create Chat' : 'Decline'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageStack>
  )
}
