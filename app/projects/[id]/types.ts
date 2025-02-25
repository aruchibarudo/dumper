import { Params } from '@/app/types'
import { TrafficData } from '@/app/projects/[id]/pcap/table/types'

export type ProjectPageProps = Params<{ id: string }>

export interface PcapSummary {
  type: string
  content: TrafficData[] | unknown // TrafficData[] для `ip_conversations`, `unknown` для др.типов
}

export interface Pcap {
  id: string
  filename: string
  timestamp: string
  hostname: string
  description: string
  summary: PcapSummary[]
}

export interface Project {
  id: string
  number: string
  name: string
  description: string
  pcaps: Pcap[]
}

export type PcapTab = {
  id: string
  label: string // Отображаемое имя вкладки (filename)
}
