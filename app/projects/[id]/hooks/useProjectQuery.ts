import { useQuery } from '@tanstack/react-query'
import { ApiService } from '@/app/utils/api'
import { Project } from '@/app/projects/[id]/types'

export const useProjectQuery = (id: string) =>
  useQuery({
    queryKey: ['project', id, 'summary'],
    queryFn: () => ApiService.get<Project>(`/project/${id}/summary`),
  })
