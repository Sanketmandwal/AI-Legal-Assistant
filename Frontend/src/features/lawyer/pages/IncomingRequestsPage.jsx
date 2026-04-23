// src/features/lawyer/pages/IncomingRequestsPage.jsx
import { useState } from 'react'
import { useIncomingRequests, useRespondToRequest } from '../api/lawyerDashApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { Inbox, CheckCircle, X, Loader2, FileText, User } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10"><h1 className="text-2xl font-bold">Incoming Requests</h1><p className="text-amber-100 text-sm mt-1">Manage consultation requests from citizens</p></div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-3 w-full max-w-sm">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : requests.length === 0 ? (
        <EmptyState icon={Inbox} title={`No ${tab} requests`} description={tab === 'pending' ? "You're all caught up!" : 'No requests found.'} />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id} className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{req.citizenId?.name?.[0] || '?'}</div>
                      <div><h3 className="font-semibold text-slate-900">{req.citizenId?.name || 'Citizen'}</h3><p className="text-xs text-slate-500">{req.citizenId?.email}</p></div>
                      <StatusBadge status={req.status} />
                    </div>
                    {req.firId && (
                      <div className="p-3 bg-slate-50 rounded-xl mt-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-700"><FileText className="h-3.5 w-3.5 text-blue-500" /><span className="font-medium">{req.firId.incident?.title}</span></div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500"><Badge variant="outline" className="text-[10px] capitalize">{req.firId.incident?.category}</Badge><span>Status: {req.firId.status}</span></div>
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-2">Received: {formatDate(req.createdAt)}</div>
                  </div>
                  {req.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-green-600" onClick={() => setRespondDialog({ ...req, action: 'accept' })}><CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Accept</Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setRespondDialog({ ...req, action: 'decline' })}><X className="mr-1.5 h-3.5 w-3.5" /> Decline</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
    </div>
  )
}
