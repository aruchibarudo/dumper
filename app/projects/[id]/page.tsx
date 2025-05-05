'use client'

import React, { use, useCallback, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Tabs } from '@consta/uikit/Tabs'
import { Button } from '@consta/uikit/Button'
import { Text } from '@consta/uikit/Text'
import { Informer } from '@consta/uikit/Informer'
import { IconTrash } from '@consta/icons/IconTrash'
import { Loader } from '@consta/uikit/Loader'
import { IconInfo } from '@consta/icons/IconInfo'

import { useModal } from '@/components/ui/modal/hooks'
import { useSnackbar } from '@/components/ui/snackbar/hooks'
import { TrafficData } from '@/app/projects/[id]/pcap/table/types'
import { ApiService } from '@/app/utils/api'
import { useProject } from '@/app/context/project/ProjectContext'
import { generateUniqueLabels } from '@/app/projects/[id]/utils'
import { PcapTab, Project, ProjectPageProps } from '@/app/projects/[id]/types'

const TrafficGraph = dynamic(
  () => import('@/app/projects/[id]/pcap/graph/TrafficGraph'),
  {
    ssr: false,
  },
)

const ProjectPage = ({ params }: ProjectPageProps) => {
  const { id } = use(params)
  const { project, setProject } = useProject()
  const { setModal, closeModal } = useModal()
  const { addSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const tabsRef = useRef<HTMLDivElement>(null)

  const { data: fetchedProject, isLoading } = useQuery<Project>({
    queryKey: ['project', id, 'summary'],
    queryFn: () => ApiService.get<Project>(`/project/${id}/summary`),
  })

  const deletePcapMutation = useMutation({
    mutationFn: (pcapId: string) => ApiService.delete(`/pcap/${pcapId}`),
    onSuccess: async (_, pcapId) => {
      await queryClient.invalidateQueries({
        queryKey: ['project', id, 'summary'],
      })
      const updatedProject = queryClient.getQueryData<Project>([
        'project',
        id,
        'summary',
      ])

      addSnackbar({ message: 'Файл успешно удалён', status: 'success' })
      closeModal()

      if (updatedProject && project?.activePcapTab?.id === pcapId) {
        const updatedPcaps = updatedProject.pcaps || []
        setProject({
          ...updatedProject,
          activePcapTab: updatedPcaps.length
            ? {
                id: updatedPcaps[0].id,
                label: updatedPcaps[0].filename,
                leftIcon: IconInfo,
                rightIcon: IconTrash,
              }
            : null,
        } as Project)
      }
    },
    onError: (error) => {
      console.error('Ошибка при удалении PCAP:', error)
      addSnackbar({ message: 'Не удалось удалить файл', status: 'alert' })
      closeModal()
    },
  })

  const pcapTabs = useMemo<PcapTab[]>(() => {
    if (!project?.pcaps) return []

    const labels = generateUniqueLabels(project.pcaps)

    return project.pcaps.map((pcap, index) => ({
      id: pcap.id,
      label: labels[index],
      leftIcon: IconInfo,
      rightIcon: IconTrash,
    }))
  }, [project?.pcaps])

  // синхронизация project и activePcapTab
  useEffect(() => {
    if (!fetchedProject) return

    // проверяем нужно ли обновить project
    const needsUpdate =
      !project ||
      project.id !== fetchedProject.id ||
      project.pcaps !== fetchedProject.pcaps ||
      (pcapTabs.length > 0 &&
        (!project.activePcapTab ||
          !pcapTabs.some((tab) => tab.id === project.activePcapTab?.id))) ||
      (pcapTabs.length === 0 && project.activePcapTab !== null)

    if (needsUpdate) {
      const newActivePcapTab = pcapTabs.length > 0 ? pcapTabs[0] : null
      setProject({
        ...fetchedProject,
        activePcapTab:
          project?.activePcapTab &&
          pcapTabs.some((tab) => tab.id === project.activePcapTab?.id)
            ? project.activePcapTab
            : newActivePcapTab,
      } as Project)
    }
  }, [fetchedProject, pcapTabs, project, setProject])

  const handleDeleteClick = useCallback(
    (tabId: string) => {
      setModal({
        title: 'Удалить PCAP',
        content: (
          <div className="flex flex-col gap-4">
            <Text>
              Вы уверены, что хотите удалить PCAP-файл &#34;
              {pcapTabs.find((tab) => tab.id === tabId)?.label}&#34;?
            </Text>
            <div className="flex gap-2">
              <Button
                label="Удалить"
                view="primary"
                onClick={() => deletePcapMutation.mutate(tabId)}
                loading={
                  deletePcapMutation.isPending &&
                  deletePcapMutation.variables === tabId
                }
              />
              <Button
                label="Отмена"
                view="secondary"
                onClick={() => closeModal()}
              />
            </div>
          </div>
        ),
        modalProps: { className: 'max-w-md' },
      })
    },
    [pcapTabs, setModal, deletePcapMutation, closeModal],
  )

  const handleInfoClick = useCallback(
    (tabId: string) => {
      const pcap = project?.pcaps.find((p) => p.id === tabId)
      if (!pcap) return

      const totalPkts =
        pcap.summary.find((s) => s.type === 'total_pkts')?.content[0] || 0

      setModal({
        title: 'Информация о PCAP',
        content: (
          <div className="flex flex-col gap-2">
            <Text>
              <strong>ID:</strong> {pcap.id}
            </Text>
            <Text>
              <strong>Имя файла:</strong> {pcap.filename}
            </Text>
            <Text>
              <strong>Время:</strong>{' '}
              {new Date(pcap.timestamp).toLocaleString()}
            </Text>
            <Text>
              <strong>Хост:</strong> {pcap.hostname}
            </Text>
            <Text>
              <strong>Описание:</strong> {pcap.description}
            </Text>
            <Text>
              <strong>Номер проекта:</strong> {pcap.project_number}
            </Text>
            <Text>
              <strong>Общее количество пакетов:</strong> {totalPkts}
            </Text>
            <div className="flex justify-end mt-4">
              <Button
                label="Закрыть"
                view="secondary"
                onClick={() => closeModal()}
              />
            </div>
          </div>
        ),
        modalProps: { className: 'max-w-md' },
      })
    },
    [project?.pcaps, setModal, closeModal],
  )

  useEffect(() => {
    const tabsContainer = tabsRef.current
    if (!tabsContainer) return

    const handleIconClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const iconElement = target.closest('.icons--Icon')
      if (!iconElement) return

      event.stopPropagation()
      const tabElement = target.closest('.Tabs-Tab')
      const tabId = tabElement?.getAttribute('data-tab-id')
      if (!tabId) return

      const isIconTrash = iconElement.classList.contains('IconTrash')
      const isIconInfo = iconElement.classList.contains('IconInfo')

      if (isIconTrash) {
        handleDeleteClick(tabId)
      } else if (isIconInfo) {
        handleInfoClick(tabId)
      }
    }

    const tabElements = tabsContainer.querySelectorAll('.Tabs-Tab')
    tabElements.forEach((tab, index) => {
      tab.setAttribute('data-tab-id', pcapTabs[index]?.id || '')
    })

    tabsContainer.addEventListener('click', handleIconClick)
    return () => tabsContainer.removeEventListener('click', handleIconClick)
  }, [pcapTabs, handleDeleteClick, handleInfoClick])

  // проверяем наличие project и pcaps перед вычислением activePcap
  const activePcap =
    project?.pcaps && project.activePcapTab
      ? project.pcaps.find((pcap) => pcap.id === project.activePcapTab?.id)
      : null

  const ipConversations = activePcap?.summary.find(
    (s) => s.type === 'ip_conversations',
  )?.content as TrafficData[] | undefined

  if (isLoading) {
    return <Loader />
  }

  if (!project?.pcaps.length) {
    return (
      <Informer
        status="system"
        view="filled"
        label="Данные отсутствуют. Загрузите дамп"
      />
    )
  }

  return (
    <div className="flex flex-col">
      <Tabs
        ref={tabsRef}
        value={project?.activePcapTab}
        onChange={(tab) =>
          setProject({ ...project, activePcapTab: tab } as Project)
        }
        items={pcapTabs}
        getItemLabel={(item) => item.label}
        getItemLeftIcon={(item) => item.leftIcon}
        getItemRightIcon={(item) => item.rightIcon}
        size="m"
        view="bordered"
        fitMode="dropdown"
      />
      {project?.activePcapTab && ipConversations && (
        <div className="border">
          <TrafficGraph data={ipConversations} />
        </div>
      )}
    </div>
  )
}

export default ProjectPage
