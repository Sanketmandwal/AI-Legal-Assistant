// src/features/onboarding/pages/PoliceOnboarding.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitPoliceProfile } from '../api/onboardingApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import FileUpload from '@/components/shared/FileUpload'
import { Shield, MapPin, CreditCard, Loader2, ArrowRight, ArrowLeft, Scale } from 'lucide-react'

const steps = [
  { label: 'Station Info', icon: Shield },
  { label: 'Location', icon: MapPin },
  { label: 'Documents', icon: CreditCard },
]

const policeSchema = z.object({
  stationName: z.string().min(1, 'Station name is required'),
  stationAddress: z.string().min(1, 'Station address is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  badgeId: z.string().optional(),
  jurisdictionAreas: z.string().optional(),
  jurisdictionRadius: z.string().optional(),
  lat: z.string().min(1, 'Latitude is required'),
  lng: z.string().min(1, 'Longitude is required'),
  aadharNumber: z.string().regex(/^\d{12}$/, 'Enter a valid 12-digit Aadhaar number'),
})

export default function PoliceOnboarding() {
  const [step, setStep] = useState(0)
  const [aadharFiles, setAadharFiles] = useState([])
  const [roleDocFiles, setRoleDocFiles] = useState([])
  const submitMutation = useSubmitPoliceProfile()
  const { register, handleSubmit, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(policeSchema),
    defaultValues: { stationName: '', stationAddress: '', district: '', state: '', badgeId: '', jurisdictionAreas: '', jurisdictionRadius: '15', lat: '', lng: '', aadharNumber: '' },
  })

  const stepFields = [['stationName', 'stationAddress', 'badgeId'], ['district', 'state', 'lat', 'lng', 'jurisdictionRadius'], ['aadharNumber']]

  const handleNext = async () => {
    const valid = await trigger(stepFields[step])
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const onSubmit = (data) => {
    if (!aadharFiles.length || !roleDocFiles.length) return
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => { if (value) formData.append(key, value) })
    formData.append('aadharFile', aadharFiles[0])
    roleDocFiles.forEach((f) => formData.append('roleDocuments', f))
    submitMutation.mutate(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3"><div className="h-10 w-10 bg-rose-600 rounded-lg flex items-center justify-center"><Scale className="h-5 w-5 text-white" /></div></div>
          <CardTitle className="text-xl">Police Station Profile</CardTitle>
          <CardDescription>Step {step + 1} of {steps.length} — {steps[step].label}</CardDescription>
          <Progress value={((step + 1) / steps.length) * 100} className="mt-3 h-1.5" />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 0 && (<>
              <div className="space-y-1.5"><Label>Station Name</Label><Input placeholder="e.g. Shivaji Nagar Police Station" {...register('stationName')} className={errors.stationName ? 'border-red-300' : ''} />{errors.stationName && <p className="text-xs text-red-500">{errors.stationName.message}</p>}</div>
              <div className="space-y-1.5"><Label>Station Address</Label><Input placeholder="Full address" {...register('stationAddress')} className={errors.stationAddress ? 'border-red-300' : ''} />{errors.stationAddress && <p className="text-xs text-red-500">{errors.stationAddress.message}</p>}</div>
              <div className="space-y-1.5"><Label>Badge ID (optional)</Label><Input placeholder="Officer badge ID" {...register('badgeId')} /></div>
            </>)}
            {step === 1 && (<>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>District</Label><Input {...register('district')} className={errors.district ? 'border-red-300' : ''} />{errors.district && <p className="text-xs text-red-500">{errors.district.message}</p>}</div>
                <div className="space-y-1.5"><Label>State</Label><Input {...register('state')} className={errors.state ? 'border-red-300' : ''} />{errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Latitude</Label><Input placeholder="e.g. 18.5204" {...register('lat')} className={errors.lat ? 'border-red-300' : ''} />{errors.lat && <p className="text-xs text-red-500">{errors.lat.message}</p>}</div>
                <div className="space-y-1.5"><Label>Longitude</Label><Input placeholder="e.g. 73.8567" {...register('lng')} className={errors.lng ? 'border-red-300' : ''} />{errors.lng && <p className="text-xs text-red-500">{errors.lng.message}</p>}</div>
              </div>
              <div className="space-y-1.5"><Label>Jurisdiction Radius (km)</Label><Input type="number" defaultValue="15" {...register('jurisdictionRadius')} /></div>
              <div className="space-y-1.5"><Label>Jurisdiction Areas (comma-separated)</Label><Input placeholder="e.g. Koregaon Park, Viman Nagar" {...register('jurisdictionAreas')} /></div>
            </>)}
            {step === 2 && (<>
              <div className="space-y-1.5"><Label>Aadhaar Number</Label><Input placeholder="12-digit" {...register('aadharNumber')} className={errors.aadharNumber ? 'border-red-300' : ''} />{errors.aadharNumber && <p className="text-xs text-red-500">{errors.aadharNumber.message}</p>}</div>
              <div className="space-y-1.5"><Label>Aadhaar Document</Label><FileUpload files={aadharFiles} onChange={setAadharFiles} maxFiles={1} accept="image/*,application/pdf" label="Upload Aadhaar" /></div>
              <div className="space-y-1.5"><Label>Police ID Documents</Label><FileUpload files={roleDocFiles} onChange={setRoleDocFiles} maxFiles={3} accept="image/*,application/pdf" label="Upload police ID / verification docs" /></div>
              {(!aadharFiles.length || !roleDocFiles.length) && <p className="text-xs text-amber-600">Both Aadhaar and at least 1 role document required</p>}
            </>)}
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
              {step < steps.length - 1 ? (<Button type="button" onClick={handleNext}>Next <ArrowRight className="ml-1 h-4 w-4" /></Button>) : (
                <Button type="submit" disabled={submitMutation.isPending || !aadharFiles.length || !roleDocFiles.length}>{submitMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit for Verification'}</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
