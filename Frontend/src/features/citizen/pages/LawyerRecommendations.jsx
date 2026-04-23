// src/features/citizen/pages/LawyerRecommendations.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useRecommendedLawyers } from '../api/lawyerApi'
import { useRequestConsultation } from '../api/consultationApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import StatusBadge from '@/components/shared/StatusBadge'
import StarRating from '@/components/shared/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { ArrowLeft, MapPin, Briefcase, IndianRupee, Languages, Users, Loader2, Send } from 'lucide-react'

export default function LawyerRecommendations() {
  const { id: firId } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useRecommendedLawyers(firId)
  const requestMutation = useRequestConsultation()

  const lawyers = data?.lawyers || []
  const firInfo = data?.fir

  const handleRequest = (lawyer) => {
    requestMutation.mutate({ firId, lawyerProfileId: lawyer._id, initialMessage: `I need legal assistance with my ${firInfo?.category || 'case'}.` })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 text-slate-500"><ArrowLeft className="mr-1.5 h-4 w-4" /> Back to FIR</Button>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Recommended Lawyers</h1>
          <p className="text-emerald-100 text-sm mt-1">AI-matched by specialization, distance, and rating for your case</p>
          {firInfo && <Badge className="bg-white/20 text-white border-0 mt-3 capitalize">{firInfo.category} — {firInfo.title}</Badge>}
          {data?.matchedSpecializations && <p className="text-xs text-emerald-200 mt-2">Matched: {data.matchedSpecializations.join(', ')}</p>}
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
      ) : lawyers.length === 0 ? (
        <EmptyState icon={Users} title="No lawyers found" description="No verified lawyers are available near your location for this case type right now." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {lawyers.map((lawyer) => (
            <Card key={lawyer._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <CardContent className="p-0">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{lawyer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={lawyer.ratingAverage || 0} readonly size="sm" />
                        <span className="text-xs text-slate-500">({lawyer.ratingCount || 0})</span>
                      </div>
                    </div>
                    <StatusBadge status={lawyer.consultationStatus} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600"><Briefcase className="h-3.5 w-3.5 text-blue-500 shrink-0" /><span className="truncate">{(lawyer.specialization || []).join(', ')}</span></div>
                    <div className="flex items-center gap-2 text-slate-600"><MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />{lawyer.city}, {lawyer.state} • <span className="font-medium text-emerald-700">{lawyer.distanceKm} km away</span></div>
                    <div className="flex items-center gap-2 text-slate-600"><IndianRupee className="h-3.5 w-3.5 text-amber-500 shrink-0" /><span className="font-semibold text-slate-900">₹{lawyer.feePerConsultation}</span> / consultation</div>
                    {lawyer.experienceYears && <div className="flex items-center gap-2 text-slate-600"><Briefcase className="h-3.5 w-3.5 text-purple-500 shrink-0" />{lawyer.experienceYears} years experience</div>}
                    {lawyer.languages?.length > 0 && <div className="flex items-center gap-2 text-slate-600"><Languages className="h-3.5 w-3.5 text-teal-500 shrink-0" />{(lawyer.languages || []).join(', ')}</div>}
                  </div>

                  {lawyer.bio && <p className="text-xs text-slate-500 mt-3 line-clamp-2 italic">"{lawyer.bio}"</p>}
                </div>

                <div className="border-t border-slate-100 px-5 py-3 bg-slate-50">
                  {lawyer.consultationStatus === 'not_requested' ? (
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 shadow-md" size="sm" onClick={() => handleRequest(lawyer)} disabled={requestMutation.isPending}>
                      {requestMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />} Request Consultation
                    </Button>
                  ) : (
                    <p className="text-center text-xs text-slate-500">Consultation {lawyer.consultationStatus}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
