// src/features/admin/pages/AdminDashboard.jsx
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
      <PageHeader
        eyebrow="Admin workspace"
        title="Admin Dashboard"
        description="Review pending verifications and keep the platform's professional network trustworthy."
        action={<Button asChild><Link to="/admin/verifications"><ShieldCheck className="mr-2 h-4 w-4" />Review Verifications</Link></Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={ShieldCheck} label="Total Pending" value={total} loading={isLoading} />
        <StatCard icon={Users} label="Pending Lawyers" value={lawyers.length} loading={isLoading} />
        <StatCard icon={Shield} label="Pending Police" value={police.length} loading={isLoading} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Pending Verifications</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/admin/verifications">Review all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-18 w-full rounded-xl" />)}</div> : total === 0 ? (
            <EmptyState icon={CheckCircle} title="All caught up" description="No pending verifications need review." />
          ) : (
            <div className="space-y-3">
              {[...lawyers.map(l => ({ ...l, _type: 'lawyer' })), ...police.map(p => ({ ...p, _type: 'police' }))].slice(0, 8).map((item) => (
                <Link key={item._id} to="/admin/verifications">
                  <ListRow className="flex items-center gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      {item._type === 'lawyer' ? <Users className="size-4" /> : <Shield className="size-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{item.userId?.name || 'User'}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{item.userId?.email} · {item._type}</div>
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
