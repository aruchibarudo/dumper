import { PcapTab } from '@/app/projects/[id]/types'

export type PcapTabsProps = {
  tabs: PcapTab[]
  activeTabId?: string
  onDeletePcap: (pcapId: string) => void
}
