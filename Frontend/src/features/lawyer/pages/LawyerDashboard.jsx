// src/features/lawyer/pages/LawyerDashboard.jsx
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useIncomingRequests, useLawyerHistory, useLawyerProfile } from '../api/lawyerDashApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ListRow, PageHeader, PageStack, StatCard } from '@/components/common/PageShell'
import StatusBadge from '@/components/shared/StatusBadge'
import StarRating from '@/components/shared/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { Inbox, Star, ArrowRight, CheckCircle, Clock, IndianRupee } from 'lucide-react'

export default function LawyerDashboard() {
  const { user } = useSelector((s) => s.auth)
  const { data: pendingData, isLoading: pendingLoading } = useIncomingRequests('pending')
  const { data: historyData, isLoading: historyLoading } = useLawyerHistory('all')
  const { data: profileData, isLoading: profileLoading } = useLawyerProfile()

  const pendingRequests = pendingData?.requests || []
  const historyItems = historyData?.consultations || []
  const profile = profileData?.profile
  const activeConsults = historyItems.filter((c) => c.status === 'accepted')
  const completedConsults = historyItems.filter((c) => c.status === 'completed')

  return (
    <PageStack>
      <PageHeader
        eyebrow="Lawyer workspace"
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Review incoming requests, manage active consultations, and keep your profile ready for matching."
        action={profile && <div className="flex flex-wrap gap-2"><StatusBadge status={profile.verificationStatus} /><StatusBadge status={profile.availabilityStatus} /></div>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Inbox} label="Pending Requests" value={pendingRequests.length} loading={pendingLoading} />
        <StatCard icon={Clock} label="Active Cases" value={activeConsults.length} loading={historyLoading} />
        <StatCard icon={CheckCircle} label="Completed" value={completedConsults.length} loading={historyLoading} />
        <StatCard icon={Star} label="Rating" value={profile?.ratingAverage?.toFixed(1) || '-'} loading={profileLoading} />
      </div>

      {profile && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">Your Profile</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {(profile.specialization || []).join(', ') || 'No specialization'} · {profile.experienceYears || 0} years experience
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><IndianRupee className="size-4" />{profile.feePerConsultation || 0}/consultation</span>
                <span className="inline-flex items-center gap-2"><StarRating value={profile.ratingAverage || 0} readonly size="sm" />({profile.ratingCount || 0} reviews)</span>
              </div>
            </div>
            <Button variant="outline" asChild><Link to="/lawyer/profile">View Profile</Link></Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/lawyer/requests">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          {pendingLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div> : pendingRequests.length === 0 ? (
            <EmptyState icon={Inbox} title="No pending requests" description="You're all caught up. New consultation requests will appear here." />
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 5).map((req) => (
                <Link key={req._id} to="/lawyer/requests">
                  <ListRow className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{req.citizenId?.name || 'Citizen'}</div>
                      <div className="mt-1 truncate text-sm text-muted-foreground">{req.firId?.incident?.title || 'FIR Case'} · {req.firId?.incident?.category}</div>
                    </div>
                    <StatusBadge status={req.status} />
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
