import { Pcap } from '@/app/projects/[id]/types'

export type SearchModalProps = {
  onSelectPcap: (pcapId: string, label: string) => void
}

export type SearchSortOption =
  | 'newest'
  | 'oldest'
  | 'filename_asc'
  | 'filename_desc'

export type SearchParams = {
  query: string
  projectNumber: string
  filename: string
  hostname: string
  description: string
  id: string
  startDate: Date | null
  endDate: Date | null
  sort: SearchSortOption
}

export type SearchResultsProps = {
  pcaps: Pcap[]
  searchQuery: string
  onPcapClick: (pcap: Pcap) => void
}

export type PcapCardProps = {
  pcap: Pcap
  searchQuery: string
  onClick: () => void
}

export type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export type SearchStats = {
  total: number
  filtered: number
}

export type UsePcapSearchResult = {
  filteredPcaps: Pcap[]
  searchStats: SearchStats
}

export type UsePcapSearchParams = {
  pcaps: Pcap[]
  params: SearchParams
}
