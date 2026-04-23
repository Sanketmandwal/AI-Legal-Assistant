// src/features/citizen/pages/ConsultationsPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCitizenConsultations, useCompleteConsultation, useSubmitReview } from '../api/consultationApi'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import StatusBadge from '@/components/shared/StatusBadge'
import StarRating from '@/components/shared/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { Users, MessageSquare, CheckCircle, Loader2, Star, FileText } from 'lucide-react'

function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }

export default function ConsultationsPage() {
  const [tab, setTab] = useState('all')
  const { data, isLoading } = useCitizenConsultations(tab)
  const completeMutation = useCompleteConsultation()
  const reviewMutation = useSubmitReview()
  const [reviewDialog, setReviewDialog] = useState(null)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')

  const consultations = data?.consultations || []

  const handleReview = () => {
    if (!rating) return
    reviewMutation.mutate({ id: reviewDialog._id, rating, reviewText }, { onSuccess: () => { setReviewDialog(null); setRating(0); setReviewText('') } })
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-violet-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10"><h1 className="text-2xl font-bold">My Consultations</h1><p className="text-purple-100 text-sm mt-1">Track your lawyer consultation requests and active cases</p></div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-5 w-full max-w-xl">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Active</TabsTrigger>
          <TabsTrigger value="completed">Done</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
      ) : consultations.length === 0 ? (
        <EmptyState icon={Users} title={`No ${tab === 'all' ? '' : tab} consultations`} description="Your consultation requests will appear here." />
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => (
            <Card key={c._id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-slate-900">{c.lawyer?.name || 'Lawyer'}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    {c.fir && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                        <FileText className="h-3 w-3" />
                        <span className="truncate">{c.fir.incident?.title}</span>
                        <Badge variant="outline" className="text-[10px] capitalize px-1.5 py-0">{c.fir.incident?.category}</Badge>
                      </div>
                    )}
                    <div className="text-xs text-slate-400">
                      Requested: {formatDate(c.createdAt)}
                      {c.respondedAt && <span> • Responded: {formatDate(c.respondedAt)}</span>}
                    </div>
                    {c.lawyer?.email && <p className="text-xs text-slate-500 mt-1">📧 {c.lawyer.email}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {c.status === 'accepted' && c.chatRoom && (
                      <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-indigo-600"><Link to={`/citizen/chat/${c.chatRoom._id}`}><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat</Link></Button>
                    )}
                    {c.status === 'accepted' && (
                      <Button size="sm" variant="outline" onClick={() => completeMutation.mutate(c._id)} disabled={completeMutation.isPending}>
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Complete
                      </Button>
                    )}
                    {c.status === 'completed' && (
                      <Button size="sm" variant="outline" onClick={() => setReviewDialog(c)}><Star className="mr-1.5 h-3.5 w-3.5" /> Review</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!reviewDialog} onOpenChange={(open) => !open && setReviewDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Rate Your Consultation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-center"><StarRating value={rating} onChange={setRating} size="lg" /><p className="text-xs text-slate-500 mt-2">{rating > 0 ? `${rating}/5 stars` : 'Tap to rate'}</p></div>
            <Textarea placeholder="Share your experience (optional)" value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(null)}>Cancel</Button>
            <Button onClick={handleReview} disabled={!rating || reviewMutation.isPending}>
              {reviewMutation.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null} Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
