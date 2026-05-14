import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCitizenConsultations, useCompleteConsultation, useSubmitReview } from '../api/consultationApi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import StatusBadge from '@/components/shared/StatusBadge'
import StarRating from '@/components/shared/StarRating'
import {
  Users, MessageSquare, CheckCircle, Loader2,
  Star, FileText, Calendar, Mail, User,
} from 'lucide-react'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ─── Single Consultation Card ───────────────────────── */
function ConsultationCard({ c, onComplete, onReview, completing }) {
  const isPending   = c.status === 'pending'
  const isAccepted  = c.status === 'accepted'
  const isCompleted = c.status === 'completed'
  const isDeclined  = c.status === 'declined'

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-shadow duration-150">

      {/* Top row: lawyer name + status */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <User size={18} className="text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{c.lawyer?.name || 'Lawyer'}</p>
            {c.lawyer?.email && (
              <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                <Mail size={10} className="shrink-0" />{c.lawyer.email}
              </p>
            )}
          </div>
        </div>
        <StatusBadge status={c.status} />
      </div>

      {/* FIR reference */}
      {c.fir && (
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 min-w-0">
          <FileText size={13} className="text-slate-400 shrink-0" />
          <span className="text-xs text-slate-600 font-medium truncate">{c.fir.incident?.title}</span>
          <Badge variant="outline" className="shrink-0 text-[10px] h-4 px-1.5 capitalize border-slate-200 text-slate-500">
            {c.fir.incident?.category}
          </Badge>
        </div>
      )}

      {/* Date info */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <Calendar size={11} className="shrink-0" />
          Requested: <span className="font-medium text-slate-600">{formatDate(c.createdAt)}</span>
        </span>
        {c.respondedAt && (
          <span className="flex items-center gap-1.5">
            <CheckCircle size={11} className="shrink-0" />
            Responded: <span className="font-medium text-slate-600">{formatDate(c.respondedAt)}</span>
          </span>
        )}
      </div>

      {/* Actions */}
      {(isAccepted || isCompleted) && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-50">
          {isAccepted && c.chatRoom && (
            <Button size="sm" asChild
              className="h-8 text-xs bg-teal-600 hover:bg-teal-700">
              <Link to={`/citizen/chat/${c.chatRoom._id}`} className="inline-flex items-center gap-1.5">
                <MessageSquare size={13} />Chat
              </Link>
            </Button>
          )}
          {isAccepted && (
            <Button size="sm" variant="outline" onClick={() => onComplete(c._id)}
              disabled={completing}
              className="h-8 text-xs border-slate-200 hover:border-green-300 hover:text-green-700 hover:bg-green-50">
              <CheckCircle size={13} className="mr-1.5" />Mark Complete
            </Button>
          )}
          {isCompleted && (
            <Button size="sm" variant="outline" onClick={() => onReview(c)}
              className="h-8 text-xs border-slate-200 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50">
              <Star size={13} className="mr-1.5" />Leave Review
            </Button>
          )}
        </div>
      )}

      {/* Declined note */}
      {isDeclined && (
        <div className="text-xs text-red-400 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
          This consultation request was declined by the lawyer.
        </div>
      )}
    </div>
  )
}

/* ─── Tab counts label ────────────────────────────────── */
const TAB_LABELS = [
  { value: 'all',       label: 'All'      },
  { value: 'pending',   label: 'Pending'  },
  { value: 'accepted',  label: 'Active'   },
  { value: 'completed', label: 'Done'     },
  { value: 'declined',  label: 'Declined' },
]

/* ─── Main Page ───────────────────────────────────────── */
export default function ConsultationsPage() {
  const [tab,        setTab]        = useState('all')
  const [reviewDialog, setReviewDialog] = useState(null)
  const [rating,     setRating]     = useState(0)
  const [reviewText, setReviewText] = useState('')

  const { data, isLoading }    = useCitizenConsultations(tab)
  const completeMutation       = useCompleteConsultation()
  const reviewMutation         = useSubmitReview()
  const consultations          = data?.consultations || []

  const handleReview = () => {
    if (!rating) return
    reviewMutation.mutate(
      { id: reviewDialog._id, rating, reviewText },
      { onSuccess: () => { setReviewDialog(null); setRating(0); setReviewText('') } }
    )
  }

  return (
    <div className="w-full min-h-screen bg-slate-50">

      {/* ── HEADER ──────────────────────────────────── */}
      <div className="w-full relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f766e 0%, #0e7490 55%, #1e3a5f 100%)' }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #5eead4, transparent 70%)' }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-10 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent, #f8fafc)' }} />

        <div className="relative z-10 px-5 sm:px-8 pt-8 pb-16">
          <p className="text-teal-300 text-xs font-semibold uppercase tracking-widest mb-2">Consultations</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1.5">My Consultations</h1>
          <p className="text-white/55 text-sm max-w-md">
            Track lawyer requests, active cases, completed consultations, and your reviews.
          </p>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────── */}
      <div className="px-5 sm:px-8 -mt-8 pb-12 relative z-10 space-y-5">

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-1.5">
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1 h-auto">
              {TAB_LABELS.map(({ value, label }) => (
                <TabsTrigger key={value} value={value}
                  className="rounded-lg text-xs font-semibold h-8 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-sm text-slate-500">
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
          </div>
        ) : consultations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm py-16 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
              <Users size={22} className="text-slate-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-600">
                No {tab === 'all' ? '' : tab} consultations
              </p>
              <p className="text-xs text-slate-400 mt-1">Your consultation requests will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map((c) => (
              <ConsultationCard
                key={c._id}
                c={c}
                onComplete={(id) => completeMutation.mutate(id)}
                onReview={setReviewDialog}
                completing={completeMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── REVIEW DIALOG ───────────────────────────── */}
      <Dialog open={!!reviewDialog} onOpenChange={(open) => !open && setReviewDialog(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-5"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0e7490)' }}>
            <DialogHeader>
              <DialogTitle className="text-white text-base font-bold flex items-center gap-2">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Star size={14} className="text-amber-300" />
                </div>
                Rate Your Consultation
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="px-6 py-6 bg-white space-y-5">
            <div className="flex flex-col items-center gap-2">
              <StarRating value={rating} onChange={setRating} size="lg" />
              <p className="text-xs text-slate-400">
                {rating > 0 ? `${rating} out of 5 stars` : 'Tap a star to rate'}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">Your Experience <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Textarea
                placeholder="Share your experience with this lawyer..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
                className="text-sm resize-none border-slate-200 focus:border-teal-400"
              />
            </div>
          </div>
          <DialogFooter className="px-6 pb-5 bg-white gap-2 flex-row justify-end">
            <Button variant="outline" size="sm" onClick={() => setReviewDialog(null)}
              className="h-9 px-4 text-sm">Cancel</Button>
            <Button size="sm" onClick={handleReview}
              disabled={!rating || reviewMutation.isPending}
              className="h-9 px-4 text-sm bg-teal-600 hover:bg-teal-700">
              {reviewMutation.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}