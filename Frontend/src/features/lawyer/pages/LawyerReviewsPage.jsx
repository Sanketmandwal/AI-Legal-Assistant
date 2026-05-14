import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import axiosClient from '@/api/axiosClient'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import StarRating from '@/components/shared/StarRating'
import EmptyState from '@/components/common/EmptyState'
import { Star, User, Quote } from 'lucide-react'

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function LawyerReviewsPage() {
  const { user } = useSelector((s) => s.auth)
  const { data, isLoading } = useQuery({
    queryKey: ['lawyerReviews', user?._id],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/lawyer/${user._id}/reviews`)
      return data
    },
    enabled: !!user?._id,
  })
  const reviews = data?.reviews || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#111827_0%,#1f2937_30%,#0f766e_100%)] p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.15)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
            <Star className="h-3.5 w-3.5" /> Client feedback
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white">My Reviews</h1>
          <p className="text-sm text-white/75 mt-1">Feedback shared by clients after their consultations.</p>
          {data?.averageRating && (
            <div className="flex flex-wrap items-center gap-3 mt-4">
              <div className="rounded-2xl bg-white/10 px-4 py-2 backdrop-blur-sm">
                <StarRating value={data.averageRating} readonly size="md" />
              </div>
              <span className="text-2xl font-bold text-white">{data.averageRating.toFixed(1)}</span>
              <span className="text-sm text-white/70">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-32 rounded-[28px]" />)}</div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Reviews will appear here when clients provide feedback after consultations." />
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r._id} className="rounded-[28px] border-slate-200 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-11 w-11 rounded-full bg-teal-50 ring-1 ring-teal-100 flex items-center justify-center text-teal-700 text-sm font-bold shrink-0">
                      {r.citizenId?.name?.[0] || <User className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-sm truncate">{r.citizenId?.name || 'Anonymous'}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatDate(r.createdAt)}</div>
                    </div>
                  </div>
                  <div className="shrink-0"><StarRating value={r.rating} readonly size="sm" /></div>
                </div>
                {r.reviewText && (
                  <div className="mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 border border-slate-200">
                        <Quote className="h-4 w-4" />
                      </div>
                      <p className="text-sm text-slate-600 leading-7">{r.reviewText}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}