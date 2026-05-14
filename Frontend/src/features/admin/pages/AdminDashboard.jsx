import { Link } from 'react-router-dom'
import { usePendingVerifications } from '../api/adminApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ListRow, PageHeader, PageStack, StatCard } from '@/components/common/PageShell'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { ShieldCheck, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function AdminDashboard() {
  const { data, isLoading } = usePendingVerifications()
  const lawyers = data?.lawyers || []
  const police = data?.police || []
  const total = data?.totalPending || 0

  return (
    <PageStack>
      <div className="relative overflow-hidden rounded-[30px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_45%,#0f766e_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-white/10 blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="relative p-6 sm:p-8">
          <PageHeader
            eyebrow="Admin workspace"
            title="Admin Dashboard"
            description="Review pending verifications and keep the platform's professional network trustworthy."
            action={<Button asChild className="rounded-2xl bg-white text-slate-900 hover:bg-white/90"><Link to="/admin/verifications"><ShieldCheck className="mr-2 h-4 w-4" />Review Verifications</Link></Button>}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={ShieldCheck} label="Total Pending" value={total} loading={isLoading} />
        <StatCard icon={Users} label="Pending Lawyers" value={lawyers.length} loading={isLoading} />
        <StatCard icon={Shield} label="Pending Police" value={police.length} loading={isLoading} />
      </div>

      <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle className="text-slate-900">Pending Verifications</CardTitle>
          <Button variant="ghost" size="sm" asChild className="rounded-xl text-slate-600"><Link to="/admin/verifications">Review all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}</div> : total === 0 ? (
            <EmptyState icon={CheckCircle} title="All caught up" description="No pending verifications need review." />
          ) : (
            <div className="space-y-3">
              {[...lawyers.map((l) => ({ ...l, _type: 'lawyer' })), ...police.map((p) => ({ ...p, _type: 'police' }))].slice(0, 8).map((item) => (
                <Link key={item._id} to="/admin/verifications">
                  <ListRow className="flex items-center gap-4 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-white">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      {item._type === 'lawyer' ? <Users className="size-4" /> : <Shield className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900">{item.userId?.name || 'User'}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.userId?.email} · {item._type}</div>
                    </div>
                    <StatusBadge status="pending" />
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