// src/features/police/pages/PoliceDashboard.jsx
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { usePoliceFIRs, usePoliceProfile } from '../api/policeDashApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { FileText, Clock, CheckCircle, Search, AlertTriangle, ArrowRight, Shield, MapPin } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <Card className="border-0 shadow-sm"><CardContent className="flex items-center gap-4 p-4 sm:p-5">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon className="h-5 w-5 text-white" /></div>
      <div>{loading ? <Skeleton className="h-7 w-12 mb-1" /> : <div className="text-2xl font-bold text-slate-900">{value}</div>}<div className="text-xs text-slate-500">{label}</div></div>
    </CardContent></Card>
  )
}

export default function PoliceDashboard() {
  const { user } = useSelector((s) => s.auth)
  const { data: firData, isLoading } = usePoliceFIRs()
  const { data: profileData } = usePoliceProfile()

  const firs = firData?.firs || []
  const station = firData?.station || profileData?.profile
  const submitted = firs.filter((f) => f.status === 'submitted')
  const accepted = firs.filter((f) => f.status === 'accepted')
  const investigating = firs.filter((f) => f.status === 'investigating')
  const resolved = firs.filter((f) => ['resolved', 'closed'].includes(f.status))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage FIRs assigned to your station</p>
        </div>
        <Button asChild><Link to="/police/firs"><FileText className="mr-2 h-4 w-4" /> View All FIRs</Link></Button>
      </div>

      {station && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-rose-50 to-orange-50">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-600 flex items-center justify-center shrink-0"><Shield className="h-5 w-5 text-white" /></div>
            <div className="flex-1">
              <div className="font-semibold text-slate-800">{station.stationName}</div>
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="h-3 w-3" />{station.stationAddress || `${station.district}, ${station.state}`}</div>
            </div>
            <StatusBadge status={profileData?.profile?.verificationStatus || 'pending'} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={AlertTriangle} label="New / Submitted" value={submitted.length} color="bg-yellow-500" loading={isLoading} />
        <StatCard icon={Clock} label="Accepted" value={accepted.length} color="bg-blue-600" loading={isLoading} />
        <StatCard icon={Search} label="Investigating" value={investigating.length} color="bg-purple-600" loading={isLoading} />
        <StatCard icon={CheckCircle} label="Resolved/Closed" value={resolved.length} color="bg-green-600" loading={isLoading} />
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Recent FIRs</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/police/firs">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : firs.length === 0 ? (
            <EmptyState icon={FileText} title="No FIRs assigned" description="No FIRs have been assigned to your station yet." />
          ) : (
            <div className="space-y-2">
              {firs.slice(0, 6).map((fir) => (
                <Link key={fir._id} to={`/police/fir/${fir._id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">{fir.incident?.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">by {fir.citizenId?.name || 'Citizen'} • {fir.incident?.category}</div>
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
