import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMyFIRs } from '../api/firApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import { FileText, FilePlus, Search, ArrowRight, MapPin, Calendar, Filter } from 'lucide-react'

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
    if (
      search &&
      !f.incident?.title?.toLowerCase().includes(search.toLowerCase()) &&
      !f.incident?.category?.toLowerCase().includes(search.toLowerCase())
    ) return false
    return true
  })

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #5eead4, transparent 70%)' }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #f8fafc)' }} />

        <div className="relative z-10 px-5 sm:px-8 pt-8 pb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-2">Reports</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My FIRs</h1>
            <p className="text-white/60 text-sm mt-1.5 max-w-xl">
              {firs.length} total reports filed. Search, filter, and open any FIR for full details.
            </p>
          </div>
          <Button asChild className="bg-white/15 hover:bg-white/25 text-white border border-white/25 h-9 px-4 text-sm font-semibold backdrop-blur-sm">
            <Link to="/citizen/file-fir" className="inline-flex items-center gap-2">
              <FilePlus className="h-4 w-4" /> File New FIR
            </Link>
          </Button>
        </div>
      </div>

      <div className="px-5 sm:px-8 -mt-8 pb-12 relative z-10 space-y-5">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 border-slate-200 focus:border-teal-400 focus:ring-teal-100"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
              <Filter size={12} /> Status Filter
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((s) => (
                <Button
                  key={s}
                  variant={filter === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(s)}
                  className={`capitalize text-xs h-8 ${filter === s ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {s === 'all' ? 'All' : s}
                  {s !== 'all' && <span className="ml-1 text-[10px] opacity-80">({firs.filter((f) => f.status === s).length})</span>}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <FileText size={22} className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">{filter !== 'all' ? `No ${filter} FIRs` : 'No FIRs filed yet'}</p>
              <p className="text-xs text-slate-400 mt-1">Start by filing your first FIR.</p>
            </div>
            <Button asChild className="mt-2 h-9 text-sm bg-teal-600 hover:bg-teal-700">
              <Link to="/citizen/file-fir" className="inline-flex items-center gap-2">
                <FilePlus className="h-4 w-4" /> File FIR
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((fir) => (
              <Link key={fir._id} to={`/citizen/fir/${fir._id}`} className="block">
                <div className="group rounded-xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-150">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-slate-900 transition-colors group-hover:text-teal-700 truncate">
                          {fir.incident?.title}
                        </h3>
                        <StatusBadge status={fir.status} />
                      </div>

                      <p className="text-sm text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {fir.incident?.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0 h-5 border-slate-200 text-slate-500 bg-slate-50">
                            {fir.incident?.category}
                          </Badge>
                        </span>
                        {fir.firNumber && (
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            #{fir.firNumber}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(fir.createdAt)}</span>
                        <span className="flex items-center gap-1 min-w-0"><MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{fir.stationId?.stationName || 'Assigned Station'}</span>
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-teal-600 transition-colors shrink-0 mt-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}