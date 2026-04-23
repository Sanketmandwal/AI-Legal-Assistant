// src/features/citizen/pages/CitizenDashboard.jsx
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMyFIRs } from '../api/firApi'
import { useCitizenConsultations } from '../api/consultationApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { FilePlus, FileText, Users, MessageSquare, ArrowRight, Clock, CheckCircle, AlertTriangle, Scale } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-lg`}>
          <Icon className="h-5.5 w-5.5 text-white" />
        </div>
        <div>
          {loading ? <Skeleton className="h-8 w-14 mb-1 rounded-lg" /> : <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>}
          <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CitizenDashboard() {
  const { user } = useSelector((s) => s.auth)
  const { data: firData, isLoading: firsLoading } = useMyFIRs()
  const { data: consultData, isLoading: consultLoading } = useCitizenConsultations('all')

  const firs = firData?.firs || []
  const consultations = consultData?.consultations || []

  const activeFIRs = firs.filter((f) => ['submitted', 'accepted', 'investigating'].includes(f.status))
  const resolvedFIRs = firs.filter((f) => ['resolved', 'closed'].includes(f.status))
  const pendingConsults = consultations.filter((c) => c.status === 'pending')
  const activeConsults = consultations.filter((c) => c.status === 'accepted')

  const recentFIRs = firs.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="text-blue-100 text-sm mt-1">Here's an overview of your legal activities</p>
          </div>
          <Button asChild className="bg-white text-blue-700 hover:bg-blue-50 shadow-lg font-semibold"><Link to="/citizen/file-fir"><FilePlus className="mr-2 h-4 w-4" /> File New FIR</Link></Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={FileText} label="Total FIRs" value={firs.length} color="bg-blue-600" loading={firsLoading} />
        <StatCard icon={Clock} label="Active Cases" value={activeFIRs.length} color="bg-amber-500" loading={firsLoading} />
        <StatCard icon={CheckCircle} label="Resolved" value={resolvedFIRs.length} color="bg-green-600" loading={firsLoading} />
        <StatCard icon={Users} label="Consultations" value={consultations.length} color="bg-purple-600" loading={consultLoading} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/citizen/file-fir" className="group">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><FilePlus className="h-5 w-5 text-white" /></div>
              <div><div className="font-semibold text-sm text-slate-800">File New FIR</div><div className="text-xs text-slate-500">Report an incident</div></div>
              <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/citizen/consultations" className="group">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Users className="h-5 w-5 text-white" /></div>
              <div><div className="font-semibold text-sm text-slate-800">My Consultations</div><div className="text-xs text-slate-500">{pendingConsults.length} pending, {activeConsults.length} active</div></div>
              <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/citizen/chat" className="group">
          <Card className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><MessageSquare className="h-5 w-5 text-white" /></div>
              <div><div className="font-semibold text-sm text-slate-800">Chat with Lawyers</div><div className="text-xs text-slate-500">Active conversations</div></div>
              <ArrowRight className="h-4 w-4 text-slate-400 ml-auto" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent FIRs */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Recent FIRs</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/citizen/my-firs">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          {firsLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : recentFIRs.length === 0 ? (
            <EmptyState icon={FileText} title="No FIRs yet" description="File your first FIR to get started." actionLabel="File FIR" onAction={() => {}} />
          ) : (
            <div className="space-y-2">
              {recentFIRs.map((fir) => (
                <Link key={fir._id} to={`/citizen/fir/${fir._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{fir.incident?.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] capitalize">{fir.incident?.category}</Badge>
                      <span>{fir.stationId?.stationName || 'Assigned Station'}</span>
                    </div>
                  </div>
                  <StatusBadge status={fir.status} />
                  <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
