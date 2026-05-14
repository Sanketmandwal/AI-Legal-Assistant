import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMyFIRs } from '../api/firApi'
import { useCitizenConsultations } from '../api/consultationApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import {
  FilePlus, FileText, Users, MessageSquare,
  ArrowRight, Clock, CheckCircle, ShieldCheck,
  TrendingUp, Scale,
} from 'lucide-react'

/* ─── Stat Card ─────────────────────────────────────── */
const ACCENTS = {
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-600'   },
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-600'   },
  green:  { bg: 'bg-green-50',  text: 'text-green-600'  },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
}
function StatCard({ icon: Icon, label, value, loading, accent = 'teal' }) {
  const a = ACCENTS[accent]
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 min-w-0">
      <div className={`shrink-0 w-10 h-10 ${a.bg} rounded-lg flex items-center justify-center`}>
        <Icon size={18} className={a.text} />
      </div>
      <div className="min-w-0">
        {loading
          ? <Skeleton className="h-6 w-10 mb-1" />
          : <p className="text-xl font-bold text-slate-900 tabular-nums leading-tight">{value}</p>}
        <p className="text-xs text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

/* ─── Quick Action Card ──────────────────────────────── */
function ActionTile({ icon: Icon, title, desc, to, iconBg, iconText }) {
  return (
    <Link to={to}
      className="group bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3 hover:border-slate-200 hover:shadow-sm transition-all duration-150 min-w-0">
      <div className={`shrink-0 w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center`}>
        <Icon size={17} className={iconText} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-800 truncate">{title}</p>
        <p className="text-xs text-slate-400 truncate">{desc}</p>
      </div>
      <ArrowRight size={14} className="shrink-0 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
    </Link>
  )
}

/* ─── Main ───────────────────────────────────────────── */
export default function CitizenDashboard() {
  const { user } = useSelector((s) => s.auth)
  const { data: firData,     isLoading: firsLoading    } = useMyFIRs()
  const { data: consultData, isLoading: consultLoading } = useCitizenConsultations('all')

  const firs            = firData?.firs            || []
  const consultations   = consultData?.consultations || []
  const activeFIRs      = firs.filter((f) => ['submitted','accepted','investigating'].includes(f.status))
  const resolvedFIRs    = firs.filter((f) => ['resolved','closed'].includes(f.status))
  const pendingConsults = consultations.filter((c) => c.status === 'pending')
  const activeConsults  = consultations.filter((c) => c.status === 'accepted')
  const recentFIRs      = firs.slice(0, 5)
  const firstName       = user?.name?.split(' ')[0] || 'there'

  return (
    <div className="w-full min-h-screen bg-slate-50">

      {/* ── HEADER BANNER ─────────────────────────────── */}
      <div
        className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}
      >
        {/* glow blob — contained, won't cause overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #5eead4, transparent 70%)' }} />
        </div>

        <div className="relative z-10 px-5 sm:px-8 pt-8 pb-16">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-2">
                Citizen workspace
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                Welcome back, <span className="text-teal-200">{firstName}</span> 👋
              </h1>
              <p className="text-white/55 text-sm mt-1.5 max-w-sm">
                Track your FIRs, consultations, and case activity.
              </p>
            </div>
            <Button asChild
              className="shrink-0 bg-white text-teal-700 hover:bg-white/90 font-semibold h-9 px-4 text-sm shadow-md border-0">
              <Link to="/citizen/file-fir" className="inline-flex items-center gap-1.5"><FilePlus size={14} />File New FIR</Link>
            </Button>
          </div>
        </div>

        {/* soft bottom fade into page bg */}
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #f8fafc)' }} />
      </div>

      {/* ── PAGE BODY ─────────────────────────────────── */}
      {/* pulled up by -mt-8 to overlap the banner fade */}
      <div className="px-5 sm:px-8 -mt-8 pb-12 space-y-5 relative z-10">

        {/* STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={FileText}    label="Total FIRs"    value={firs.length}          loading={firsLoading}    accent="teal"   />
          <StatCard icon={Clock}       label="Active"        value={activeFIRs.length}    loading={firsLoading}    accent="blue"   />
          <StatCard icon={CheckCircle} label="Resolved"      value={resolvedFIRs.length}  loading={firsLoading}    accent="green"  />
          <StatCard icon={Users}       label="Consultations" value={consultations.length} loading={consultLoading} accent="purple" />
        </div>

        {/* QUICK ACTIONS */}
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-2.5">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ActionTile to="/citizen/file-fir"      icon={FilePlus}      iconBg="bg-teal-50"   iconText="text-teal-600"
              title="File New FIR"      desc="Report an incident with evidence" />
            <ActionTile to="/citizen/consultations" icon={Users}         iconBg="bg-blue-50"   iconText="text-blue-600"
              title="My Consultations"  desc={`${pendingConsults.length} pending · ${activeConsults.length} active`} />
            <ActionTile to="/citizen/chat"          icon={MessageSquare} iconBg="bg-indigo-50" iconText="text-indigo-600"
              title="Chat with Lawyers" desc="Continue secure conversations" />
          </div>
        </div>

        {/* MAIN GRID: FIR list (left) + sidebar (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Recent FIRs — 2 cols on lg */}
          <div className="lg:col-span-2 min-w-0">
            <Card className="rounded-xl border-slate-100 shadow-sm bg-white h-full">
              <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
                <CardTitle className="text-sm font-semibold text-slate-800">Recent FIRs</CardTitle>
                <Button variant="ghost" size="sm" asChild
                  className="h-7 px-2 text-xs text-slate-400 hover:text-teal-600">
                  <Link to="/citizen/my-firs" className="inline-flex items-center gap-1">View all <ArrowRight size={12} /></Link>
                </Button>
              </CardHeader>
              <CardContent className="px-5 pt-0 pb-4">
                {firsLoading ? (
                  <div className="space-y-2.5">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                  </div>
                ) : recentFIRs.length === 0 ? (
                  <div className="py-10 text-center">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl mx-auto flex items-center justify-center mb-3">
                      <FileText size={18} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-500">No FIRs yet</p>
                    <p className="text-xs text-slate-400 mt-1">File your first FIR to start tracking.</p>
                    <Button asChild size="sm" className="mt-3 h-8 text-xs">
                      <Link to="/citizen/file-fir" className="inline-flex items-center gap-1.5"><FilePlus size={12} />File FIR</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {recentFIRs.map((fir) => (
                      <Link key={fir._id} to={`/citizen/fir/${fir._id}`}
                        className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0 rounded-lg hover:bg-slate-50 -mx-1 px-1 transition-colors min-w-0">
                        <div className="shrink-0 w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                          <Scale size={14} className="text-teal-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-teal-700 transition-colors">
                            {fir.incident?.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="capitalize text-[10px] h-4 px-1.5 border-slate-200 text-slate-500 font-normal">
                              {fir.incident?.category}
                            </Badge>
                            <span className="text-xs text-slate-400 truncate hidden sm:block">
                              {fir.stationId?.stationName || 'Assigned Station'}
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0"><StatusBadge status={fir.status} /></div>
                        <ArrowRight size={13} className="shrink-0 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar — 1 col on lg */}
          <div className="min-w-0 space-y-4">

            {/* Consultations summary */}
            <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
              <CardHeader className="py-4 px-5">
                <CardTitle className="text-sm font-semibold text-slate-800">Consultations</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pt-0 pb-4">
                {consultLoading ? (
                  <Skeleton className="h-16 w-full rounded-lg" />
                ) : consultations.length === 0 ? (
                  <div className="text-center py-3">
                    <p className="text-xs text-slate-400 mb-2">No consultations yet.</p>
                    <Button asChild size="sm" variant="outline" className="h-7 text-xs w-full">
                      <Link to="/citizen/consultations" className="inline-flex items-center">Find a Lawyer</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {[
                      { label: 'Pending',  val: pendingConsults.length,  color: 'text-amber-600'  },
                      { label: 'Active',   val: activeConsults.length,   color: 'text-green-600'  },
                      { label: 'Total',    val: consultations.length,    color: 'text-slate-700'  },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{label}</span>
                        <span className={`text-sm font-bold tabular-nums ${color}`}>{val}</span>
                      </div>
                    ))}
                    <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs mt-1">
                      <Link to="/citizen/consultations" className="inline-flex items-center gap-1">View all <ArrowRight size={11} /></Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust card */}
            <div className="rounded-xl p-4 text-white"
              style={{ background: 'linear-gradient(135deg, #0f766e, #0e7490)' }}>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-teal-200 shrink-0" />
                <span className="text-sm font-semibold">Your data is safe</span>
              </div>
              <p className="text-xs text-teal-100 leading-relaxed">
                All FIRs and documents are end-to-end encrypted and stored securely.
              </p>
            </div>

            {/* Know your rights */}
            <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
              <CardContent className="p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                    <TrendingUp size={15} className="text-indigo-600" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">Know Your Rights</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Learn about IPC sections and legal procedures.
                </p>
                <Button asChild variant="outline" size="sm" className="w-full h-8 text-xs">
                  <Link to="/citizen/legal-education" className="inline-flex items-center gap-1">Explore <ArrowRight size={11} /></Link>
                </Button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  )
}