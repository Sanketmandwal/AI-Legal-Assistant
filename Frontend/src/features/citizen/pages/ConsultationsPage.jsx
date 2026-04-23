// src/features/citizen/pages/ConsultationsPage.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCitizenConsultations, useCompleteConsultation, useSubmitReview } from '../api/consultationApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import StatusBadge from '@/components/shared/StatusBadge'
import StarRating from '@/components/shared/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { ListRow, PageHeader, PageStack } from '@/components/common/PageShell'
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
    <PageStack>
      <PageHeader eyebrow="Consultations" title="My Consultations" description="Track lawyer requests, active cases, completed consultations, and reviews." />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full max-w-xl grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Active</TabsTrigger>
          <TabsTrigger value="completed">Done</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
      ) : consultations.length === 0 ? (
        <EmptyState icon={Users} title={`No ${tab === 'all' ? '' : tab} consultations`} description="Your consultation requests will appear here." />
      ) : (
        <div className="space-y-3">
          {consultations.map((c) => (
            <ListRow key={c._id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-foreground">{c.lawyer?.name || 'Lawyer'}</h3>
                    <StatusBadge status={c.status} />
                  </div>
                  {c.fir && (
                    <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span className="truncate">{c.fir.incident?.title}</span>
                      <Badge variant="outline" className="px-1.5 py-0 text-[10px] capitalize">{c.fir.incident?.category}</Badge>
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Requested: {formatDate(c.createdAt)}
                    {c.respondedAt && <span> · Responded: {formatDate(c.respondedAt)}</span>}
                  </div>
                  {c.lawyer?.email && <p className="mt-1 text-xs text-muted-foreground">{c.lawyer.email}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.status === 'accepted' && c.chatRoom && (
                    <Button size="sm" asChild><Link to={`/citizen/chat/${c.chatRoom._id}`}><MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Chat</Link></Button>
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
            </ListRow>
          ))}
        </div>
      )}

      <Dialog open={!!reviewDialog} onOpenChange={(open) => !open && setReviewDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Rate Your Consultation</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="text-center"><StarRating value={rating} onChange={setRating} size="lg" /><p className="mt-2 text-xs text-muted-foreground">{rating > 0 ? `${rating}/5 stars` : 'Tap to rate'}</p></div>
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
    </PageStack>
  )
}
