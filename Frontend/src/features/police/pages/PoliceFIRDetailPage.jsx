import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useFIRDetail } from '@/features/citizen/api/firApi'
import { useUpdateFIRStatus } from '../api/policeDashApi'
import { aiApi } from '@/api/aiApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import StatusBadge from '@/components/shared/StatusBadge'
import TimelineView from '@/components/shared/TimelineView'
import { ArrowLeft, Calendar, MapPin, User, FileText, Clock, Shield, Loader2, ArrowRightLeft, Sparkles, AlertCircle, BookOpen, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'

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
  const [riskResult, setRiskResult] = useState(null)
  const [isAssessing, setIsAssessing] = useState(false)

  const fir = data?.fir || data
  if (isLoading) return <div className="space-y-4 max-w-5xl mx-auto">{[1,2,3].map((i) => <Skeleton key={i} className="h-40 rounded-[28px]" />)}</div>
  if (!fir) return <div className="text-center py-20 text-slate-500">FIR not found</div>

  const availableStatuses = NEXT_STATUS[fir.status] || []
  const handleUpdateStatus = () => {
    if (!newStatus) return
    updateMutation.mutate({ id, status: newStatus, message: statusMsg }, { onSuccess: () => { setStatusDialog(false); setNewStatus(''); setStatusMsg('') } })
  }

  const handleRiskAssessment = async () => {
    const scenario = `${fir.incident?.title || ''}. ${fir.incident?.description || ''}. Category: ${fir.incident?.category || 'unknown'}. Location: ${fir.incident?.address || 'unknown'}.`
    if (scenario.trim().length < 25) {
      toast.error('FIR does not have enough detail for AI assessment.')
      return
    }
    setIsAssessing(true)
    try {
      const result = await aiApi.assessRisk(scenario)
      setRiskResult(result)
      toast.success('Risk assessment complete!')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.error || 'Failed to connect to AI engine.')
    } finally {
      setIsAssessing(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 rounded-xl text-slate-500 hover:text-slate-800"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back</Button>

      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#1f3a8a_0%,#1d4ed8_50%,#0f766e_100%)] p-6 sm:p-8 shadow-[0_26px_64px_rgba(30,64,175,0.18)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-3">{fir.firNumber && <Badge className="bg-white/15 text-white border-white/10 font-mono text-xs rounded-full">#{fir.firNumber}</Badge>}<Badge className="bg-white/15 text-white border-white/10 capitalize text-xs rounded-full">{fir.incident?.category}</Badge></div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{fir.incident?.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-white/75 text-sm">
                <span className="flex items-center gap-1"><User className="h-4 w-4" />{fir.citizenId?.name || 'Citizen'}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDate(fir.createdAt)}</span>
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{fir.incident?.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-2"><StatusBadge status={fir.status} className="text-sm px-3 py-1" /></div>
          </div>
        </div>
      </div>

      {availableStatuses.length > 0 && (
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-sm"><span className="font-semibold text-slate-900">Update Case Status:</span><span className="text-slate-500 ml-2">Move this FIR to the next stage</span></div>
            <Button onClick={() => setStatusDialog(true)} className="rounded-2xl bg-slate-900 hover:bg-slate-800"><ArrowRightLeft className="mr-1.5 h-4 w-4" /> Change Status</Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[28px] border-teal-200 bg-teal-50/70 shadow-[0_14px_34px_rgba(13,148,136,0.06)]">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm">
            <span className="font-semibold text-teal-900 flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-teal-600" /> AI Risk Assessment</span>
            <span className="text-teal-700 block mt-0.5">Run AI analysis to assess severity, identify risks, and get recommended actions for this FIR.</span>
          </div>
          <Button onClick={handleRiskAssessment} disabled={isAssessing} className="bg-teal-600 hover:bg-teal-700 shrink-0 rounded-2xl">
            {isAssessing ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-1.5 h-4 w-4" />}
            {riskResult ? 'Re-run Assessment' : 'Run Assessment'}
          </Button>
        </CardContent>
      </Card>

      {riskResult && (
        <div className="space-y-4">
          {riskResult.summary && (
            <Card className="rounded-[28px] border-amber-200 bg-amber-50/70"><CardHeader><CardTitle className="flex items-center gap-2 text-base text-slate-900"><ShieldAlert className="h-4 w-4 text-amber-600" /> Risk Summary</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">{riskResult.summary}</p></CardContent></Card>
          )}

          {riskResult.legal_provisions?.length > 0 && (
            <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <CardHeader><CardTitle className="flex items-center gap-2 text-base text-slate-900"><BookOpen className="h-4 w-4 text-blue-600" /> Applicable Sections</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {riskResult.legal_provisions.map((p, i) => (
                  <div key={i} className="rounded-2xl border border-slate-200 p-3 bg-slate-50/70 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {p.act && <Badge className="bg-blue-100 text-blue-800 border-0 rounded-full">{p.act}</Badge>}
                      {p.section && <Badge variant="outline" className="rounded-full">{p.section}</Badge>}
                    </div>
                    <p className="text-sm text-slate-500">{p.description || p.title || p.text || JSON.stringify(p)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {riskResult.explanation && (
            <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]"><CardHeader><CardTitle className="text-base text-slate-900">Detailed Analysis</CardTitle></CardHeader><CardContent><p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{riskResult.explanation}</p></CardContent></Card>
          )}

          {riskResult.recommended_actions?.length > 0 && (
            <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <CardHeader><CardTitle className="text-base text-slate-900">Recommended Actions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {riskResult.recommended_actions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-teal-500 font-bold mt-0.5">→</span> {a}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {riskResult.disclaimer && (
            <Card className="rounded-[28px] border-amber-200 bg-amber-50/70"><CardContent className="p-3 flex items-start gap-2"><AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" /><p className="text-xs text-amber-800 leading-relaxed">{riskResult.disclaimer}</p></CardContent></Card>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]"><CardHeader><CardTitle className="text-base flex items-center gap-2 text-slate-900"><FileText className="h-4 w-4 text-blue-600" /> Description</CardTitle></CardHeader><CardContent><p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{fir.incident?.description}</p></CardContent></Card>
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]"><CardHeader><CardTitle className="text-base flex items-center gap-2 text-slate-900"><Clock className="h-4 w-4 text-purple-600" /> Timeline</CardTitle></CardHeader><CardContent><TimelineView events={fir.timeline || []} /></CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-slate-900"><User className="h-4 w-4 text-blue-600" /> Complainant</CardTitle></CardHeader><CardContent><div className="p-4 bg-slate-50 rounded-2xl text-sm"><div className="font-medium text-slate-900">{fir.citizenId?.name}</div><div className="text-slate-500">{fir.citizenId?.email}</div><div className="text-slate-500">{fir.citizenId?.phone}</div></div></CardContent></Card>
          <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2 text-slate-900"><Shield className="h-4 w-4 text-rose-600" /> Station</CardTitle></CardHeader><CardContent><div className="p-4 bg-slate-50 rounded-2xl text-sm"><div className="font-medium text-slate-900">{fir.stationId?.stationName}</div><div className="text-slate-500">{fir.stationId?.stationAddress || fir.stationId?.district}</div></div></CardContent></Card>
        </div>
      </div>

      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent className="sm:max-w-md rounded-[28px] border-slate-200">
          <DialogHeader><DialogTitle>Update FIR Status</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <Select onValueChange={setNewStatus} value={newStatus}>
              <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Select new status" /></SelectTrigger>
              <SelectContent>{availableStatuses.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
            </Select>
            <Textarea placeholder="Add a status update message..." value={statusMsg} onChange={(e) => setStatusMsg(e.target.value)} rows={3} className="rounded-xl border-slate-200 bg-slate-50/70" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)} className="rounded-xl border-slate-200">Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={!newStatus || updateMutation.isPending} className="rounded-xl bg-blue-700 hover:bg-blue-800">
              {updateMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null} Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}