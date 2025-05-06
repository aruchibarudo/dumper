import { Project } from '@/app/projects/[id]/types'
import { useModal } from '@/components/ui/modal/hooks'
import { useSnackbar } from '@/components/ui/snackbar/hooks'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/app/utils/api'
import { handleActiveTabAfterDelete } from '@/app/projects/[id]/utils'
import { UseDeletePcapProps } from '@/app/projects/[id]/hooks/types'

export const useDeletePcap = ({
  projectId,
  activeTabId,
  setProject,
}: UseDeletePcapProps) => {
  const { closeModal } = useModal()
  const { addSnackbar } = useSnackbar()
  const queryClient = useQueryClient()

  const { mutate: deletePcap } = useMutation({
    mutationFn: (pcapId: string) => ApiService.delete(`/pcap/${pcapId}`),
    onSuccess: async (_, pcapId) => {
      await queryClient.invalidateQueries({
        queryKey: ['project', projectId, 'summary'],
      })

      const updatedProject = queryClient.getQueryData<Project>([
        'project',
        projectId,
        'summary',
      ])
      if (!updatedProject) return

      addSnackbar({ message: 'Файл успешно удалён', status: 'success' })
      closeModal()

      if (activeTabId === pcapId) {
        handleActiveTabAfterDelete(updatedProject, setProject)
      }
    },
    onError: (error) => {
      console.error('Ошибка при удалении PCAP:', error)
      addSnackbar({ message: 'Не удалось удалить файл', status: 'alert' })
      closeModal()
    },
  })

  const handleDeletePcap = (pcapId: string) => {
    deletePcap(pcapId)
  }

  return { handleDeletePcap }
}
