import { Project } from '@/app/projects/[id]/types'

export type UsePcapTabsProps = {
  project: Project | null
  fetchedProject: Project | undefined
  projectId: string
  setProject: (project: Project) => void
}

export type UseDeletePcapProps = {
  projectId: string
  activeTabId?: string
  setProject: (project: Project) => void
}
