import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSubmitFIR } from '../api/firApi'
import { aiApi } from '@/api/aiApi'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import FileUpload from '@/components/shared/FileUpload'
import { AlertTriangle, MapPin, Loader2, Send, Sparkles, ChevronLeft, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { value: 'theft',      label: 'Theft',         desc: 'Burglary, robbery, theft',  icon: '🔓' },
  { value: 'assault',    label: 'Assault',        desc: 'Physical attack, battery',  icon: '⚠️' },
  { value: 'fraud',      label: 'Fraud',          desc: 'Cheating, scam, fraud',     icon: '💳' },
  { value: 'harassment', label: 'Harassment',     desc: 'Stalking, threats, abuse',  icon: '🚫' },
  { value: 'cybercrime', label: 'Cyber Crime',    desc: 'Hacking, online fraud',     icon: '💻' },
  { value: 'missing',    label: 'Missing Person', desc: 'Missing person report',     icon: '🔍' },
  { value: 'other',      label: 'Other',          desc: 'Other incidents',           icon: '📄' },
]

const firSchema = z.object({
  title:        z.string().min(5, 'Title must be at least 5 characters').max(200),
  description:  z.string().min(20, 'Description must be at least 20 characters').max(5000),
  category:     z.enum(['theft','assault','fraud','harassment','cybercrime','missing','other']),
  incidentTime: z.string().min(1, 'Incident date/time is required'),
  address:      z.string().min(5, 'Address is required'),
  lat:          z.string().min(1, 'Location is required'),
  lng:          z.string().min(1, 'Location is required'),
})

/* ─── AI Modal ──────────────────────────────────────── */
function AIDrafterModal({ open, onClose, onApply }) {
  const [scenario,   setScenario]   = useState('')
  const [isLoading,  setIsLoading]  = useState(false)

  const handleGenerate = async () => {
    if (scenario.trim().length < 20) {
      toast.error('Please describe the incident in at least 20 characters.')
      return
    }
    setIsLoading(true)
    try {
      const response = await aiApi.generateFir({ scenario })
      if (response.draft) { onApply(response.draft); toast.success('Draft generated!'); onClose() }
      else toast.error('AI could not generate a draft. Try again.')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to connect to AI engine.')
    } finally { setIsLoading(false) }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-lg rounded-2xl p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-5"
          style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 100%)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-white text-base font-bold">
              <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-teal-200" />
              </div>
              AI FIR Drafter
            </DialogTitle>
            <DialogDescription className="text-white/65 text-xs mt-1.5 leading-relaxed">
              Describe what happened in plain language — our AI will draft a formal FIR with relevant IPC sections.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 py-5 bg-white space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold text-slate-700">Describe the Incident</Label>
            <Textarea
              placeholder="e.g. My mobile phone was snatched by two men on a bike while I was waiting at a bus stop..."
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              rows={6}
              className="text-sm resize-none border-slate-200 focus:border-teal-400 placeholder:text-slate-400"
            />
            <p className="text-[11px] text-slate-400 text-right">{scenario.length} chars</p>
          </div>
          <div className="flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}
              className="h-9 px-4 text-sm rounded-xl">Cancel</Button>
            <Button size="sm" onClick={handleGenerate} disabled={isLoading}
              className="h-9 px-4 text-sm rounded-xl bg-teal-600 hover:bg-teal-700">
              {isLoading
                ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />Generating…</>
                : <><Sparkles className="mr-1.5 h-3.5 w-3.5" />Generate Draft</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Field wrapper ──────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-slate-700">{label}</Label>
      {children}
      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={11} className="shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/* ─── Main ───────────────────────────────────────────── */
export default function FileFIRPage() {
  const [evidenceFiles, setEvidenceFiles] = useState([])
  const [locating,      setLocating]      = useState(false)
  const [aiModalOpen,   setAiModalOpen]   = useState(false)
  const navigate = useNavigate()
  const submitMutation = useSubmitFIR()

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(firSchema),
    defaultValues: { title:'', description:'', category:'', incidentTime:'', address:'', lat:'', lng:'' },
  })

  const lat = watch('lat'), lng = watch('lng'), selectedCat = watch('category')

  const detectLocation = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('lat', String(pos.coords.latitude))
        setValue('lng', String(pos.coords.longitude))
        setLocating(false)
      },
      () => { toast.error('Could not detect location.'); setLocating(false) },
      { enableHighAccuracy: true }
    )
  }

  const handleApplyAIDraft = (draft) => {
    setValue('description', draft, { shouldValidate: true })
    if (!watch('title')) setValue('title', 'AI Drafted FIR (Review Required)', { shouldValidate: true })
  }

  const onSubmit = (data) => {
    const fd = new FormData()
    Object.entries(data).forEach(([k, v]) => fd.append(k, v))
    evidenceFiles.forEach((f) => fd.append('evidenceFiles', f))
    submitMutation.mutate(fd, { onSuccess: () => navigate('/citizen/my-firs') })
  }

  const inputCls = (hasErr) =>
    `h-10 text-sm border ${hasErr ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : 'border-slate-200 focus:border-teal-400 focus:ring-teal-100'}`

  return (
    <div className="w-full min-h-screen bg-slate-50">

      {/* ── HEADER ───────────────────────────────────── */}
      <div className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #5eead4, transparent 70%)' }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #f8fafc)' }} />

        <div className="relative z-10 px-5 sm:px-8 pt-7 pb-14">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-white/55 hover:text-white text-xs mb-4 transition-colors">
            <ChevronLeft size={14} />Back
          </button>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-1.5">FIR Filing</p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">File New FIR</h1>
              <p className="text-white/55 text-sm mt-1 max-w-sm">
                Submit a complaint with incident details, location, and evidence.
              </p>
            </div>
            <Button onClick={() => setAiModalOpen(true)}
              className="shrink-0 bg-white/15 hover:bg-white/25 text-white border border-white/25 h-9 px-4 text-sm font-semibold backdrop-blur-sm">
              <Sparkles size={13} className="mr-1.5 text-teal-300" />AI Assist
            </Button>
          </div>
        </div>
      </div>

      {/* ── FORM BODY ─────────────────────────────────── */}
      <div className="px-5 sm:px-8 -mt-8 pb-12 relative z-10">

        <Alert className="mb-4 rounded-xl border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <AlertDescription className="text-xs text-amber-800">
            Filing a false FIR is a punishable offense under <strong>IPC Section 182</strong>. Provide accurate information.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* 3-col on xl, 2-col on lg, 1-col on sm/md */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">

            {/* COL A — Incident details (spans 2 on xl) */}
            <div className="xl:col-span-2 space-y-5">

              {/* Incident card */}
              <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
                <CardHeader className="px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 bg-teal-50 rounded-md flex items-center justify-center">
                      <FileText size={13} className="text-teal-600" />
                    </div>
                    Incident Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-4">
                  <Field label="Title / Subject" error={errors.title?.message}>
                    <Input placeholder="e.g. Mobile phone stolen near railway station"
                      {...register('title')} className={inputCls(!!errors.title)} />
                  </Field>
                  <Field label="Incident Date & Time" error={errors.incidentTime?.message}>
                    <Input type="datetime-local" {...register('incidentTime')}
                      className={inputCls(!!errors.incidentTime)} />
                  </Field>
                  <Field label="Detailed Description" error={errors.description?.message}>
                    <div className="relative">
                      <Textarea
                        placeholder="Describe what happened in detail — when, where, who was involved, identifying details..."
                        {...register('description')}
                        rows={8}
                        className={`text-sm resize-none border ${errors.description ? 'border-red-300' : 'border-slate-200 focus:border-teal-400'} pb-10`}
                      />
                      {/* inline AI button inside textarea */}
                      <button type="button" onClick={() => setAiModalOpen(true)}
                        className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 text-[11px] font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors">
                        <Sparkles size={11} />Use AI
                      </button>
                    </div>
                  </Field>
                </CardContent>
              </Card>

              {/* Category card */}
              <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
                <CardHeader className="px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-slate-800">Incident Category</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const active = selectedCat === cat.value
                      return (
                        <button key={cat.value} type="button"
                          onClick={() => setValue('category', cat.value, { shouldValidate: true })}
                          className={`rounded-xl border p-3 text-left transition-all duration-150 min-w-0
                            ${active
                              ? 'border-teal-400 bg-teal-50 ring-2 ring-teal-100'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'}`}>
                          <span className="text-base block mb-1">{cat.icon}</span>
                          <span className={`text-xs font-semibold block truncate ${active ? 'text-teal-700' : 'text-slate-800'}`}>
                            {cat.label}
                          </span>
                          <span className="text-[10px] text-slate-400 leading-snug mt-0.5 block line-clamp-2">{cat.desc}</span>
                        </button>
                      )
                    })}
                  </div>
                  {errors.category && (
                    <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
                      <AlertTriangle size={11} />{errors.category.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* COL B — Location + Evidence + Submit */}
            <div className="space-y-5">

              {/* Location card */}
              <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
                <CardHeader className="px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-50 rounded-md flex items-center justify-center">
                      <MapPin size={13} className="text-blue-600" />
                    </div>
                    Incident Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3.5">
                  <Field label="Full Address" error={errors.address?.message}>
                    <Input placeholder="Street, area, city, state"
                      {...register('address')} className={inputCls(!!errors.address)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Latitude" error={errors.lat?.message}>
                      <Input placeholder="18.5204" {...register('lat')} className={inputCls(!!errors.lat)} />
                    </Field>
                    <Field label="Longitude" error={errors.lng?.message}>
                      <Input placeholder="73.8567" {...register('lng')} className={inputCls(!!errors.lng)} />
                    </Field>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={detectLocation}
                    disabled={locating}
                    className="w-full h-9 text-xs border-slate-200 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50">
                    <MapPin size={12} className="mr-1.5" />
                    {locating ? 'Detecting…' : 'Use My Current Location'}
                  </Button>
                  {lat && lng && (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium px-3 py-2 rounded-lg">
                      <MapPin size={11} className="shrink-0" />
                      {Number(lat).toFixed(4)}, {Number(lng).toFixed(4)}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Evidence card */}
              <Card className="rounded-xl border-slate-100 shadow-sm bg-white">
                <CardHeader className="px-5 py-4">
                  <CardTitle className="text-sm font-semibold text-slate-800">Evidence</CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">
                    Photos, videos, documents (optional · max 5)
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <FileUpload files={evidenceFiles} onChange={setEvidenceFiles} maxFiles={5}
                    label="Upload evidence files" />
                </CardContent>
              </Card>

              {/* Submit */}
              <div className="space-y-2.5">
                <Button type="submit" disabled={submitMutation.isPending}
                  className="w-full h-10 text-sm font-semibold bg-teal-600 hover:bg-teal-700 shadow-sm">
                  {submitMutation.isPending
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                    : <><Send className="mr-2 h-4 w-4" />Submit FIR</>}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}
                  className="w-full h-9 text-sm text-slate-500 border-slate-200">
                  Cancel
                </Button>
              </div>

            </div>
          </div>
        </form>
      </div>

      <AIDrafterModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} onApply={handleApplyAIDraft} />
    </div>
  )
}