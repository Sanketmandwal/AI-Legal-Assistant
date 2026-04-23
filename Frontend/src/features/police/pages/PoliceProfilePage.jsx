// src/features/police/pages/PoliceProfilePage.jsx
import { useSelector } from 'react-redux'
import { usePoliceProfile } from '../api/policeDashApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import StatusBadge from '@/components/shared/StatusBadge'
import { Shield, MapPin, Mail, Phone, Map, CheckCircle } from 'lucide-react'

export default function PoliceProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const { data, isLoading } = usePoliceProfile()
  const profile = data?.profile
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  if (isLoading) return <div className="space-y-4 max-w-3xl mx-auto">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-5">
          <Avatar className="h-20 w-20 border-4 border-white/30"><AvatarFallback className="bg-white/20 text-white text-2xl font-bold">{initials}</AvatarFallback></Avatar>
          <div className="text-white">
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className="bg-white/20 text-white border-0">Police Officer</Badge>
              <StatusBadge status={profile?.verificationStatus || 'pending'} />
            </div>
          </div>
        </div>
      </div>

      <Card className="">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-rose-600" /> Station Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-muted/50 rounded-xl"><div className="text-xs text-slate-400">Station Name</div><div className="text-lg font-bold text-slate-900">{profile?.stationName || 'N/A'}</div></div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs text-slate-400">District</div><div className="text-sm font-medium">{profile?.district || 'N/A'}</div></div>
            <div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs text-slate-400">State</div><div className="text-sm font-medium">{profile?.state || 'N/A'}</div></div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><MapPin className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Address</div><div className="text-sm font-medium">{profile?.stationAddress || 'N/A'}</div></div></div>
          {profile?.jurisdictionRadius && <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><Map className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Jurisdiction Radius</div><div className="text-sm font-medium">{profile.jurisdictionRadius} km</div></div></div>}
        </CardContent>
      </Card>

      <Card className="">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4 text-indigo-600" /> Officer Contact</CardTitle></CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Email</div><div className="text-sm font-medium">{user?.email}</div></div></div>
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Phone</div><div className="text-sm font-medium">{user?.phone}</div></div></div>
        </CardContent>
      </Card>
    </div>
  )
}
