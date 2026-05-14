import { useParams, useNavigate } from 'react-router-dom'
import { useRecommendedLawyers } from '../api/lawyerApi'
import { useRequestConsultation } from '../api/consultationApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import StarRating from '@/components/shared/StarRating'
import { ArrowLeft, MapPin, Briefcase, IndianRupee, Languages, Users, Loader2, Send, ShieldCheck } from 'lucide-react'

export default function LawyerRecommendations() {
  const { id: firId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useRecommendedLawyers(firId)
  const requestMutation = useRequestConsultation()

  const lawyers = data?.lawyers || []
  const firInfo = data?.fir

  const handleRequest = (lawyer) => {
    requestMutation.mutate({
      firId,
      lawyerProfileId: lawyer._id,
      initialMessage: `I need legal assistance with my ${firInfo?.category || 'case'}.`,
    })
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="px-5 sm:px-8 pt-5">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 text-slate-500 hover:text-slate-900 h-8">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to FIR
        </Button>
      </div>

      <div className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #5eead4, transparent 70%)' }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #f8fafc)' }} />

        <div className="relative z-10 px-5 sm:px-8 pt-6 pb-16">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-widest">
              <ShieldCheck size={13} /> Lawyer Match
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Recommended Lawyers</h1>
            <p className="text-white/60 text-sm max-w-2xl">
              AI-matched by specialization, distance, availability, and rating for your FIR.
            </p>
            {firInfo && (
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge className="bg-white/20 text-white border-0 capitalize text-xs">{firInfo.category}</Badge>
                <Badge className="bg-white/15 text-white border-0 text-xs max-w-full truncate">{firInfo.title}</Badge>
              </div>
            )}
            {data?.matchedSpecializations?.length > 0 && (
              <p className="text-xs text-teal-100">
                Matched specializations: {data.matchedSpecializations.join(', ')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-8 -mt-8 pb-12 relative z-10">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 gap-4">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-60 rounded-xl" />)}</div>
        ) : lawyers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <Users size={22} className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">No lawyers found</p>
              <p className="text-xs text-slate-400 mt-1">No verified lawyers are available near your location for this case type right now.</p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {lawyers.map((lawyer) => (
              <Card key={lawyer._id} className="rounded-xl border-slate-100 shadow-sm bg-white overflow-hidden hover:shadow-md transition-all duration-200">
                <CardContent className="p-0">
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{lawyer.name}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <StarRating value={lawyer.ratingAverage || 0} readonly size="sm" />
                          <span className="text-xs text-slate-500">({lawyer.ratingCount || 0})</span>
                        </div>
                      </div>
                      <StatusBadge status={lawyer.consultationStatus} />
                    </div>

                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-start gap-2 text-slate-600">
                        <Briefcase className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                        <span className="break-words">{(lawyer.specialization || []).join(', ')}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span>{lawyer.city}, {lawyer.state} • <span className="font-semibold text-emerald-700">{lawyer.distanceKm} km away</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <IndianRupee className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-slate-900">₹{lawyer.feePerConsultation}</span>
                        <span className="text-slate-400">/ consultation</span>
                      </div>
                      {lawyer.experienceYears && (
                        <div className="flex items-center gap-2 text-slate-600">
                          <Briefcase className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                          {lawyer.experienceYears} years experience
                        </div>
                      )}
                      {lawyer.languages?.length > 0 && (
                        <div className="flex items-start gap-2 text-slate-600">
                          <Languages className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                          <span>{lawyer.languages.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {lawyer.bio && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 italic border-t border-slate-100 pt-3">
                        “{lawyer.bio}”
                      </p>
                    )}
                  </div>

                  <div className="border-t border-slate-100 px-5 py-3 bg-slate-50">
                    {lawyer.consultationStatus === 'not_requested' ? (
                      <Button className="w-full h-9 text-sm bg-teal-600 hover:bg-teal-700" size="sm" onClick={() => handleRequest(lawyer)} disabled={requestMutation.isPending}>
                        {requestMutation.isPending
                          ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          : <Send className="mr-1.5 h-3.5 w-3.5" />}
                        Request Consultation
                      </Button>
                    ) : (
                      <p className="text-center text-xs text-slate-500 capitalize py-1">Consultation {lawyer.consultationStatus}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}