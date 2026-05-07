// src/features/chat/api/chatApi.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'

export function useMyChatRooms(options = {}) {
  return useQuery({ queryKey: ['chatRooms'], queryFn: async () => { const { data } = await axiosClient.get('/chat/my-rooms'); return data }, refetchInterval: 15000, ...options })
}
export function useChatRoomDetails(roomId) {
  return useQuery({ queryKey: ['chatRoom', roomId], queryFn: async () => { const { data } = await axiosClient.get(`/chat/rooms/${roomId}`); return data }, enabled: !!roomId })
}
export function useChatMessages(roomId) {
  return useQuery({ queryKey: ['chatMessages', roomId], queryFn: async () => { const { data } = await axiosClient.get(`/chat/rooms/${roomId}/messages`); return data }, enabled: !!roomId, refetchInterval: 5000 })
}
export function useSendMessage(roomId) {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (formData) => axiosClient.post(`/chat/rooms/${roomId}/messages`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }), onSuccess: () => { qc.invalidateQueries({ queryKey: ['chatMessages', roomId] }); qc.invalidateQueries({ queryKey: ['chatRooms'] }) } })
}
export function useMarkRead(roomId) {
  return useMutation({ mutationFn: () => axiosClient.patch(`/chat/rooms/${roomId}/read`) })
}
