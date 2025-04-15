import { Pcap } from '@/app/projects/[id]/types'

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
