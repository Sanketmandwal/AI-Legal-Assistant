import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosClient from '@/api/axiosClient'
import { updateUser } from '@/features/auth/slices/authSlice'
import { useLawyerProfile } from '../api/lawyerDashApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import StatusBadge from '@/components/shared/StatusBadge'
import StarRating from '@/components/shared/StarRating'
import { Briefcase, MapPin, IndianRupee, Mail, Phone, Award, Edit2, Loader2, Languages, ShieldCheck, Sparkles } from 'lucide-react'

function EditLawyerProfileModal({ open, onClose, user, profile }) {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      bio: profile?.bio || '',
      specialization: profile?.specialization?.join(', ') || '',
      languages: profile?.languages?.join(', ') || '',
      feePerConsultation: profile?.feePerConsultation || '',
      experienceYears: profile?.experienceYears || '',
      city: profile?.city || '',
      state: profile?.state || '',
      availabilityStatus: profile?.availabilityStatus || 'offline',
    }
  })

  const mutation = useMutation({
    mutationFn: (data) => axiosClient.patch('/lawyer/profile', data),
    onSuccess: (res) => {
      toast.success('Profile updated')
      dispatch(updateUser({ name: res.data.profile.userId.name || user.name, phone: res.data.profile.userId.phone || user.phone }))
      queryClient.invalidateQueries({ queryKey: ['lawyerProfile'] })
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[28px] border-slate-200 p-0">
        <DialogHeader className="border-b border-slate-200 px-6 py-5">
          <DialogTitle className="text-lg font-bold text-slate-900">Edit Professional Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-6 p-6">
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Basic Info</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Full Name</Label><Input {...register('name')} required className="h-11 rounded-xl border-slate-200" /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input {...register('phone')} required className="h-11 rounded-xl border-slate-200" /></div>
              <div className="space-y-1.5"><Label>City</Label><Input {...register('city')} required className="h-11 rounded-xl border-slate-200" /></div>
              <div className="space-y-1.5"><Label>State</Label><Input {...register('state')} required className="h-11 rounded-xl border-slate-200" /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Professional Details</h3>
            <div className="space-y-1.5"><Label>Bio / About Me</Label><Textarea {...register('bio')} rows={4} className="rounded-2xl border-slate-200" /></div>
            <div className="space-y-1.5"><Label>Specializations (comma separated)</Label><Input {...register('specialization')} placeholder="e.g. Criminal Law, Family Law" className="h-11 rounded-xl border-slate-200" /></div>
            <div className="space-y-1.5"><Label>Languages (comma separated)</Label><Input {...register('languages')} placeholder="e.g. English, Hindi, Marathi" className="h-11 rounded-xl border-slate-200" /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Experience (Years)</Label><Input type="number" {...register('experienceYears')} min={0} className="h-11 rounded-xl border-slate-200" /></div>
              <div className="space-y-1.5"><Label>Fee per Consultation (₹)</Label><Input type="number" {...register('feePerConsultation')} min={0} className="h-11 rounded-xl border-slate-200" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Availability Status</Label>
              <select {...register('availabilityStatus')} className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20">
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl border-slate-200">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending} className="rounded-xl bg-teal-600 hover:bg-teal-700">
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function LawyerProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const [isEditing, setIsEditing] = useState(false)
  const { data, isLoading } = useLawyerProfile()
  const profile = data?.profile
  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  if (isLoading) return <div className="space-y-4 max-w-4xl mx-auto">{[1,2,3].map((i) => <Skeleton key={i} className="h-40 rounded-[28px]" />)}</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f766e_0%,#0e7490_48%,#1e3a5f_100%)] p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,118,110,0.18)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-white/25 shadow-lg"><AvatarFallback className="bg-white/15 text-white text-2xl font-bold">{initials}</AvatarFallback></Avatar>
            <div className="text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                <Sparkles className="h-3.5 w-3.5" /> Lawyer profile
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge className="bg-white/15 text-white border border-white/10 capitalize">Lawyer</Badge>
                <StatusBadge status={profile?.verificationStatus || 'pending'} />
                <StatusBadge status={profile?.availabilityStatus || 'offline'} />
              </div>
              {profile && <div className="flex flex-wrap items-center gap-2 mt-3"><StarRating value={profile.ratingAverage || 0} readonly size="sm" /><span className="text-sm text-white/80">({profile.ratingCount || 0} reviews)</span></div>}
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)} className="rounded-2xl bg-white text-slate-900 hover:bg-slate-100 shadow-sm">
            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <CardHeader><CardTitle className="text-base flex items-center gap-2 text-slate-900"><Briefcase className="h-4 w-4 text-teal-600" /> Professional Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl"><div className="text-xs text-slate-400">Bar Council ID</div><div className="mt-1 text-sm font-mono font-medium text-slate-900">{profile?.barId || 'N/A'}</div></div>
            <div className="p-4 bg-slate-50 rounded-2xl"><div className="text-xs text-slate-400">Experience</div><div className="mt-1 text-sm font-medium text-slate-900">{profile?.experienceYears || 0} years</div></div>
            <div className="p-4 bg-slate-50 rounded-2xl"><div className="text-xs text-slate-400">Fee per Consultation</div><div className="mt-1 text-sm font-medium flex items-center gap-1 text-slate-900"><IndianRupee className="h-3.5 w-3.5 text-teal-600" />₹{profile?.feePerConsultation || 0}</div></div>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <CardHeader><CardTitle className="text-base flex items-center gap-2 text-slate-900"><Mail className="h-4 w-4 text-sky-600" /> Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Email</div><div className="text-sm font-medium text-slate-900">{user?.email}</div></div></div>
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Phone</div><div className="text-sm font-medium text-slate-900">{user?.phone}</div></div></div>
            <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3"><MapPin className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Location</div><div className="text-sm font-medium text-slate-900">{profile?.city}, {profile?.state}</div></div></div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-slate-900"><Award className="h-4 w-4 text-violet-600" /> Specializations & Languages</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3">Specializations</div>
              <div className="flex flex-wrap gap-2">
                {(profile?.specialization || []).length > 0
                  ? (profile.specialization || []).map((s) => <Badge key={s} className="rounded-full bg-teal-50 text-teal-700 border border-teal-100 capitalize px-3 py-1">{s}</Badge>)
                  : <span className="text-sm text-slate-400">No specialization added</span>}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-3 flex items-center gap-2"><Languages className="h-3.5 w-3.5" />Languages</div>
              <div className="flex flex-wrap gap-2">
                {profile?.languages?.length > 0
                  ? profile.languages.map((l) => <Badge key={l} variant="outline" className="rounded-full border-slate-200 capitalize px-3 py-1 text-slate-600">{l}</Badge>)
                  : <span className="text-sm text-slate-400">No languages added</span>}
              </div>
            </div>
            {profile?.bio && (
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 mb-2">Bio</div>
                <p className="text-sm leading-7 text-slate-600">“{profile.bio}”</p>
              </div>
            )}
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"><ShieldCheck className="h-4 w-4" />Keep your profile complete to improve matching quality.</div>
          </div>
        </CardContent>
      </Card>

      {isEditing && profile && <EditLawyerProfileModal open={isEditing} onClose={() => setIsEditing(false)} user={user} profile={profile} />}
    </div>
  )
}