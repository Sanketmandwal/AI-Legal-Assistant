// src/features/citizen/api/lawyerApi.js
import { useQuery } from '@tanstack/react-query'
import axiosClient from '@/api/axiosClient'

export function useRecommendedLawyers(firId) {
  return useQuery({
    queryKey: ['lawyerRecommendations', firId],
    queryFn: async () => { const { data } = await axiosClient.get(`/lawyer/recommendations/${firId}`); return data },
    enabled: !!firId,
  })
}
