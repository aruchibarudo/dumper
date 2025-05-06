import { Project } from '@/app/projects/[id]/types'
import { useEffect, useMemo } from 'react'
import { generatePcapTabs, getActiveTab } from '@/app/projects/[id]/utils'
import { useDeletePcap } from '@/app/projects/[id]/hooks/useDeletePcap'
import { UsePcapTabsProps } from '@/app/projects/[id]/hooks/types'
import { shouldUpdateProject } from '@/app/projects/[id]/hooks/utils'

export const usePcapTabs = ({
  project,
  fetchedProject,
  projectId,
  setProject,
}: UsePcapTabsProps) => {
  const tabs = useMemo(() => {
    if (!project?.pcaps) return []
    return generatePcapTabs(project.pcaps)
  }, [project?.pcaps])

  const { handleDeletePcap } = useDeletePcap({
    projectId,
    activeTabId: project?.activePcapTab?.id,
    setProject,
  })

  // синхронизируем данные проекта с активной вкладкой
  useEffect(() => {
    if (!fetchedProject) return

    const needsUpdate = shouldUpdateProject(project, fetchedProject, tabs)
    if (!needsUpdate) return

    const newActivePcapTab = tabs.length > 0 ? tabs[0] : null
    setProject({
      ...fetchedProject,
      activePcapTab: getActiveTab(project, tabs, newActivePcapTab),
    } as Project)
  }, [fetchedProject, tabs, project, setProject])

  const activePcap = useMemo(() => {
    return (
      project?.pcaps?.find((pcap) => pcap.id === project.activePcapTab?.id) ||
      null
    )
  }, [project])

  return { tabs, activePcap, handleDeletePcap }
}
