// src/features/police/api/policeDashApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'
import toast from 'react-hot-toast'

export function usePoliceFIRs(status) {
  return useQuery({ queryKey: ['policeFIRs', status], queryFn: async () => { const params = status ? { status } : {}; const { data } = await axiosClient.get('/fir/police/all', { params }); return data } })
}
export function usePoliceProfile() {
  return useQuery({ queryKey: ['policeProfile'], queryFn: async () => { const { data } = await axiosClient.get('/police/profile'); return data } })
}
export function useUpdateFIRStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, message }) => axiosClient.patch(`/fir/police/${id}/status`, { status, message }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['policeFIRs'] }); toast.success('FIR status updated!') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
  })
}
