// src/features/police/pages/PoliceFIRDetailPage.jsx
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFIRDetail } from '@/features/citizen/api/firApi'
import { useUpdateFIRStatus } from '../api/policeDashApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import StatusBadge from '@/components/shared/StatusBadge'
import TimelineView from '@/components/shared/TimelineView'
import { ArrowLeft, Calendar, MapPin, User, FileText, Clock, Shield, Loader2, ArrowRightLeft } from 'lucide-react'

function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }

const NEXT_STATUS = { submitted: ['accepted', 'rejected'], accepted: ['investigating'], investigating: ['resolved'], resolved: ['closed'] }

export default function PoliceFIRDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useFIRDetail(id)
  const updateMutation = useUpdateFIRStatus()
  const [statusDialog, setStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusMsg, setStatusMsg] = useState('')

  const fir = data?.fir || data
  if (isLoading) return <div className="space-y-4 max-w-4xl mx-auto">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
  if (!fir) return <div className="text-center py-20 text-slate-500">FIR not found</div>

  const availableStatuses = NEXT_STATUS[fir.status] || []

  const handleUpdateStatus = () => {
    if (!newStatus) return
    updateMutation.mutate({ id, status: newStatus, message: statusMsg }, { onSuccess: () => { setStatusDialog(false); setNewStatus(''); setStatusMsg('') } })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 text-slate-500"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</Button>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 via-red-600 to-pink-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">{fir.firNumber && <Badge className="bg-white/20 text-white border-0 font-mono text-xs">#{fir.firNumber}</Badge>}<Badge className="bg-white/20 text-white border-0 capitalize text-xs">{fir.incident?.category}</Badge></div>
              <h1 className="text-2xl font-bold">{fir.incident?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-rose-100 text-sm">
                <span className="flex items-center gap-1"><User className="h-4 w-4" />{fir.citizenId?.name || 'Citizen'}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(fir.createdAt)}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{fir.incident?.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-2"><StatusBadge status={fir.status} className="text-sm px-3 py-1" /></div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {availableStatuses.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-rose-50 to-orange-50">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm"><span className="font-semibold text-slate-800">Update Case Status:</span><span className="text-slate-500 ml-2">Move this FIR to the next stage</span></div>
            <Button onClick={() => setStatusDialog(true)} className="bg-gradient-to-r from-rose-600 to-red-600"><ArrowRightLeft className="mr-1.5 h-4 w-4" /> Change Status</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg"><CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-blue-600" /> Description</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{fir.incident?.description}</p></CardContent></Card>
          <Card className="border-0 shadow-lg"><CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4 text-purple-600" /> Timeline</CardTitle></CardHeader><CardContent><TimelineView events={fir.timeline || []} /></CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card className="border-0 shadow-lg"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4 text-blue-600" /> Complainant</CardTitle></CardHeader><CardContent><div className="p-3 bg-slate-50 rounded-xl text-sm"><div className="font-medium">{fir.citizenId?.name}</div><div className="text-slate-500">{fir.citizenId?.email}</div><div className="text-slate-500">{fir.citizenId?.phone}</div></div></CardContent></Card>
          <Card className="border-0 shadow-lg"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-rose-600" /> Station</CardTitle></CardHeader><CardContent><div className="p-3 bg-slate-50 rounded-xl text-sm"><div className="font-medium">{fir.stationId?.stationName}</div><div className="text-slate-500">{fir.stationId?.stationAddress || fir.stationId?.district}</div></div></CardContent></Card>
        </div>
      </div>

      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Update FIR Status</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Select onValueChange={setNewStatus} value={newStatus}>
              <SelectTrigger><SelectValue placeholder="Select new status" /></SelectTrigger>
              <SelectContent>{availableStatuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Add a status update message..." value={statusMsg} onChange={(e) => setStatusMsg(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={!newStatus || updateMutation.isPending} className="bg-gradient-to-r from-rose-600 to-red-600">
              {updateMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null} Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
