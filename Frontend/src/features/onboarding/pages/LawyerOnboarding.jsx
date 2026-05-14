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
import { Loader2, ArrowRight, ArrowLeft, Scale, Briefcase, MapPin, FileBadge2, ShieldCheck } from 'lucide-react'

const steps = [
  { label: 'Credentials', icon: Briefcase },
  { label: 'Location', icon: MapPin },
  { label: 'Documents', icon: FileBadge2 },
]

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
  const next = async () => { if (await trigger(fields[step])) setStep((s) => Math.min(s + 1, 2)) }
  const onSubmit = (data) => {
    if (!aadharFiles.length || !roleDocFiles.length) return
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v) })
    fd.append('aadharFile', aadharFiles[0])
    roleDocFiles.forEach((f) => fd.append('roleDocuments', f))
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => { fd.append('lat', p.coords.latitude); fd.append('lng', p.coords.longitude); mutation.mutate(fd) }, () => mutation.mutate(fd))
    } else mutation.mutate(fd)
  }
  const progress = ((step + 1) / steps.length) * 100

  return <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-4 py-8 sm:py-12"><div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_0.96fr] lg:items-start"><div className="relative overflow-hidden rounded-[34px] border border-slate-200 bg-[linear-gradient(135deg,#111827_0%,#0f172a_38%,#0f766e_100%)] p-6 text-white shadow-[0_30px_70px_rgba(15,23,42,0.22)] sm:p-8 lg:min-h-[650px]"><div className="absolute -top-16 right-0 h-60 w-60 rounded-full bg-white/10 blur-3xl" /><div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl" /><div className="relative z-10 flex h-full flex-col"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur"><Scale className="h-6 w-6" /></div><div><p className="text-sm font-medium uppercase tracking-[0.18em] text-white/65">Lawyer Onboarding</p><h1 className="text-2xl font-semibold sm:text-3xl">Set up your professional profile</h1></div></div><p className="mt-6 max-w-md text-sm leading-7 text-white/78">Add your legal credentials, location, and verification documents so clients can discover you with trust and confidence.</p><div className="mt-8 rounded-[28px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm"><div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.22em] text-white/55">Profile completion</p><p className="mt-1 text-lg font-semibold">{steps[step].label}</p></div><div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">Step {step + 1} / 3</div></div><Progress value={progress} className="mt-4 h-2 bg-white/12 [&>div]:bg-emerald-300" /></div><div className="mt-8 space-y-3">{steps.map((item, index) => {const Icon = item.icon; const active = index === step; const completed = index < step; return <div key={item.label} className={`rounded-2xl border p-4 transition-all ${active ? 'border-white/25 bg-white/12' : completed ? 'border-emerald-300/20 bg-emerald-400/10' : 'border-white/8 bg-white/[0.04]'}`}><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-white text-slate-900' : completed ? 'bg-emerald-200 text-emerald-900' : 'bg-white/10 text-white/75'}`}>{completed ? <ShieldCheck className="h-5 w-5" /> : <Icon className="h-5 w-5" />}</div><div><p className="text-sm font-semibold text-white">{item.label}</p><p className="text-xs text-white/60">{completed ? 'Ready' : active ? 'Current step' : 'Pending'}</p></div></div></div>})}</div></div></div><Card className="overflow-hidden rounded-[34px] border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.08)]"><CardHeader className="border-b border-slate-100 pb-5 pt-6 sm:px-7"><CardTitle className="text-2xl text-slate-900">Lawyer Profile Setup</CardTitle><CardDescription className="text-sm leading-6 text-slate-500">Fill this carefully so your profile can be verified and matched to relevant legal consultations.</CardDescription></CardHeader><CardContent className="p-6 sm:p-7"><form onSubmit={handleSubmit(onSubmit)} className="space-y-5">{step === 0 && <><div className="rounded-2xl bg-slate-50/80 p-4"><p className="text-sm font-semibold text-slate-900">Professional credentials</p><p className="mt-1 text-xs leading-6 text-slate-500">These details shape how clients view and discover your practice.</p></div><div className="space-y-2"><Label className="text-slate-700">Bar Council ID</Label><Input placeholder="MH/1234/2020" {...register('barId')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.barId ? 'border-red-300' : ''}`} />{errors.barId && <p className="text-xs text-red-500">{errors.barId.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">Specializations (comma-separated)</Label><Input placeholder="criminal law, cyber crime" {...register('specialization')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.specialization ? 'border-red-300' : ''}`} />{errors.specialization && <p className="text-xs text-red-500">{errors.specialization.message}</p>}</div><div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label className="text-slate-700">Experience (yrs)</Label><Input type="number" placeholder="5" {...register('experienceYears')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.experienceYears ? 'border-red-300' : ''}`} />{errors.experienceYears && <p className="text-xs text-red-500">{errors.experienceYears.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">Fee (₹)</Label><Input type="number" placeholder="500" {...register('feePerConsultation')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.feePerConsultation ? 'border-red-300' : ''}`} />{errors.feePerConsultation && <p className="text-xs text-red-500">{errors.feePerConsultation.message}</p>}</div></div><div className="space-y-2"><Label className="text-slate-700">Languages</Label><Input placeholder="english, hindi" {...register('languages')} className="h-11 rounded-2xl border-slate-200 bg-slate-50/70" /></div><div className="space-y-2"><Label className="text-slate-700">Bio</Label><Textarea placeholder="Brief professional bio..." {...register('bio')} rows={4} className="rounded-2xl border-slate-200 bg-slate-50/70 resize-none" /></div></>}{step === 1 && <><div className="rounded-2xl bg-slate-50/80 p-4"><p className="text-sm font-semibold text-slate-900">Location details</p><p className="mt-1 text-xs leading-6 text-slate-500">This helps route consultations and improve location-based lawyer matching.</p></div><div className="space-y-2"><Label className="text-slate-700">City</Label><Input {...register('city')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.city ? 'border-red-300' : ''}`} />{errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">State</Label><Input {...register('state')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.state ? 'border-red-300' : ''}`} />{errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}</div></>}{step === 2 && <><div className="rounded-2xl bg-amber-50/70 p-4 ring-1 ring-amber-100"><p className="text-sm font-semibold text-slate-900">Verification documents</p><p className="mt-1 text-xs leading-6 text-slate-600">Upload clear documents so your profile can move through review smoothly.</p></div><div className="space-y-2"><Label className="text-slate-700">Aadhaar Number</Label><Input placeholder="12-digit" {...register('aadharNumber')} className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 ${errors.aadharNumber ? 'border-red-300' : ''}`} />{errors.aadharNumber && <p className="text-xs text-red-500">{errors.aadharNumber.message}</p>}</div><div className="space-y-2"><Label className="text-slate-700">Aadhaar</Label><div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-4"><FileUpload files={aadharFiles} onChange={setAadharFiles} maxFiles={1} label="Upload Aadhaar" /></div></div><div className="space-y-2"><Label className="text-slate-700">Bar Council / Professional Docs</Label><div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 p-4"><FileUpload files={roleDocFiles} onChange={setRoleDocFiles} maxFiles={3} label="Upload up to 3 docs" /></div></div>{(!aadharFiles.length || !roleDocFiles.length) && <p className="text-xs text-amber-700">Both Aadhaar and role documents are required before submission.</p>}</> }<div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0} className="h-11 rounded-2xl border-slate-200"><ArrowLeft className="mr-1 h-4 w-4" /> Back</Button>{step < 2 ? <Button type="button" onClick={next} className="h-11 rounded-2xl bg-slate-900 hover:bg-slate-800">Next <ArrowRight className="ml-1 h-4 w-4" /></Button> : <Button type="submit" disabled={mutation.isPending || !aadharFiles.length || !roleDocFiles.length} className="h-11 rounded-2xl bg-teal-600 hover:bg-teal-700">{mutation.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit for Verification'}</Button>}</div></form></CardContent></Card></div></div>
}