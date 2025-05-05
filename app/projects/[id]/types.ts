import { IconComponent } from '@consta/icons/Icon'
import { Params } from '@/app/types'
import { TrafficData } from '@/app/projects/[id]/pcap/table/types'

export type ProjectPageProps = Params<{ id: string }>

export interface Pcap {
  id: string
  filename: string
  timestamp: string
  hostname: string
  description: string
  project_number: string
  summary: [
    { type: 'total_pkts'; content: number[] },
    { type: 'ip_conversations'; content: TrafficData[] },
  ]
}

export interface Project {
  id: string
  number: string
  name: string
  description: string
  pcaps: Pcap[]
  activePcapTab?: PcapTab | null
}

export type PcapTab = {
  id: string
  label: string
  leftIcon: IconComponent
  rightIcon: IconComponent
}
