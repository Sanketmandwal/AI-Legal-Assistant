// src/features/citizen/api/firApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'
import toast from 'react-hot-toast'

export function useMyFIRs() {
  return useQuery({
    queryKey: ['myFIRs'],
    queryFn: async () => { const { data } = await axiosClient.get('/fir/my-firs'); return data },
  })
}

export function useFIRDetail(id) {
  return useQuery({
    queryKey: ['fir', id],
    queryFn: async () => { const { data } = await axiosClient.get(`/fir/${id}`); return data },
    enabled: !!id,
  })
}

export function useSubmitFIR() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData) => axiosClient.post('/fir/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['myFIRs'] }); toast.success('FIR submitted successfully!') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit FIR'),
  })
}

export function useAddEvidence(firId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (formData) => axiosClient.post(`/fir/${firId}/evidence`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['fir', firId] }); toast.success('Evidence added!') },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add evidence'),
  })
}
