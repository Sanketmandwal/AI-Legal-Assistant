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
import { Inbox, Star, ArrowRight, CheckCircle, Clock, IndianRupee, Sparkles, ShieldCheck } from 'lucide-react'

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
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/90 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.14),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(14,116,144,0.10),transparent_32%)]" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-300/70 to-transparent" />
        <div className="relative p-6 sm:p-8">
          <PageHeader
            eyebrow="Lawyer workspace"
            title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
            description="Review incoming requests, manage active consultations, and keep your profile polished for better client matching."
            action={profile && (
              <div className="flex flex-wrap gap-2">
                <StatusBadge status={profile.verificationStatus} />
                <StatusBadge status={profile.availabilityStatus} />
              </div>
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"><StatCard icon={Inbox} label="Pending Requests" value={pendingRequests.length} loading={pendingLoading} /></div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"><StatCard icon={Clock} label="Active Cases" value={activeConsults.length} loading={historyLoading} /></div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"><StatCard icon={CheckCircle} label="Completed" value={completedConsults.length} loading={historyLoading} /></div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-1 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"><StatCard icon={Star} label="Rating" value={profile?.ratingAverage?.toFixed(1) || '-'} loading={profileLoading} /></div>
      </div>

      {profile && (
        <Card className="overflow-hidden rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <div className="absolute" />
          <CardContent className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700">
                <Sparkles className="h-3.5 w-3.5" /> Professional snapshot
              </div>
              <div className="mt-4 text-lg font-bold text-slate-900">Your Profile</div>
              <div className="mt-1 text-sm text-slate-500 leading-7">
                {(profile.specialization || []).join(', ') || 'No specialization added'} · {profile.experienceYears || 0} years experience
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5"><IndianRupee className="size-4 text-teal-700" />{profile.feePerConsultation || 0}/consultation</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700"><StarRating value={profile.ratingAverage || 0} readonly size="sm" />({profile.ratingCount || 0} reviews)</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700"><ShieldCheck className="h-4 w-4" />Verified visibility ready</span>
              </div>
            </div>
            <Button variant="outline" asChild className="rounded-2xl border-slate-200 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700">
              <Link to="/lawyer/profile">View Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
        <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
          <div>
            <CardTitle className="text-lg text-slate-900">Pending Requests</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Newest consultation requests waiting for your response.</p>
          </div>
          <Button variant="ghost" size="sm" asChild className="rounded-xl text-slate-600 hover:bg-slate-50 hover:text-slate-900">
            <Link to="/lawyer/requests">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}</div>
          ) : pendingRequests.length === 0 ? (
            <EmptyState icon={Inbox} title="No pending requests" description="You're all caught up. New consultation requests will appear here." />
          ) : (
            <div className="space-y-3">
              {pendingRequests.slice(0, 5).map((req) => (
                <Link key={req._id} to="/lawyer/requests" className="block group">
                  <ListRow className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-white hover:shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                      <Inbox className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-900">{req.citizenId?.name || 'Citizen'}</div>
                      <div className="mt-1 truncate text-sm text-slate-500">{req.firId?.incident?.title || 'FIR Case'} · {req.firId?.incident?.category}</div>
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