// src/features/lawyer/pages/LawyerDashboard.jsx
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useIncomingRequests, useLawyerHistory, useLawyerProfile } from '../api/lawyerDashApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import StarRating from '@/components/shared/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { Inbox, History, Star, MessageSquare, ArrowRight, Users, CheckCircle, Clock } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <Card className="border-0 shadow-sm"><CardContent className="flex items-center gap-4 p-4 sm:p-5">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}><Icon className="h-5 w-5 text-white" /></div>
      <div>{loading ? <Skeleton className="h-7 w-12 mb-1" /> : <div className="text-2xl font-bold text-slate-900">{value}</div>}<div className="text-xs text-slate-500">{label}</div></div>
    </CardContent></Card>
  )
}

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your consultations and client requests</p>
        </div>
        {profile && (
          <div className="flex items-center gap-2">
            <StatusBadge status={profile.verificationStatus} />
            <StatusBadge status={profile.availabilityStatus} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Inbox} label="Pending Requests" value={pendingRequests.length} color="bg-amber-500" loading={pendingLoading} />
        <StatCard icon={Clock} label="Active Cases" value={activeConsults.length} color="bg-blue-600" loading={historyLoading} />
        <StatCard icon={CheckCircle} label="Completed" value={completedConsults.length} color="bg-green-600" loading={historyLoading} />
        <StatCard icon={Star} label="Rating" value={profile?.ratingAverage?.toFixed(1) || '—'} color="bg-purple-600" loading={profileLoading} />
      </div>

      {profile && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-700">Your Profile</div>
              <div className="text-xs text-slate-500 mt-1">Specialization: {profile.specialization?.join(', ') || 'N/A'} • {profile.experienceYears || 0} years exp • ₹{profile.feePerConsultation || 0}/consultation</div>
              <div className="flex items-center gap-2 mt-2"><StarRating value={profile.ratingAverage || 0} readonly size="sm" /><span className="text-xs text-slate-500">({profile.ratingCount || 0} reviews)</span></div>
            </div>
            <Button variant="outline" size="sm" asChild><Link to="/lawyer/profile">View Profile</Link></Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Pending Requests ({pendingRequests.length})</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/lawyer/requests">View all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          {pendingLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div> : pendingRequests.length === 0 ? (
            <EmptyState icon={Inbox} title="No pending requests" description="You're all caught up!" />
          ) : (
            <div className="space-y-2">
              {pendingRequests.slice(0, 5).map((req) => (
                <Link key={req._id} to="/lawyer/requests" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">{req.citizenId?.name || 'Citizen'}</div>
                    <div className="text-xs text-slate-500 truncate mt-0.5">{req.firId?.incident?.title || 'FIR Case'} • {req.firId?.incident?.category}</div>
                  </div>
                  <StatusBadge status={req.status} />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
