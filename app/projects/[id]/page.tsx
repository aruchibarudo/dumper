'use client'

import React, {
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import dynamic from 'next/dynamic'
import { Tabs } from '@consta/uikit/Tabs'
import { Button } from '@consta/uikit/Button'
import { Text } from '@consta/uikit/Text'
import { Informer } from '@consta/uikit/Informer'
import { IconTrash } from '@consta/icons/IconTrash'
import { IconInfo } from '@consta/icons/IconInfo'

import { PcapTab, Project, ProjectPageProps } from '@/app/projects/[id]/types'
import { TrafficData } from '@/app/projects/[id]/pcap/table/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiService } from '@/app/utils/api'
import { useProject } from '@/app/context/project/ProjectContext'
import { useModal } from '@/components/ui/modal/hooks'
import { useSnackbar } from '@/components/ui/snackbar/hooks'
import { Loader } from '@consta/uikit/Loader'

const TrafficGraph = dynamic(
  () => import('@/app/projects/[id]/pcap/graph/TrafficGraph'),
  {
    ssr: false,
  },
)

const ProjectPage = ({ params }: ProjectPageProps) => {
  const { id } = use(params)
  const [activePcapTab, setActivePcapTab] = useState<PcapTab | null>(null)
  const { setProject } = useProject()
  const { setModal, closeModal } = useModal()
  const { addSnackbar } = useSnackbar()
  const queryClient = useQueryClient()
  const tabsRef = useRef<HTMLDivElement>(null)

  const { data: project, isLoading } = useQuery<Project>({
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

      if (activePcapTab?.id === pcapId) {
        const updatedPcaps = updatedProject?.pcaps || []
        setActivePcapTab(
          updatedPcaps.length
            ? {
                id: updatedPcaps[0].id,
                label: updatedPcaps[0].filename,
                leftIcon: IconInfo,
                rightIcon: IconTrash,
              }
            : null,
        )
      }
    },
    onError: (error) => {
      console.error('Ошибка при удалении PCAP:', error)
      addSnackbar({ message: 'Не удалось удалить файл', status: 'alert' })
      closeModal()
    },
  })

  useEffect(() => {
    if (project) {
      setProject(project)
    }
  }, [project, setProject])

  const pcapTabs = useMemo<PcapTab[]>(() => {
    return (
      project?.pcaps.map((pcap) => ({
        id: pcap.id,
        label: pcap.filename,
        leftIcon: IconInfo,
        rightIcon: IconTrash,
      })) || []
    )
  }, [project?.pcaps])

  // устанавливаем первую вкладку если activePcapTab не валиден
  useEffect(() => {
    if (
      pcapTabs.length > 0 &&
      (!activePcapTab || !pcapTabs.some((tab) => tab.id === activePcapTab.id))
    ) {
      setActivePcapTab(pcapTabs[0])
    } else if (pcapTabs.length === 0) {
      setActivePcapTab(null)
    }
  }, [pcapTabs, activePcapTab])

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

  // обработчик кликов по иконкам
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

  const activePcap = project?.pcaps.find(
    (pcap) => pcap.id === activePcapTab?.id,
  )
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
        value={activePcapTab}
        onChange={setActivePcapTab}
        items={pcapTabs}
        getItemLabel={(item) => item.label}
        getItemLeftIcon={(item) => item.leftIcon}
        getItemRightIcon={(item) => item.rightIcon}
        size="m"
        view="bordered"
        fitMode="dropdown"
      />

      {activePcapTab && ipConversations && (
        <div className="border">
          <TrafficGraph data={ipConversations} />
        </div>
      )}
    </div>
  )
}

export default ProjectPage
