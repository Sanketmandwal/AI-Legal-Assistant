import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLawyerHistory } from '../api/lawyerDashApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { History, MessageSquare, FileText } from 'lucide-react'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ConsultationHistoryPage() {
  const [tab, setTab] = useState('all')
  const { data, isLoading } = useLawyerHistory(tab)
  const consultations = data?.consultations || []

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f766e_0%,#0e7490_46%,#1e3a5f_100%)] p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,118,110,0.18)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Consultation History</h1>
          <p className="text-sm text-white/75 mt-1">Review your active, completed, and declined consultations.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full max-w-2xl flex flex-wrap rounded-2xl border border-slate-200 bg-white p-1 h-auto gap-1">
          <TabsTrigger value="all" className="min-w-[88px] flex-1 rounded-xl py-2.5 px-3 text-xs sm:text-sm data-active:bg-slate-900 data-active:text-white">All</TabsTrigger>
          <TabsTrigger value="accepted" className="min-w-[88px] flex-1 rounded-xl py-2.5 px-3 text-xs sm:text-sm data-active:bg-teal-600 data-active:text-white">Active</TabsTrigger>
          <TabsTrigger value="completed" className="min-w-[110px] flex-1 rounded-xl py-2.5 px-3 text-xs sm:text-sm data-active:bg-emerald-600 data-active:text-white">Completed</TabsTrigger>
          <TabsTrigger value="declined" className="min-w-[100px] flex-1 rounded-xl py-2.5 px-3 text-xs sm:text-sm data-active:bg-rose-600 data-active:text-white">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-32 rounded-[28px]" />)}</div>
      ) : consultations.length === 0 ? (
        <EmptyState icon={History} title="No consultations found" description="Your consultation history will appear here." />
      ) : (
        <div className="space-y-4">
          {consultations.map((c) => (
            <Card key={c._id} className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <div className="h-10 w-10 rounded-full bg-teal-50 ring-1 ring-teal-100 flex items-center justify-center text-teal-700 text-sm font-bold">
                        {c.citizen?.name?.[0] || '?'}
                      </div>
                      <h3 className="font-semibold text-slate-900">{c.citizen?.name || 'Citizen'}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    {c.fir && (
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                        <FileText className="h-3.5 w-3.5 text-teal-600" />
                        <span className="font-medium text-slate-700">{c.fir.incident?.title}</span>
                        <Badge variant="outline" className="text-[10px] capitalize rounded-full border-slate-200">{c.fir.incident?.category}</Badge>
                      </div>
                    )}
                    <div className="text-xs text-slate-400 mt-3 leading-6">Started: {formatDate(c.createdAt)}{c.respondedAt && ` • Responded: ${formatDate(c.respondedAt)}`}</div>
                  </div>
                  {c.status === 'accepted' && c.chatRoom && (
                    <Button size="sm" asChild className="rounded-2xl h-10 px-4 bg-teal-600 hover:bg-teal-700 shadow-sm shadow-teal-900/10"><Link to={`/lawyer/chat/${c.chatRoom._id}`} className="inline-flex items-center"><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Open Chat</Link></Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}