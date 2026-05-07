// src/features/police/pages/PoliceProfilePage.jsx
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosClient from '@/api/axiosClient'
import { updateUser } from '@/features/auth/slices/authSlice'
import { usePoliceProfile } from '../api/policeDashApi'
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
import { Shield, MapPin, Mail, Phone, Map, CheckCircle, Edit2, Loader2 } from 'lucide-react'

function EditPoliceProfileModal({ open, onClose, user, profile }) {
  const queryClient = useQueryClient()
  const dispatch = useDispatch()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      stationAddress: profile?.stationAddress || '',
      jurisdictionRadius: profile?.jurisdictionRadius || '',
    }
  })

  const mutation = useMutation({
    mutationFn: (data) => axiosClient.patch('/police/profile', data),
    onSuccess: (res) => {
      toast.success('Profile updated')
      dispatch(updateUser({ name: res.data.profile.userId.name || user.name, phone: res.data.profile.userId.phone || user.phone }))
      queryClient.invalidateQueries({ queryKey: ['policeProfile'] })
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Police Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Officer Details</h3>
            <div className="space-y-1.5"><Label>Officer Name</Label><Input {...register('name')} required /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input {...register('phone')} required /></div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Station Details</h3>
            <div className="space-y-1.5"><Label>Station Address</Label><Textarea {...register('stationAddress')} rows={2} required /></div>
            <div className="space-y-1.5"><Label>Jurisdiction Radius (km)</Label><Input type="number" {...register('jurisdictionRadius')} min={1} required /></div>
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

export default function PoliceProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const [isEditing, setIsEditing] = useState(false)
  const { data, isLoading } = usePoliceProfile()
  const profile = data?.profile
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  if (isLoading) return <div className="space-y-4 max-w-3xl mx-auto">{[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-white/30"><AvatarFallback className="bg-white/20 text-white text-2xl font-bold">{initials}</AvatarFallback></Avatar>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-0">Police Officer</Badge>
                <StatusBadge status={profile?.verificationStatus || 'pending'} />
              </div>
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)} className="bg-white/20 hover:bg-white/30 text-white border-0">
            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
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

      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-blue-600" /> Verification Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl"><div className="text-xs text-slate-400">Badge ID</div><div className="text-sm font-mono font-medium">{profile?.badgeId || 'N/A'}</div></div>
          </CardContent>
        </Card>
        <Card className="">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-indigo-600" /> Contact Details</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Email</div><div className="text-sm font-medium">{user?.email}</div></div></div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Phone</div><div className="text-sm font-medium">{user?.phone}</div></div></div>
          </CardContent>
        </Card>
      </div>

      {isEditing && profile && (
        <EditPoliceProfileModal 
          open={isEditing} 
          onClose={() => setIsEditing(false)} 
          user={user} 
          profile={profile} 
        />
      )}
    </div>
  )
}
