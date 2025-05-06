import { PcapTab, Project } from '@/app/projects/[id]/types'

export const shouldUpdateProject = (
  currentProject: Project | null,
  fetchedProject: Project,
  tabs: PcapTab[],
) => {
  if (!currentProject) return true
  if (currentProject.id !== fetchedProject.id) return true
  if (currentProject.pcaps !== fetchedProject.pcaps) return true

  return tabs.length > 0
    ? !currentProject.activePcapTab ||
        !tabs.some((tab) => tab.id === currentProject.activePcapTab?.id)
    : currentProject.activePcapTab !== null
}
