// src/features/citizen/pages/CitizenProfilePage.jsx
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
import { User, Mail, Phone, MapPin, CreditCard, Calendar, AlertTriangle, CheckCircle, Edit2, Loader2 } from 'lucide-react'

function EditCitizenProfileModal({ open, onClose, user, profile }) {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      gender: profile?.gender || '',
      dob: profile?.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
      address: {
        line1: profile?.address?.line1 || '',
        line2: profile?.address?.line2 || '',
        city: profile?.address?.city || '',
        district: profile?.address?.district || '',
        state: profile?.address?.state || '',
        pincode: profile?.address?.pincode || '',
      },
      emergencyContact: {
        name: profile?.emergencyContact?.name || '',
        phone: profile?.emergencyContact?.phone || '',
        relation: profile?.emergencyContact?.relation || '',
      }
    }
  })

  const mutation = useMutation({
    mutationFn: (data) => axiosClient.patch('/citizen/profile', data),
    onSuccess: (res) => {
      toast.success('Profile updated')
      // Update redux user if name or phone changed
      dispatch(updateUser({ name: res.data.profile.userId.name || user.name, phone: res.data.profile.userId.phone || user.phone }))
      queryClient.invalidateQueries({ queryKey: ['citizenProfile'] })
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Personal Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Full Name</Label><Input {...register('name')} required /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input {...register('phone')} required /></div>
              <div className="space-y-1.5"><Label>Gender</Label><Input {...register('gender')} placeholder="Male/Female/Other" /></div>
              <div className="space-y-1.5"><Label>Date of Birth</Label><Input type="date" {...register('dob')} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Address</h3>
            <div className="space-y-1.5"><Label>Line 1</Label><Input {...register('address.line1')} /></div>
            <div className="space-y-1.5"><Label>Line 2</Label><Input {...register('address.line2')} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>City</Label><Input {...register('address.city')} /></div>
              <div className="space-y-1.5"><Label>District</Label><Input {...register('address.district')} /></div>
              <div className="space-y-1.5"><Label>State</Label><Input {...register('address.state')} /></div>
              <div className="space-y-1.5"><Label>Pincode</Label><Input {...register('address.pincode')} /></div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Emergency Contact</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label>Name</Label><Input {...register('emergencyContact.name')} /></div>
              <div className="space-y-1.5"><Label>Phone</Label><Input {...register('emergencyContact.phone')} /></div>
              <div className="space-y-1.5"><Label>Relation</Label><Input {...register('emergencyContact.relation')} /></div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function CitizenProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const [isEditing, setIsEditing] = useState(false)
  const { data, isLoading } = useQuery({
    queryKey: ['citizenProfile'],
    queryFn: async () => { const { data } = await axiosClient.get('/citizen/profile'); return data },
  })

  const profile = data?.profile
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-white/30">
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0 capitalize">Citizen</Badge>
                {user?.emailVerified && <Badge className="bg-green-500/30 text-green-100 border-0"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>}
              </div>
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 text-white border-0">
            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
      ) : (
        <>
          {/* Account Info */}
          <Card className="">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-blue-600" /> Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><Mail className="h-5 w-5 text-slate-400" /><div><div className="text-xs text-slate-400">Email</div><div className="text-sm font-medium">{user?.email}</div></div></div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><Phone className="h-5 w-5 text-slate-400" /><div><div className="text-xs text-slate-400">Phone</div><div className="text-sm font-medium">{user?.phone}</div></div></div>
              </div>
              {profile && (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><Calendar className="h-5 w-5 text-slate-400" /><div><div className="text-xs text-slate-400">Date of Birth</div><div className="text-sm font-medium">{profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN') : 'N/A'}</div></div></div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"><User className="h-5 w-5 text-slate-400" /><div><div className="text-xs text-slate-400">Gender</div><div className="text-sm font-medium capitalize">{profile.gender || 'N/A'}</div></div></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address */}
          {profile?.address && (
            <Card className="">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4 text-rose-500" /> Address</CardTitle></CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-sm">
                  <p className="font-medium">{profile.address.line1}</p>
                  {profile.address.line2 && <p>{profile.address.line2}</p>}
                  <p>{profile.address.city}, {profile.address.district}</p>
                  <p>{profile.address.state} - {profile.address.pincode}</p>
                  <p>{profile.address.country}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Identity & Emergency */}
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4 text-amber-600" /> Aadhaar</CardTitle></CardHeader>
              <CardContent><div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs text-slate-400">Aadhaar Number</div><div className="text-sm font-mono font-medium mt-0.5">{profile?.aadharNumber ? `XXXX-XXXX-${profile.aadharNumber.slice(-4)}` : 'Not provided'}</div></div></CardContent>
            </Card>
            {profile?.emergencyContact && (
              <Card className="">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Emergency Contact</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-xl text-sm"><div className="font-medium">{profile.emergencyContact.name}</div><div className="text-slate-500">{profile.emergencyContact.phone} • {profile.emergencyContact.relation}</div></div>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

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
