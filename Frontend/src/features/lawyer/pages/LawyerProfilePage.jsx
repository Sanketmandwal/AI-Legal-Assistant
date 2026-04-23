// src/features/lawyer/pages/LawyerProfilePage.jsx
import { useSelector } from 'react-redux'
import { useLawyerProfile } from '../api/lawyerDashApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import StatusBadge from '@/components/shared/StatusBadge'
import StarRating from '@/components/shared/StarRating'
import { Briefcase, MapPin, IndianRupee, Languages, Mail, Phone, CheckCircle, Award } from 'lucide-react'

export default function LawyerProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const { data, isLoading } = useLawyerProfile()
  const profile = data?.profile
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  if (isLoading) return <div className="space-y-4 max-w-3xl mx-auto">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex items-center gap-5">
          <Avatar className="h-20 w-20 border-4 border-white/30"><AvatarFallback className="bg-white/20 text-white text-2xl font-bold">{initials}</AvatarFallback></Avatar>
          <div className="text-white">
            <h1 className="text-2xl font-bold">{user?.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className="bg-white/20 text-white border-0 capitalize">Lawyer</Badge>
              <StatusBadge status={profile?.verificationStatus || 'pending'} />
              <StatusBadge status={profile?.availabilityStatus || 'offline'} />
            </div>
            {profile && <div className="flex items-center gap-2 mt-2"><StarRating value={profile.ratingAverage || 0} readonly size="sm" /><span className="text-emerald-100 text-sm">({profile.ratingCount || 0} reviews)</span></div>}
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4 text-blue-600" /> Professional Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs text-slate-400">Bar Council ID</div><div className="text-sm font-mono font-medium">{profile?.barId || 'N/A'}</div></div>
            <div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs text-slate-400">Experience</div><div className="text-sm font-medium">{profile?.experienceYears || 0} years</div></div>
            <div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs text-slate-400">Fee per Consultation</div><div className="text-sm font-medium flex items-center gap-1"><IndianRupee className="h-3 w-3" />₹{profile?.feePerConsultation || 0}</div></div>
          </CardContent>
        </Card>

        <Card className="">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4 text-indigo-600" /> Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Email</div><div className="text-sm font-medium">{user?.email}</div></div></div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Phone</div><div className="text-sm font-medium">{user?.phone}</div></div></div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><MapPin className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Location</div><div className="text-sm font-medium">{profile?.city}, {profile?.state}</div></div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4 text-purple-600" /> Specializations & Languages</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div><div className="text-xs text-slate-400 mb-2">Specializations</div><div className="flex flex-wrap gap-2">{(profile?.specialization || []).map(s => <Badge key={s} className="bg-blue-100 text-blue-800 border-0 capitalize">{s}</Badge>)}</div></div>
            {profile?.languages?.length > 0 && <div><div className="text-xs text-slate-400 mb-2">Languages</div><div className="flex flex-wrap gap-2">{profile.languages.map(l => <Badge key={l} variant="outline" className="capitalize">{l}</Badge>)}</div></div>}
            {profile?.bio && <div><div className="text-xs text-slate-400 mb-1">Bio</div><p className="text-sm text-slate-700 italic">"{profile.bio}"</p></div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
