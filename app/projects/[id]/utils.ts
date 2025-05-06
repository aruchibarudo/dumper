import { Pcap, PcapTab, Project } from '@/app/projects/[id]/types'
import { IconInfo } from '@consta/icons/IconInfo'
import { IconTrash } from '@consta/icons/IconTrash'

export const generateUniqueLabels = (files: Pcap[]) => {
  const filenameCounts: Record<string, number> = {}
  files.forEach(({ filename }) => {
    filenameCounts[filename] = (filenameCounts[filename] || 0) + 1
  })

  const seenFilenames: Record<string, number> = {}

  return files.map(({ filename }) => {
    const count = filenameCounts[filename]
    let label = filename

    if (count > 1) {
      seenFilenames[filename] = (seenFilenames[filename] || 0) + 1
      if (seenFilenames[filename] > 1) {
        label = `${filename}(${seenFilenames[filename] - 1})`
      }
    }

    return label
  })
}

export const generatePcapTabs = (pcaps: Pcap[]): PcapTab[] => {
  const labels = generateUniqueLabels(pcaps)
  return pcaps.map((pcap, index) => ({
    id: pcap.id,
    label: labels[index],
    leftIcon: IconInfo,
    rightIcon: IconTrash,
  }))
}

export const getActiveTab = (
  project: Project | null,
  tabs: PcapTab[],
  fallbackTab: PcapTab | null,
): PcapTab | null => {
  return project?.activePcapTab &&
    tabs.some((tab) => tab.id === project.activePcapTab?.id)
    ? project.activePcapTab
    : fallbackTab
}

export const handleActiveTabAfterDelete = (
  updatedProject: Project,
  setProject: (project: Project) => void,
) => {
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
