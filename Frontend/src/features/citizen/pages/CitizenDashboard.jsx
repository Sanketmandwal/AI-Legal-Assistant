// src/features/citizen/pages/CitizenDashboard.jsx
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMyFIRs } from '../api/firApi'
import { useCitizenConsultations } from '../api/consultationApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ActionCard, ListRow, PageHeader, PageStack, StatCard } from '@/components/common/PageShell'
import StatusBadge from '@/components/shared/StatusBadge'
import EmptyState from '@/components/common/EmptyState'
import { FilePlus, FileText, Users, MessageSquare, ArrowRight, Clock, CheckCircle } from 'lucide-react'

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
    <PageStack>
      <PageHeader
        eyebrow="Citizen workspace"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Track FIRs, consultations, evidence, and case conversations from one clean workspace."
        action={<Button asChild><Link to="/citizen/file-fir"><FilePlus className="mr-2 h-4 w-4" />File New FIR</Link></Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FileText} label="Total FIRs" value={firs.length} loading={firsLoading} />
        <StatCard icon={Clock} label="Active Cases" value={activeFIRs.length} loading={firsLoading} />
        <StatCard icon={CheckCircle} label="Resolved" value={resolvedFIRs.length} loading={firsLoading} />
        <StatCard icon={Users} label="Consultations" value={consultations.length} loading={consultLoading} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to="/citizen/file-fir">
          <ActionCard icon={FilePlus} title="File New FIR" description="Report an incident with evidence and location." trailing={<ArrowRight className="size-4 text-muted-foreground" />} />
        </Link>
        <Link to="/citizen/consultations">
          <ActionCard icon={Users} title="My Consultations" description={`${pendingConsults.length} pending, ${activeConsults.length} active`} trailing={<ArrowRight className="size-4 text-muted-foreground" />} />
        </Link>
        <Link to="/citizen/chat">
          <ActionCard icon={MessageSquare} title="Chat with Lawyers" description="Continue secure case conversations." trailing={<ArrowRight className="size-4 text-muted-foreground" />} />
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Recent FIRs</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/citizen/my-firs">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          {firsLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
          ) : recentFIRs.length === 0 ? (
            <EmptyState icon={FileText} title="No FIRs yet" description="File your first FIR to begin tracking the legal process." />
          ) : (
            <div className="space-y-3">
              {recentFIRs.map((fir) => (
                <Link key={fir._id} to={`/citizen/fir/${fir._id}`}>
                  <ListRow className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">{fir.incident?.title}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="capitalize">{fir.incident?.category}</Badge>
                        <span>{fir.stationId?.stationName || 'Assigned Station'}</span>
                      </div>
                    </div>
                    <StatusBadge status={fir.status} />
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
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
