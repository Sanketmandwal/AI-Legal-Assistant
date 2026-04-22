// src/features/onboarding/pages/LawyerOnboarding.jsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitLawyerProfile } from '../api/onboardingApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import FileUpload from '@/components/shared/FileUpload'
import { Loader2, ArrowRight, ArrowLeft, Scale } from 'lucide-react'

const steps = ['Credentials', 'Location', 'Documents']

const schema = z.object({
  barId: z.string().min(1, 'Bar Council ID is required'),
  specialization: z.string().min(1, 'At least one specialization is required'),
  experienceYears: z.string().min(1, 'Experience is required'),
  bio: z.string().max(2000).optional(),
  languages: z.string().optional(),
  feePerConsultation: z.string().min(1, 'Fee is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  aadharNumber: z.string().regex(/^\d{12}$/, 'Valid 12-digit Aadhaar required'),
})

export default function LawyerOnboarding() {
  const [step, setStep] = useState(0)
  const [aadharFiles, setAadharFiles] = useState([])
  const [roleDocFiles, setRoleDocFiles] = useState([])
  const mutation = useSubmitLawyerProfile()

  const { register, handleSubmit, trigger, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { barId: '', specialization: '', experienceYears: '', bio: '', languages: '', feePerConsultation: '', city: '', state: '', aadharNumber: '' },
  })

  const fields = [['barId', 'specialization', 'experienceYears', 'feePerConsultation'], ['city', 'state'], ['aadharNumber']]

  const next = async () => { if (await trigger(fields[step])) setStep(s => Math.min(s + 1, 2)) }

  const onSubmit = (data) => {
    if (!aadharFiles.length || !roleDocFiles.length) return
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v) })
    fd.append('aadharFile', aadharFiles[0])
    roleDocFiles.forEach(f => fd.append('roleDocuments', f))
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(p => { fd.append('lat', p.coords.latitude); fd.append('lng', p.coords.longitude); mutation.mutate(fd) }, () => mutation.mutate(fd))
    } else mutation.mutate(fd)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center py-8 px-4">
      <Card className="w-full max-w-lg border-0 shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3"><div className="h-10 w-10 bg-emerald-600 rounded-lg flex items-center justify-center"><Scale className="h-5 w-5 text-white" /></div></div>
          <CardTitle className="text-xl">Lawyer Profile Setup</CardTitle>
          <CardDescription>Step {step + 1} of 3 — {steps[step]}</CardDescription>
          <Progress value={((step + 1) / 3) * 100} className="mt-3 h-1.5" />
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 0 && (<>
              <div className="space-y-1.5"><Label>Bar Council ID</Label><Input placeholder="MH/1234/2020" {...register('barId')} className={errors.barId ? 'border-red-300' : ''} />{errors.barId && <p className="text-xs text-red-500">{errors.barId.message}</p>}</div>
              <div className="space-y-1.5"><Label>Specializations (comma-separated)</Label><Input placeholder="criminal law, cyber crime" {...register('specialization')} className={errors.specialization ? 'border-red-300' : ''} />{errors.specialization && <p className="text-xs text-red-500">{errors.specialization.message}</p>}</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label>Experience (yrs)</Label><Input type="number" placeholder="5" {...register('experienceYears')} className={errors.experienceYears ? 'border-red-300' : ''} />{errors.experienceYears && <p className="text-xs text-red-500">{errors.experienceYears.message}</p>}</div>
                <div className="space-y-1.5"><Label>Fee (₹)</Label><Input type="number" placeholder="500" {...register('feePerConsultation')} className={errors.feePerConsultation ? 'border-red-300' : ''} />{errors.feePerConsultation && <p className="text-xs text-red-500">{errors.feePerConsultation.message}</p>}</div>
              </div>
              <div className="space-y-1.5"><Label>Languages</Label><Input placeholder="english, hindi" {...register('languages')} /></div>
              <div className="space-y-1.5"><Label>Bio</Label><Textarea placeholder="Brief professional bio..." {...register('bio')} rows={3} /></div>
            </>)}
            {step === 1 && (<>
              <div className="space-y-1.5"><Label>City</Label><Input {...register('city')} className={errors.city ? 'border-red-300' : ''} />{errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}</div>
              <div className="space-y-1.5"><Label>State</Label><Input {...register('state')} className={errors.state ? 'border-red-300' : ''} />{errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}</div>
            </>)}
            {step === 2 && (<>
              <div className="space-y-1.5"><Label>Aadhaar Number</Label><Input placeholder="12-digit" {...register('aadharNumber')} className={errors.aadharNumber ? 'border-red-300' : ''} />{errors.aadharNumber && <p className="text-xs text-red-500">{errors.aadharNumber.message}</p>}</div>
              <div className="space-y-1.5"><Label>Aadhaar</Label><FileUpload files={aadharFiles} onChange={setAadharFiles} maxFiles={1} label="Upload Aadhaar" /></div>
              <div className="space-y-1.5"><Label>Bar Council / Professional Docs</Label><FileUpload files={roleDocFiles} onChange={setRoleDocFiles} maxFiles={3} label="Upload up to 3 docs" /></div>
              {(!aadharFiles.length || !roleDocFiles.length) && <p className="text-xs text-amber-600">Both Aadhaar and role documents required</p>}
            </>)}
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(s => Math.max(s - 1, 0))} disabled={step === 0}><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>
              {step < 2 ? <Button type="button" onClick={next}>Next <ArrowRight className="ml-1 h-4 w-4" /></Button> : (
                <Button type="submit" disabled={mutation.isPending || !aadharFiles.length || !roleDocFiles.length}>{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit for Verification'}</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
