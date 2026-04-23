// src/features/citizen/pages/FileFIRPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitFIR } from '../api/firApi'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import FileUpload from '@/components/shared/FileUpload'
import { PageHeader, PageStack } from '@/components/common/PageShell'
import { AlertTriangle, MapPin, Loader2, Send } from 'lucide-react'

const CATEGORIES = [
  { value: 'theft', label: 'Theft', desc: 'Burglary, robbery, vehicle theft' },
  { value: 'assault', label: 'Assault', desc: 'Physical attack, battery' },
  { value: 'fraud', label: 'Fraud', desc: 'Cheating, scam, financial fraud' },
  { value: 'harassment', label: 'Harassment', desc: 'Stalking, threats, abuse' },
  { value: 'cybercrime', label: 'Cyber Crime', desc: 'Hacking, online fraud' },
  { value: 'missing', label: 'Missing Person', desc: 'Missing person report' },
  { value: 'other', label: 'Other', desc: 'Other incidents' },
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
    <PageStack className="">
      <PageHeader
        eyebrow="FIR filing"
        title="File New FIR"
        description="Submit a First Information Report with clear incident details, location, and optional evidence."
      />

      <Alert className="border-amber-200 bg-amber-50 text-amber-950">
        <AlertTriangle className="h-4 w-4 text-amber-700" />
        <AlertDescription className="text-sm">
          Filing a false FIR is a punishable offense under IPC Section 182. Provide accurate details.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Incident Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Title / Subject</Label>
                  <Input placeholder="e.g. Mobile phone stolen near railway station" {...register('title')} className={errors.title ? 'border-red-300' : ''} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Detailed Description</Label>
                  <Textarea placeholder="Describe what happened, when it happened, who was involved, and any identifying details..." {...register('description')} rows={5} className={errors.description ? 'border-red-300' : ''} />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Incident Date & Time</Label>
                  <Input type="datetime-local" {...register('incidentTime')} className={errors.incidentTime ? 'border-red-300' : ''} />
                  {errors.incidentTime && <p className="text-xs text-destructive">{errors.incidentTime.message}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Incident Category</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {CATEGORIES.map((cat) => (
                    <button key={cat.value} type="button" onClick={() => setValue('category', cat.value)}
                      className={`rounded-xl border p-4 text-left text-sm transition-colors ${watch('category') === cat.value ? 'border-primary bg-primary/5 ring-3 ring-primary/10' : 'border-border bg-card hover:border-primary/40'}`}>
                      <div className="text-sm font-semibold text-foreground">{cat.label}</div>
                      <div className="mt-1 text-xs leading-5 text-muted-foreground">{cat.desc}</div>
                    </button>
                  ))}
                </div>
                {errors.category && <p className="mt-2 text-xs text-destructive">{errors.category.message}</p>}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Incident Location</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input placeholder="Full address of the incident" {...register('address')} className={errors.address ? 'border-red-300' : ''} />
                  {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label>Latitude</Label><Input placeholder="18.5204" {...register('lat')} className={errors.lat ? 'border-red-300' : ''} /></div>
                  <div className="space-y-1.5"><Label>Longitude</Label><Input placeholder="73.8567" {...register('lng')} className={errors.lng ? 'border-red-300' : ''} /></div>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={detectLocation} disabled={locating}>
                  <MapPin className="mr-1.5 h-3.5 w-3.5" />{locating ? 'Detecting...' : 'Use My Current Location'}
                </Button>
                {lat && lng && <p className="text-xs font-medium text-emerald-700">Location set: {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Evidence (Optional)</CardTitle><CardDescription>Upload photos, videos, or documents related to the incident</CardDescription></CardHeader>
              <CardContent>
                <FileUpload files={evidenceFiles} onChange={setEvidenceFiles} maxFiles={5} label="Upload evidence files (max 5)" />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={submitMutation.isPending}>
            {submitMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit FIR</>}
          </Button>
        </div>
      </form>
    </PageStack>
  )
}
