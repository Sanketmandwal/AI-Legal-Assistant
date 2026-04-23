// src/features/citizen/pages/MyFIRsPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyFIRs } from '../api/firApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { FileText, FilePlus, Search, ArrowRight, MapPin, Clock, Calendar } from 'lucide-react'

const STATUS_FILTERS = ['all', 'submitted', 'accepted', 'investigating', 'resolved', 'closed', 'rejected']

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MyFIRsPage() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const { data, isLoading } = useMyFIRs()
  const firs = data?.firs || []

  const filtered = firs.filter((f) => {
    if (filter !== 'all' && f.status !== filter) return false
    if (search && !f.incident?.title?.toLowerCase().includes(search.toLowerCase()) && !f.incident?.category?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My FIRs</h1>
          <p className="text-sm text-slate-500 mt-0.5">{firs.length} total reports filed</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600"><Link to="/citizen/file-fir"><FilePlus className="mr-2 h-4 w-4" /> File New FIR</Link></Button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="Search by title or category..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((s) => (
            <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className={`capitalize text-xs h-8 ${filter === s ? 'shadow-sm' : ''}`}>
              {s === 'all' ? 'All' : s} {s !== 'all' && `(${firs.filter(f => f.status === s).length})`}
            </Button>
          ))}
        </div>
      </div>

      {/* FIR List */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title={filter !== 'all' ? `No ${filter} FIRs` : 'No FIRs filed yet'} description="Start by filing your first FIR." actionLabel="File FIR" onAction={() => {}} />
      ) : (
        <div className="space-y-3">
          {filtered.map((fir) => (
            <Link key={fir._id} to={`/citizen/fir/${fir._id}`}>
              <Card className="border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer group">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{fir.incident?.title}</h3>
                        <StatusBadge status={fir.status} />
                      </div>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{fir.incident?.description}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">{fir.incident?.category}</Badge></span>
                        {fir.firNumber && <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">#{fir.firNumber}</span>}
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(fir.createdAt)}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{fir.stationId?.stationName || 'Assigned Station'}</span>
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
