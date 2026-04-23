// src/features/onboarding/pages/CitizenOnboarding.jsx
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
import { User, MapPin, CreditCard, Phone, Loader2, ArrowRight, ArrowLeft, Scale } from 'lucide-react'

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

    // Get location if available
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
              <Scale className="h-5 w-5 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl">Complete Your Profile</CardTitle>
          <CardDescription>Step {step + 1} of {steps.length} — {steps[step].label}</CardDescription>
          <Progress value={progress} className="mt-3 h-1.5" />
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Step 1: Personal */}
            {step === 0 && (
              <>
                <div className="space-y-1.5">
                  <Label>Gender</Label>
                  <Select onValueChange={(v) => setValue('gender', v)} value={watch('gender')}>
                    <SelectTrigger className={errors.gender ? 'border-red-300' : ''}>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="onb-dob">Date of Birth</Label>
                  <Input id="onb-dob" type="date" {...register('dob')} className={errors.dob ? 'border-red-300' : ''} />
                  {errors.dob && <p className="text-xs text-red-500">{errors.dob.message}</p>}
                </div>
              </>
            )}

            {/* Step 2: Address */}
            {step === 1 && (
              <>
                <div className="space-y-1.5">
                  <Label>Address Line 1</Label>
                  <Input placeholder="House no, street" {...register('line1')} className={errors.line1 ? 'border-red-300' : ''} />
                  {errors.line1 && <p className="text-xs text-red-500">{errors.line1.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Address Line 2</Label>
                  <Input placeholder="Landmark (optional)" {...register('line2')} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>City</Label>
                    <Input placeholder="City" {...register('city')} className={errors.city ? 'border-red-300' : ''} />
                    {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>District</Label>
                    <Input placeholder="District" {...register('district')} className={errors.district ? 'border-red-300' : ''} />
                    {errors.district && <p className="text-xs text-red-500">{errors.district.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>State</Label>
                    <Input placeholder="State" {...register('state')} className={errors.state ? 'border-red-300' : ''} />
                    {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Pincode</Label>
                    <Input placeholder="6-digit pincode" {...register('pincode')} className={errors.pincode ? 'border-red-300' : ''} />
                    {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Aadhaar */}
            {step === 2 && (
              <>
                <div className="space-y-1.5">
                  <Label>Aadhaar Number</Label>
                  <Input placeholder="12-digit Aadhaar" {...register('aadharNumber')} className={errors.aadharNumber ? 'border-red-300' : ''} />
                  {errors.aadharNumber && <p className="text-xs text-red-500">{errors.aadharNumber.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Aadhaar Document</Label>
                  <FileUpload
                    files={aadharFiles}
                    onChange={setAadharFiles}
                    maxFiles={1}
                    accept="image/*,application/pdf"
                    label="Upload Aadhaar card (image or PDF)"
                  />
                  {aadharFiles.length === 0 && (
                    <p className="text-xs text-amber-600">Please upload your Aadhaar card</p>
                  )}
                </div>
              </>
            )}

            {/* Step 4: Emergency Contact */}
            {step === 3 && (
              <>
                <div className="space-y-1.5">
                  <Label>Contact Name</Label>
                  <Input placeholder="Emergency contact name" {...register('emergencyContactName')} className={errors.emergencyContactName ? 'border-red-300' : ''} />
                  {errors.emergencyContactName && <p className="text-xs text-red-500">{errors.emergencyContactName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Phone</Label>
                  <Input placeholder="+919876543210" {...register('emergencyContactPhone')} className={errors.emergencyContactPhone ? 'border-red-300' : ''} />
                  {errors.emergencyContactPhone && <p className="text-xs text-red-500">{errors.emergencyContactPhone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Relation</Label>
                  <Input placeholder="e.g. Father, Mother, Spouse" {...register('emergencyContactRelation')} className={errors.emergencyContactRelation ? 'border-red-300' : ''} />
                  {errors.emergencyContactRelation && <p className="text-xs text-red-500">{errors.emergencyContactRelation.message}</p>}
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
                <ArrowLeft className="mr-1 h-4 w-4" /> Back
              </Button>

              {step < steps.length - 1 ? (
                <Button type="button" onClick={handleNext}>
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                  ) : (
                    'Complete Profile'
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
