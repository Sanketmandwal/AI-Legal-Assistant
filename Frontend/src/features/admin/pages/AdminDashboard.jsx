// src/features/admin/pages/AdminDashboard.jsx
import { Link } from 'react-router-dom'
import { usePendingVerifications } from '../api/adminApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import StatusBadge from '@/components/shared/StatusBadge'
import { ShieldCheck, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"><CardContent className="flex items-center gap-4 p-5">
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${color} shadow-lg`}><Icon className="h-5 w-5 text-white" /></div>
      <div>{loading ? <Skeleton className="h-8 w-14 mb-1 rounded-lg" /> : <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</div>}<div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div></div>
    </CardContent></Card>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = usePendingVerifications()
  const lawyers = data?.lawyers || []
  const police = data?.police || []
  const total = data?.totalPending || 0

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div><h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1><p className="text-violet-100 text-sm mt-1">Manage verifications and platform oversight</p></div>
          <Button asChild className="bg-white text-purple-700 hover:bg-purple-50 shadow-lg font-semibold"><Link to="/admin/verifications"><ShieldCheck className="mr-2 h-4 w-4" /> Review Verifications</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={ShieldCheck} label="Total Pending" value={total} color="bg-amber-500" loading={isLoading} />
        <StatCard icon={Users} label="Pending Lawyers" value={lawyers.length} color="bg-emerald-600" loading={isLoading} />
        <StatCard icon={Shield} label="Pending Police" value={police.length} color="bg-rose-600" loading={isLoading} />
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Pending Verifications</CardTitle>
          <Button variant="ghost" size="sm" asChild><Link to="/admin/verifications">Review all <ArrowRight className="ml-1 h-3 w-3" /></Link></Button>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div> : total === 0 ? (
            <EmptyState icon={CheckCircle} title="All caught up!" description="No pending verifications." />
          ) : (
            <div className="space-y-2">
              {[...lawyers.map(l => ({ ...l, _type: 'lawyer' })), ...police.map(p => ({ ...p, _type: 'police' }))].slice(0, 8).map((item) => (
                <Link key={item._id} to="/admin/verifications" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${item._type === 'lawyer' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {item._type === 'lawyer' ? <Users className="h-4 w-4 text-emerald-600" /> : <Shield className="h-4 w-4 text-rose-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800">{item.userId?.name || 'User'}</div>
                    <div className="text-xs text-slate-500">{item.userId?.email} • {item._type}</div>
                  </div>
                  <StatusBadge status="pending" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
