// src/features/admin/pages/AdminProfilePage.jsx
import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axiosClient from '@/api/axiosClient'
import { updateUser } from '@/features/auth/slices/authSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Shield, Mail, Phone, Edit2, Loader2, CheckCircle } from 'lucide-react'

function EditAdminProfileModal({ open, onClose, user }) {
  const dispatch = useDispatch()
  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    }
  })

  const mutation = useMutation({
    mutationFn: (data) => axiosClient.patch('/admin/profile', data),
    onSuccess: (res) => {
      toast.success('Profile updated')
      dispatch(updateUser({ name: res.data.user.name, phone: res.data.user.phone }))
      onClose()
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    }
  })

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Admin Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Full Name</Label><Input {...register('name')} required /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input {...register('phone')} required /></div>
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

export default function AdminProfilePage() {
  const { user } = useSelector((s) => s.auth)
  const [isEditing, setIsEditing] = useState(false)
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-900/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-4 border-primary/10">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{user?.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="bg-primary/10 text-primary border-0">System Admin</Badge>
                {user?.emailVerified && <Badge className="bg-green-500/10 text-green-700 border-0"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>}
              </div>
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Admin Details</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><Mail className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Email Address</div><div className="text-sm font-medium">{user?.email}</div></div></div>
          <div className="p-3 bg-slate-50 rounded-xl flex items-center gap-3"><Phone className="h-4 w-4 text-slate-400" /><div><div className="text-xs text-slate-400">Phone Number</div><div className="text-sm font-medium">{user?.phone || 'Not provided'}</div></div></div>
        </CardContent>
      </Card>

      {isEditing && (
        <EditAdminProfileModal 
          open={isEditing} 
          onClose={() => setIsEditing(false)} 
          user={user} 
        />
      )}
    </div>
  )
}
