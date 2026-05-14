import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitCitizenProfile } from '../api/onboardingApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import FileUpload from '@/components/shared/FileUpload'
import { User, MapPin, CreditCard, Phone, Loader2, ArrowRight, ArrowLeft, Scale, ShieldCheck } from 'lucide-react'

const steps = [
  { label: 'Personal Info', icon: User },
  { label: 'Address', icon: MapPin },
  { label: 'Aadhaar', icon: CreditCard },
  { label: 'Emergency', icon: Phone },
]

const citizenSchema = z.object({
  gender: z.enum(['male', 'female', 'other']),
  dob: z.string().min(1, 'Date of birth is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  district: z.string().min(1, 'District is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  aadharNumber: z.string().regex(/^\d{12}$/, 'Enter a valid 12-digit Aadhaar number'),
  emergencyContactName: z.string().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().regex(/^\+?\d{10,15}$/, 'Enter a valid phone number'),
  emergencyContactRelation: z.string().min(1, 'Relation is required'),
})

export default function CitizenOnboarding() {
  const [step, setStep] = useState(0)
  const [aadharFiles, setAadharFiles] = useState([])
  const submitMutation = useSubmitCitizenProfile()

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(citizenSchema),
    defaultValues: {
      gender: '', dob: '', line1: '', line2: '', city: '', district: '',
      state: '', pincode: '', aadharNumber: '',
      emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    },
  })

  const stepFields = [
    ['gender', 'dob'],
    ['line1', 'line2', 'city', 'district', 'state', 'pincode'],
    ['aadharNumber'],
    ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'],
  ]

  const handleNext = async () => {
    const valid = await trigger(stepFields[step])
    if (step === 2 && aadharFiles.length === 0) return
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1))
  }

  const onSubmit = (data) => {
    if (aadharFiles.length === 0) return
    const formData = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value)
    })
    formData.append('aadharFile', aadharFiles[0])
    formData.append('country', 'India')
    formData.append('preferredLanguage', 'en')

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          formData.append('lat', pos.coords.latitude)
          formData.append('lng', pos.coords.longitude)
          submitMutation.mutate(formData)
        },
        () => submitMutation.mutate(formData)
      )
    } else {
      submitMutation.mutate(formData)
    }
  }

  const progress = ((step + 1) / steps.length) * 100

  return <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef6f8_100%)] px-4 py-8 sm:py-12"><div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start"><div className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(135deg,#0f766e_0%,#0f766e_25%,#155e75_100%)] p-6 text-white shadow-[0_30px_70px_rgba(15,118,110,0.18)] sm:p-8 lg:min-h-[680px]"><div className="absolute -top-16 -right-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" /><div className="absolute bottom-0 left-0 h-44 w-44 rounded-full bg-white/10 blur-2xl" /><div className="relative z-10 flex h-full flex-col"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur"><Scale className="h-6 w-6" /></div><div><p className="text-sm font-medium tracking-[0.18em] text-white/70 uppercase">Citizen Onboarding</p><h1 className="text-2xl font-semibold sm:text-3xl">Complete your profile securely</h1></div></div><p className="mt-6 max-w-md text-sm leading-7 text-white/80">Set up your identity, address, and emergency contact details so your requests, documents, and support experience remain accurate and protected.</p><div className="mt-8 rounded-[28px] border border-white/15 bg-white/10 p-5 backdrop-blur-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.22em] text-white/60">Current step</p><p className="mt-1 text-lg font-semibold">{steps[step].label}</p></div><div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white/80">Step {step + 1} / {steps.length}</div></div><Progress value={progress} className="mt-4 h-2 bg-white/15 [&>div]:bg-white" /></div><div className="mt-8 grid gap-3 sm:grid-cols-2">{steps.map((item, index) => {const Icon = item.icon; const active = index === step; const completed = index < step; return <div key={item.label} className={`rounded-2xl border p-4 transition-all ${active ? 'border-white/30 bg-white/16 shadow-lg' : completed ? 'border-emerald-300/30 bg-emerald-400/10' : 'border-white/10 bg-white/5'}`}><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-white text-teal-700' : completed ? 'bg-emerald-200/90 text-emerald-800' : 'bg-white/10 text-white/80'}`}>{completed ? <ShieldCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}</div><div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-xs text-white/65">{completed ? 'Completed' : active ? 'In progress' : 'Upcoming'}</p></div></div></div>})}</div></div></div><Card className="overflow-hidden rounded-[34px] border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]"><CardHeader className="border-b border-slate-100 pb-5 pt-6 sm:px-7"><CardTitle className="text-2xl text-slate-900">Complete Your Profile</CardTitle><CardDescription className="text-sm leading-6 text-slate-500">Fill in the details below carefully. Every section is validated before you move forward.</CardDescription></CardHeader><CardContent className="p-6 sm:p-7"><form onSubmit={handleSubmit(onSubmit)} className="space-y-5">{step === 0 && <><div className="rounded-2xl bg-slate-50/80 p-4"><p className="text-sm font-semibold text-slate-900">Personal information</p><p className="mt-1 text-xs leading-6 text-slate-500">We use this for identity verification and account matching.</p></div><div className="space-y-2"><Label className="text-slate-700">Gender</Label><Select onValueChange={(v) => setValue('gender', v)} value={watch('gender')}><SelectTrigger className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.gender ? 'border-red-300' : ''}`}><SelectValue placeholder="Select gender" /></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>{errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}</div><div className="space-y-2"><Label htmlFor="onb-dob" className="text-slate-700">Date of Birth</Label><Input id="onb-dob" type="date" {...register('dob')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.dob ? 'border-red-300' : ''}`} />{errors.dob && <p className="text-xs text-red-500">{errors.dob.message}</p>}</div></>}{step === 1 && <><div className="rounded-2xl bg-slate-50/80 p-4"><p className="text-sm font-semibold text-slate-900">Residential address</p><p className="mt-1 text-xs leading-6 text-slate-500">This helps route services and legal support more accurately.</p></div><div className="space-y-2"><Label className="text-slate-700">Address Line 1</Label><Input placeholder="House no, street" {...register('line1')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.line1 ? 'border-red-300' : ''}`} />{errors.line1 && <p className="text-xs text-red-500">{errors.line1.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">Address Line 2</Label><Input placeholder="Landmark (optional)" {...register('line2')} className="h-11 rounded-2xl border-slate-200 bg-slate-50/70" /></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label className="text-slate-700">City</Label><Input placeholder="City" {...register('city')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.city ? 'border-red-300' : ''}`} />{errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">District</Label><Input placeholder="District" {...register('district')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.district ? 'border-red-300' : ''}`} />{errors.district && <p className="text-xs text-red-500">{errors.district.message}</p>}</div></div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label className="text-slate-700">State</Label><Input placeholder="State" {...register('state')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.state ? 'border-red-300' : ''}`} />{errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">Pincode</Label><Input placeholder="6-digit pincode" {...register('pincode')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.pincode ? 'border-red-300' : ''}`} />{errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}</div></div></>}{step === 2 && <><div className="rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-100"><p className="text-sm font-semibold text-slate-900">Aadhaar verification</p><p className="mt-1 text-xs leading-6 text-slate-600">Your document is used only for identity validation and profile verification.</p></div><div className="space-y-2"><Label className="text-slate-700">Aadhaar Number</Label><Input placeholder="12-digit Aadhaar" {...register('aadharNumber')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.aadharNumber ? 'border-red-300' : ''}`} />{errors.aadharNumber && <p className="text-xs text-red-500">{errors.aadharNumber.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">Aadhaar Document</Label><div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-4"><FileUpload files={aadharFiles} onChange={setAadharFiles} maxFiles={1} accept="image/*,application/pdf" label="Upload Aadhaar card (image or PDF)" /></div>{aadharFiles.length === 0 && <p className="text-xs text-amber-700">Please upload your Aadhaar card before continuing.</p>}</div></>}{step === 3 && <><div className="rounded-2xl bg-slate-50/80 p-4"><p className="text-sm font-semibold text-slate-900">Emergency contact</p><p className="mt-1 text-xs leading-6 text-slate-500">This person may be used as a support contact in urgent situations.</p></div><div className="space-y-2"><Label className="text-slate-700">Contact Name</Label><Input placeholder="Emergency contact name" {...register('emergencyContactName')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.emergencyContactName ? 'border-red-300' : ''}`} />{errors.emergencyContactName && <p className="text-xs text-red-500">{errors.emergencyContactName.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">Contact Phone</Label><Input placeholder="+919876543210" {...register('emergencyContactPhone')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.emergencyContactPhone ? 'border-red-300' : ''}`} />{errors.emergencyContactPhone && <p className="text-xs text-red-500">{errors.emergencyContactPhone.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">Relation</Label><Input placeholder="e.g. Father, Mother, Spouse" {...register('emergencyContactRelation')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.emergencyContactRelation ? 'border-red-300' : ''}`} />{errors.emergencyContactRelation && <p className="text-xs text-red-500">{errors.emergencyContactRelation.message}</p>}</div></>}<div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0} className="h-11 rounded-2xl border-slate-200"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>{step < steps.length - 1 ? <Button type="button" onClick={handleNext} className="h-11 rounded-2xl bg-teal-600 hover:bg-teal-700">Next <ArrowRight className="ml-1 h-4 w-4" /></Button> : <Button type="submit" disabled={submitMutation.isPending} className="h-11 rounded-2xl bg-teal-600 hover:bg-teal-700">{submitMutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Complete Profile'}</Button>}</div></form></CardContent></Card></div></div>
}