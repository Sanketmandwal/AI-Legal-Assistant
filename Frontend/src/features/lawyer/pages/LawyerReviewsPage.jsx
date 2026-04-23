// src/features/lawyer/pages/LawyerReviewsPage.jsx
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import axiosClient from '@/api/axiosClient'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import StarRating from '@/components/shared/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { Star, User } from 'lucide-react'

function formatDate(d) { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) }

export default function LawyerReviewsPage() {
  const { user } = useSelector((s) => s.auth)
  const { data, isLoading } = useQuery({
    queryKey: ['lawyerReviews', user?._id],
    queryFn: async () => { const { data } = await axiosClient.get(`/lawyer/${user._id}/reviews`); return data },
    enabled: !!user?._id,
  })
  const reviews = data?.reviews || []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-7 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">My Reviews</h1>
          <p className="text-amber-100 text-sm mt-1">Feedback from your consultation clients</p>
          {data?.averageRating && <div className="flex items-center gap-2 mt-3"><StarRating value={data.averageRating} readonly size="md" /><span className="text-xl font-bold">{data.averageRating.toFixed(1)}</span><span className="text-amber-200">({reviews.length} reviews)</span></div>}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Reviews will appear here when clients provide feedback after consultations." />
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r._id} className=" hover:border-primary/30 transition-all">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">{r.citizenId?.name?.[0] || <User className="h-4 w-4" />}</div>
                    <div><div className="font-semibold text-slate-900 text-sm">{r.citizenId?.name || 'Anonymous'}</div><div className="text-xs text-slate-400">{formatDate(r.createdAt)}</div></div>
                  </div>
                  <StarRating value={r.rating} readonly size="sm" />
                </div>
                {r.reviewText && <p className="text-sm text-slate-600 mt-3 pl-13 leading-relaxed">"{r.reviewText}"</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
