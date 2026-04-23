// src/features/lawyer/pages/ConsultationHistoryPage.jsx
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
import { History, MessageSquare, FileText, User } from 'lucide-react'

function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }

export default function ConsultationHistoryPage() {
  const [tab, setTab] = useState('all')
  const { data, isLoading } = useLawyerHistory(tab)
  const consultations = data?.consultations || []

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10"><h1 className="text-2xl font-bold">Consultation History</h1><p className="text-blue-100 text-sm mt-1">Review your past and active consultations</p></div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="accepted">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : consultations.length === 0 ? (
        <EmptyState icon={History} title="No consultations found" description="Your consultation history will appear here." />
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => (
            <Card key={c._id} className="border-0 shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">{c.citizen?.name?.[0] || '?'}</div>
                      <h3 className="font-semibold text-slate-900">{c.citizen?.name || 'Citizen'}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    {c.fir && <div className="flex items-center gap-2 text-xs text-slate-500"><FileText className="h-3 w-3" />{c.fir.incident?.title}<Badge variant="outline" className="text-[10px] capitalize">{c.fir.incident?.category}</Badge></div>}
                    <div className="text-xs text-slate-400 mt-2">Started: {formatDate(c.createdAt)}{c.respondedAt && ` • Responded: ${formatDate(c.respondedAt)}`}</div>
                  </div>
                  {c.status === 'accepted' && c.chatRoom && (
                    <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-indigo-600"><Link to={`/lawyer/chat/${c.chatRoom._id}`}><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat</Link></Button>
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
