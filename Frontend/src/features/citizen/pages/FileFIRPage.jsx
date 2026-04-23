// src/features/citizen/pages/FileFIRPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitFIR } from '../api/firApi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FileUpload from '@/components/shared/FileUpload'
import { AlertTriangle, MapPin, Loader2, FileText, Send } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const CATEGORIES = [
  { value: 'theft', label: '🔓 Theft', desc: 'Burglary, robbery, vehicle theft' },
  { value: 'assault', label: '👊 Assault', desc: 'Physical attack, battery' },
  { value: 'fraud', label: '💳 Fraud', desc: 'Cheating, scam, financial fraud' },
  { value: 'harassment', label: '🚫 Harassment', desc: 'Stalking, threats, abuse' },
  { value: 'cybercrime', label: '💻 Cyber Crime', desc: 'Hacking, online fraud' },
  { value: 'missing', label: '🔍 Missing Person', desc: 'Missing person report' },
  { value: 'other', label: '📋 Other', desc: 'Other incidents' },
]

const firSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
  category: z.enum(['theft', 'assault', 'fraud', 'harassment', 'cybercrime', 'missing', 'other']),
  incidentTime: z.string().min(1, 'Incident date/time is required'),
  address: z.string().min(5, 'Address is required'),
  lat: z.string().min(1, 'Location is required'),
  lng: z.string().min(1, 'Location is required'),
})

export default function FileFIRPage() {
  const [evidenceFiles, setEvidenceFiles] = useState([])
  const [locating, setLocating] = useState(false)
  const navigate = useNavigate()
  const submitMutation = useSubmitFIR()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(firSchema),
    defaultValues: { title: '', description: '', category: '', incidentTime: '', address: '', lat: '', lng: '' },
  })

  const lat = watch('lat')
  const lng = watch('lng')

  const detectLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => { setValue('lat', String(pos.coords.latitude)); setValue('lng', String(pos.coords.longitude)); setLocating(false) },
      () => { setLocating(false) },
      { enableHighAccuracy: true }
    )
  }

  const onSubmit = (data) => {
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.append(k, v))
    evidenceFiles.forEach((f) => formData.append('evidenceFiles', f))
    submitMutation.mutate(formData, { onSuccess: () => navigate('/citizen/my-firs') })
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center"><FileText className="h-5 w-5 text-white" /></div>
          File New FIR
        </h1>
        <p className="text-sm text-slate-500 mt-1 ml-12">Submit a First Information Report. It will be assigned to the nearest police station automatically.</p>
      </div>

      <Alert className="border-amber-200 bg-amber-50">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          Filing a false FIR is a punishable offense under IPC Section 182. Provide accurate details.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Category */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Incident Category</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat.value} type="button" onClick={() => setValue('category', cat.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all text-sm ${watch('category') === cat.value ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300 bg-white'}`}>
                  <div className="font-semibold text-xs">{cat.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{cat.desc}</div>
                </button>
              ))}
            </div>
            {errors.category && <p className="text-xs text-red-500 mt-2">{errors.category.message}</p>}
          </CardContent>
        </Card>

        {/* Incident Details */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Incident Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title / Subject</Label>
              <Input placeholder="e.g. Mobile phone stolen near railway station" {...register('title')} className={errors.title ? 'border-red-300' : ''} />
              {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Detailed Description</Label>
              <Textarea placeholder="Describe the incident in detail — what happened, when, who was involved, any identifying features..." {...register('description')} rows={5} className={errors.description ? 'border-red-300' : ''} />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Incident Date & Time</Label>
              <Input type="datetime-local" {...register('incidentTime')} className={errors.incidentTime ? 'border-red-300' : ''} />
              {errors.incidentTime && <p className="text-xs text-red-500">{errors.incidentTime.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Incident Location</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Address</Label>
              <Input placeholder="Full address of the incident" {...register('address')} className={errors.address ? 'border-red-300' : ''} />
              {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Latitude</Label><Input placeholder="18.5204" {...register('lat')} className={errors.lat ? 'border-red-300' : ''} /></div>
              <div className="space-y-1.5"><Label>Longitude</Label><Input placeholder="73.8567" {...register('lng')} className={errors.lng ? 'border-red-300' : ''} /></div>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={detectLocation} disabled={locating}>
              <MapPin className="mr-1.5 h-3.5 w-3.5" />{locating ? 'Detecting...' : 'Use My Current Location'}
            </Button>
            {lat && lng && <p className="text-xs text-green-600">📍 Location set: {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</p>}
          </CardContent>
        </Card>

        {/* Evidence */}
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-3"><CardTitle className="text-base">Evidence (Optional)</CardTitle><CardDescription className="text-xs">Upload photos, videos, or documents related to the incident</CardDescription></CardHeader>
          <CardContent>
            <FileUpload files={evidenceFiles} onChange={setEvidenceFiles} maxFiles={5} label="Upload evidence files (max 5)" />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={submitMutation.isPending} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
            {submitMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit FIR</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
