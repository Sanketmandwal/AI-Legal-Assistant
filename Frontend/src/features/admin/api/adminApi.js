// src/features/admin/api/adminApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'
import toast from 'react-hot-toast'

export function usePendingVerifications() {
  return useQuery({ queryKey: ['pendingVerifications'], queryFn: async () => { const { data } = await axiosClient.get('/admin/pending-verifications'); return data } })
}
export function useApproveLawyer() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id) => axiosClient.patch(`/admin/lawyers/${id}/approve`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['pendingVerifications'] }); toast.success('Lawyer approved!') }, onError: (err) => toast.error(err.response?.data?.message || 'Failed') })
}
export function useRejectLawyer() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, reason }) => axiosClient.patch(`/admin/lawyers/${id}/reject`, { reason }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['pendingVerifications'] }); toast.success('Lawyer rejected') }, onError: (err) => toast.error(err.response?.data?.message || 'Failed') })
}
export function useApprovePolice() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id) => axiosClient.patch(`/admin/police/${id}/approve`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['pendingVerifications'] }); toast.success('Police approved!') }, onError: (err) => toast.error(err.response?.data?.message || 'Failed') })
}
export function useRejectPolice() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: ({ id, reason }) => axiosClient.patch(`/admin/police/${id}/reject`, { reason }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['pendingVerifications'] }); toast.success('Police rejected') }, onError: (err) => toast.error(err.response?.data?.message || 'Failed') })
}
export function useUserDocuments(userId) {
  return useQuery({ queryKey: ['userDocs', userId], queryFn: async () => { const { data } = await axiosClient.get(`/admin/users/${userId}/documents`); return data }, enabled: !!userId })
}
