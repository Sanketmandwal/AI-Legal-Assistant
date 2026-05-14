import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePoliceFIRs } from '../api/policeDashApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { FileText, Search, ArrowRight, Calendar, User, MapPin } from 'lucide-react'

const STATUSES = ['all', 'submitted', 'accepted', 'investigating', 'resolved', 'closed', 'rejected']
function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }

export default function PoliceFIRsPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { data, isLoading } = usePoliceFIRs(filter === 'all' ? undefined : filter)
  const firs = (data?.firs || []).filter((f) => !search || f.incident?.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#1f3a8a_0%,#1d4ed8_50%,#0f766e_100%)] p-6 sm:p-8 shadow-[0_24px_60px_rgba(30,64,175,0.16)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="relative z-10"><h1 className="text-2xl sm:text-3xl font-bold text-white">Assigned FIRs</h1><p className="text-white/75 text-sm mt-1">All FIRs assigned to your police station</p></div>
      </div>

      <div className="space-y-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search FIRs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-11 rounded-2xl border-slate-200 bg-slate-50/70" /></div>
        <div className="flex flex-wrap gap-2">{STATUSES.map((s) => <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className={`capitalize text-xs h-9 rounded-full ${filter === s ? 'bg-slate-900 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{s === 'all' ? 'All' : s}</Button>)}</div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-28 rounded-[28px]" />)}</div>
      ) : firs.length === 0 ? (
        <EmptyState icon={FileText} title="No FIRs found" description="No FIRs match your current filter." />
      ) : (
        <div className="space-y-4">
          {firs.map((fir) => (
            <Link key={fir._id} to={`/police/fir/${fir._id}`}>
              <Card className="cursor-pointer rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)] group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">{fir.incident?.title}</h3>
                        <StatusBadge status={fir.status} />
                        {fir.firNumber && <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full">#{fir.firNumber}</span>}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">{fir.incident?.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px] capitalize rounded-full border-slate-200">{fir.incident?.category}</Badge></span>
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{fir.citizenId?.name || 'Citizen'}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(fir.createdAt)}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{fir.incident?.address}</span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}