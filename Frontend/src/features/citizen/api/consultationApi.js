// src/features/citizen/api/consultationApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'
import toast from 'react-hot-toast'

export function useCitizenConsultations(status = 'all', page = 1) {
  return useQuery({
    queryKey: ['citizenConsultations', status, page],
    queryFn: async () => { const { data } = await axiosClient.get('/citizen/consultations', { params: { status, page } }); return data },
  })
}

export function useRequestConsultation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => axiosClient.post('/lawyer/consultations/request', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citizenConsultations'] }); qc.invalidateQueries({ queryKey: ['lawyerRecommendations'] }); toast.success('Consultation request sent!') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to send request'),
  })
}

export function useCompleteConsultation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => axiosClient.patch(`/lawyer/consultations/${id}/complete`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citizenConsultations'] }); toast.success('Consultation marked as completed!') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to complete consultation'),
  })
}

export function useSubmitReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, rating, reviewText }) => axiosClient.post(`/lawyer/consultations/${id}/review`, { rating, reviewText }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['citizenConsultations'] }); toast.success('Review submitted!') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit review'),
  })
}
