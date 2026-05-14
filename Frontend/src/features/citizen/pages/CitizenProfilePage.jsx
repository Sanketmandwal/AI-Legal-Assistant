import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosClient from '@/api/axiosClient'
import { updateUser } from '@/features/auth/slices/authSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  User, Mail, Phone, MapPin, CreditCard,
  Calendar, AlertTriangle, CheckCircle, Edit2, Loader2,
} from 'lucide-react'

/* ─── Edit Modal ──────────────────────────────────────── */
function EditCitizenProfileModal({ open, onClose, user, profile }) {
  const queryClient = useQueryClient()
  const dispatch    = useDispatch()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name:   user?.name  || '',
      phone:  user?.phone || '',
      gender: profile?.gender || '',
      dob:    profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
      address: {
        line1:    profile?.address?.line1    || '',
        line2:    profile?.address?.line2    || '',
        city:     profile?.address?.city     || '',
        district: profile?.address?.district || '',
        state:    profile?.address?.state    || '',
        pincode:  profile?.address?.pincode  || '',
      },
      emergencyContact: {
        name:     profile?.emergencyContact?.name     || '',
        phone:    profile?.emergencyContact?.phone    || '',
        relation: profile?.emergencyContact?.relation || '',
      },
    },
  })

  const mutation = useMutation({
    mutationFn: (data) => axiosClient.patch('/citizen/profile', data),
    onSuccess: (res) => {
      toast.success('Profile updated')
      dispatch(updateUser({
        name:  res.data.profile.userId.name  || user.name,
        phone: res.data.profile.userId.phone || user.phone,
      }))
      queryClient.invalidateQueries({ queryKey: ['citizenProfile'] })
      onClose()
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  })

  const inputCls = 'h-10 text-sm border-slate-200 focus:border-teal-400 focus:ring-teal-100'

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-0">

        {/* Modal header */}
        <div className="px-6 pt-6 pb-5 border-b border-slate-100">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Edit2 size={16} className="text-teal-600" />Edit Profile
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="px-6 py-5 space-y-7">

          {/* Personal */}
          <section className="space-y-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Personal Details</p>
            <div className="grid sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Full Name</Label><Input {...register('name')} required className={inputCls} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Phone</Label><Input {...register('phone')} required className={inputCls} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Gender</Label><Input {...register('gender')} placeholder="Male / Female / Other" className={inputCls} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Date of Birth</Label><Input type="date" {...register('dob')} className={inputCls} /></div>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Address */}
          <section className="space-y-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Address</p>
            <div className="space-y-3.5">
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Line 1</Label><Input {...register('address.line1')} className={inputCls} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Line 2</Label><Input {...register('address.line2')} className={inputCls} /></div>
              <div className="grid sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">City</Label><Input {...register('address.city')} className={inputCls} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">District</Label><Input {...register('address.district')} className={inputCls} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">State</Label><Input {...register('address.state')} className={inputCls} /></div>
                <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Pincode</Label><Input {...register('address.pincode')} className={inputCls} /></div>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Emergency */}
          <section className="space-y-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Emergency Contact</p>
            <div className="grid sm:grid-cols-3 gap-3.5">
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Name</Label><Input {...register('emergencyContact.name')} className={inputCls} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Phone</Label><Input {...register('emergencyContact.phone')} className={inputCls} /></div>
              <div className="space-y-1.5"><Label className="text-sm font-semibold text-slate-700">Relation</Label><Input {...register('emergencyContact.relation')} className={inputCls} /></div>
            </div>
          </section>

          {/* Footer */}
          <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" onClick={onClose} className="h-9 px-5 text-sm">Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}
              className="h-9 px-5 text-sm bg-teal-600 hover:bg-teal-700">
              {mutation.isPending && <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />}
              Save Changes
            </Button>
          </div>

        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Info Row ────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, iconColor = 'text-slate-400' }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl min-w-0">
      <div className="shrink-0 w-8 h-8 bg-white rounded-lg border border-slate-100 flex items-center justify-center shadow-sm">
        <Icon size={15} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value || 'N/A'}</p>
      </div>
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────────── */
export default function CitizenProfilePage() {
  const { user }    = useSelector((s) => s.auth)
  const [isEditing, setIsEditing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['citizenProfile'],
    queryFn:  async () => { const { data } = await axiosClient.get('/citizen/profile'); return data },
  })

  const profile  = data?.profile
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="w-full min-h-screen bg-slate-50">

      {/* ── HERO BANNER ─────────────────────────────── */}
      <div className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #5eead4, transparent 70%)' }} />
          <div className="absolute -bottom-12 -left-12 w-56 h-56 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #ffffff, transparent 70%)' }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #f8fafc)' }} />

        <div className="relative z-10 px-5 sm:px-8 pt-8 pb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            {/* Avatar + name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 shrink-0 border-2 border-white/30 shadow-lg">
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white leading-tight">{user?.name}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge className="bg-white/20 text-white border-0 text-xs capitalize h-5 px-2">
                    Citizen
                  </Badge>
                  {user?.emailVerified && (
                    <Badge className="bg-green-400/25 text-green-100 border-0 text-xs h-5 px-2 flex items-center gap-1">
                      <CheckCircle size={10} />Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={() => setIsEditing(true)}
              className="shrink-0 bg-white/15 hover:bg-white/25 text-white border border-white/25 h-9 px-4 text-sm font-semibold backdrop-blur-sm">
              <Edit2 size={13} className="mr-1.5" />Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────── */}
      <div className="px-5 sm:px-8 -mt-8 pb-12 relative z-10 space-y-5">

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* Account Info */}
            <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
              <CardHeader className="px-5 py-4">
                <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                    <User size={13} className="text-blue-600" />
                  </div>
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid sm:grid-cols-2 gap-3">
                  <InfoRow icon={Mail}     label="Email"         value={user?.email}  iconColor="text-blue-500"  />
                  <InfoRow icon={Phone}    label="Phone"         value={user?.phone}  iconColor="text-green-500" />
                  {profile && <>
                    <InfoRow icon={Calendar} label="Date of Birth"
                      value={profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN') : null}
                      iconColor="text-purple-500" />
                    <InfoRow icon={User}     label="Gender"
                      value={profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : null}
                      iconColor="text-teal-500" />
                  </>}
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            {profile?.address?.line1 && (
              <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
                <CardHeader className="px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 bg-rose-50 rounded-md flex items-center justify-center">
                      <MapPin size={13} className="text-rose-500" />
                    </div>
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-1">
                    <p className="font-semibold text-slate-800">{profile.address.line1}</p>
                    {profile.address.line2 && <p className="text-slate-600">{profile.address.line2}</p>}
                    <p className="text-slate-600">{profile.address.city}, {profile.address.district}</p>
                    <p className="text-slate-600">{profile.address.state} — {profile.address.pincode}</p>
                    {profile.address.country && <p className="text-slate-500">{profile.address.country}</p>}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Aadhaar + Emergency — side by side */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
                <CardHeader className="px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 bg-amber-50 rounded-md flex items-center justify-center">
                      <CreditCard size={13} className="text-amber-600" />
                    </div>
                    Aadhaar
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="bg-slate-50 rounded-xl p-3.5">
                    <p className="text-[11px] text-slate-400 font-medium mb-0.5">Aadhaar Number</p>
                    <p className="text-sm font-mono font-semibold text-slate-800">
                      {profile?.aadharNumber
                        ? `XXXX-XXXX-${profile.aadharNumber.slice(-4)}`
                        : <span className="text-slate-400 font-sans font-normal">Not provided</span>}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {profile?.emergencyContact?.name && (
                <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
                  <CardHeader className="px-5 py-4">
                    <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <div className="w-6 h-6 bg-red-50 rounded-md flex items-center justify-center">
                        <AlertTriangle size={13} className="text-red-500" />
                      </div>
                      Emergency Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5">
                    <div className="bg-slate-50 rounded-xl p-3.5 space-y-1">
                      <p className="text-sm font-semibold text-slate-800">{profile.emergencyContact.name}</p>
                      <p className="text-xs text-slate-500">{profile.emergencyContact.phone}</p>
                      <Badge variant="outline" className="text-[10px] h-4 px-1.5 capitalize border-slate-200 text-slate-500">
                        {profile.emergencyContact.relation}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      {isEditing && profile && (
        <EditCitizenProfileModal
          open={isEditing}
          onClose={() => setIsEditing(false)}
          user={user}
          profile={profile}
        />
      )}
    </div>
  )
}