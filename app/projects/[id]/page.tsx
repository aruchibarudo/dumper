'use client'

import React, { use } from 'react'
import { Loader } from '@consta/uikit/Loader'
import { Informer } from '@consta/uikit/Informer'

import { useProject } from '@/app/context/project/ProjectContext'
import { useProjectQuery } from '@/app/projects/[id]/hooks/useProjectQuery'
import { usePcapTabs } from '@/app/projects/[id]/hooks/usePcapTabs'
import PcapTabs from '@/app/projects/[id]/pcap/tabs/PcapTabs'
import TrafficGraphContainer from '@/app/projects/[id]/pcap/graph/TrafficGraphContainer'
import { ProjectPageProps } from '@/app/projects/[id]/types'
import { useDeletePcap } from '@/app/projects/[id]/hooks/useDeletePcap'

const ProjectPage = ({ params }: ProjectPageProps) => {
  const { id } = use(params)
  const { project, setProject } = useProject()
  const { data: fetchedProject, isLoading } = useProjectQuery(id)

  const { tabs, activePcap } = usePcapTabs({
    project,
    fetchedProject,
    projectId: id,
    setProject,
  })

  const { handleDeletePcap } = useDeletePcap({
    projectId: id,
    activeTabId: project?.activePcapTab?.id,
    setProject,
  })

  if (isLoading) return <Loader />

  if (!project?.pcaps?.length) {
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
      <PcapTabs
        tabs={tabs}
        activeTabId={project.activePcapTab?.id}
        onDeletePcap={handleDeletePcap}
      />

      {activePcap && <TrafficGraphContainer pcap={activePcap} />}
    </div>
  )
}

export default ProjectPage
