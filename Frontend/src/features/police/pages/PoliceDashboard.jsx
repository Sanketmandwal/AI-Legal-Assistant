import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { usePoliceFIRs, usePoliceProfile } from '../api/policeDashApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ListRow, PageHeader, PageStack, StatCard } from '@/components/common/PageShell'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { FileText, Clock, CheckCircle, Search, AlertTriangle, ArrowRight, Shield, MapPin } from 'lucide-react'

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
    <PageStack>
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#1f3a8a_0%,#1e40af_42%,#0f766e_100%)] shadow-[0_24px_60px_rgba(30,64,175,0.16)]">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative p-6 sm:p-8">
          <PageHeader
            eyebrow="Police workspace"
            title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
            description="Review assigned FIRs, manage investigation progress, and keep station information visible."
            action={<Button asChild className="rounded-2xl bg-white text-slate-900 hover:bg-white/90"><Link to="/police/firs"><FileText className="mr-2 h-4 w-4" />View All FIRs</Link></Button>}
          />
        </div>
      </div>

      {station && (
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <Shield className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-900 truncate">{station.stationName}</div>
              <div className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="size-3.5 shrink-0" />{station.stationAddress || `${station.district}, ${station.state}`}</div>
            </div>
            <StatusBadge status={profileData?.profile?.verificationStatus || 'pending'} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={AlertTriangle} label="New / Submitted" value={submitted.length} loading={isLoading} />
        <StatCard icon={Clock} label="Accepted" value={accepted.length} loading={isLoading} />
        <StatCard icon={Search} label="Investigating" value={investigating.length} loading={isLoading} />
        <StatCard icon={CheckCircle} label="Resolved / Closed" value={resolved.length} loading={isLoading} />
      </div>

      <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-slate-900">Recent FIRs</CardTitle>
          <Button variant="ghost" size="sm" asChild className="rounded-xl text-slate-600"><Link to="/police/firs">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div> : firs.length === 0 ? (
            <EmptyState icon={FileText} title="No FIRs assigned" description="Assigned FIRs for your station will appear here." />
          ) : (
            <div className="space-y-3">
              {firs.slice(0, 6).map((fir) => (
                <Link key={fir._id} to={`/police/fir/${fir._id}`}>
                  <ListRow className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-slate-900">{fir.incident?.title}</div>
                      <div className="mt-1 text-sm text-slate-500">by {fir.citizenId?.name || 'Citizen'} · {fir.incident?.category}</div>
                    </div>
                    <StatusBadge status={fir.status} />
                    <ArrowRight className="size-4 shrink-0 text-slate-400" />
                  </ListRow>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </PageStack>
  )
}