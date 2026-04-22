// src/features/lawyer/api/lawyerDashApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'
import toast from 'react-hot-toast'

export function useIncomingRequests(status = 'pending', page = 1) {
  return useQuery({ queryKey: ['incomingRequests', status, page], queryFn: async () => { const { data } = await axiosClient.get('/lawyer/consultations/incoming', { params: { status, page } }); return data } })
}
export function useLawyerHistory(status = 'all', page = 1) {
  return useQuery({ queryKey: ['lawyerHistory', status, page], queryFn: async () => { const { data } = await axiosClient.get('/lawyer/consultations/history', { params: { status, page } }); return data } })
}
export function useLawyerProfile() {
  return useQuery({ queryKey: ['lawyerProfile'], queryFn: async () => { const { data } = await axiosClient.get('/lawyer/profile'); return data } })
}
export function useRespondToRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, action, responseMessage }) => axiosClient.patch(`/lawyer/consultations/${id}/respond`, { action, responseMessage }),
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ['incomingRequests'] }); qc.invalidateQueries({ queryKey: ['lawyerHistory'] }); toast.success(vars.action === 'accepted' ? 'Request accepted! Chat room created.' : 'Request declined.') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to respond'),
  })
}
