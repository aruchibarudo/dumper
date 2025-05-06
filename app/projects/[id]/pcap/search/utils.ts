import {
  SearchParams,
  SearchSortOption,
} from '@/app/projects/[id]/pcap/search/types'
import { Pcap } from '@/app/projects/[id]/types'
import { isWithinInterval, parseISO } from 'date-fns'

export const searchSortOptions = [
  { label: 'Сначала новые', value: 'newest' },
  { label: 'Сначала старые', value: 'oldest' },
  { label: 'Имя файла А-Я', value: 'filename_asc' },
  { label: 'Имя файла Я-А', value: 'filename_desc' },
]

export const defaultSearchParams: SearchParams = {
  query: '',
  filename: '',
  description: '',
  projectNumber: '',
  hostname: '',
  startDate: null,
  endDate: null,
  id: '',
  sort: 'newest',
  totalPkts: { value: null, operator: 'eq' },
  conversationCategory: null,
  conversationSource: '',
  conversationTarget: '',
  conversationPackets: { value: null, operator: 'eq' },
  conversationPort: { value: null, operator: 'eq' },
}

export const highlightSearchText = (text: string, highlight: string) => {
  if (!highlight) {
    return text
  }

  const regex = new RegExp(`(${highlight})`, 'gi')
  return text.replace(regex, '<span class="font-bold">$1</span>')
}

// фильтры по параметрам
export const applyTextFilters = (
  pcaps: Pcap[],
  params: SearchParams,
): Pcap[] => {
  let results = [...pcaps]

  // основной запрос (поиск по всем полям, включая summary)
  if (params.query) {
    const lowerQuery = params.query.toLowerCase()
    results = results.filter((pcap) => {
      // проверка строковых полей
      const matchesBasicFields = Object.entries(pcap).some(
        ([key, value]) =>
          key !== 'summary' &&
          typeof value === 'string' &&
          value.toLowerCase().includes(lowerQuery),
      )

      // проверка ip_conversations
      const matchesConversations = pcap.summary.some(
        (s) =>
          s.type === 'ip_conversations' &&
          s.content.some((conv) =>
            [
              conv.category,
              conv.source,
              conv.target,
              conv.packets.toString(),
              conv.port.toString(),
            ].some((val) => val.toLowerCase().includes(lowerQuery)),
          ),
      )

      return matchesBasicFields || matchesConversations
    })
  }

  // расширенные поля
  if (params.projectNumber) {
    results = results.filter((pcap) =>
      pcap.project_number
        .toLowerCase()
        .includes(params.projectNumber.toLowerCase()),
    )
  }

  if (params.filename) {
    results = results.filter((pcap) =>
      pcap.filename.toLowerCase().includes(params.filename.toLowerCase()),
    )
  }

  if (params.hostname) {
    results = results.filter((pcap) =>
      pcap.hostname.toLowerCase().includes(params.hostname.toLowerCase()),
    )
  }

  if (params.description) {
    results = results.filter((pcap) =>
      pcap.description.toLowerCase().includes(params.description.toLowerCase()),
    )
  }

  if (params.id) {
    results = results.filter((pcap) =>
      pcap.id.toLowerCase().includes(params.id.toLowerCase()),
    )
  }

  if (params.conversationSource) {
    results = results.filter((pcap) =>
      pcap.summary.some(
        (s) =>
          s.type === 'ip_conversations' &&
          s.content.some((conv) =>
            conv.source
              .toLowerCase()
              .includes(params.conversationSource.toLowerCase()),
          ),
      ),
    )
  }

  if (params.conversationTarget) {
    results = results.filter((pcap) =>
      pcap.summary.some(
        (s) =>
          s.type === 'ip_conversations' &&
          s.content.some((conv) =>
            conv.target
              .toLowerCase()
              .includes(params.conversationTarget.toLowerCase()),
          ),
      ),
    )
  }

  if (params.conversationCategory) {
    results = results.filter((pcap) =>
      pcap.summary.some(
        (s) =>
          s.type === 'ip_conversations' &&
          s.content.some(
            (conv) => conv.category === params.conversationCategory,
          ),
      ),
    )
  }

  return results
}

export const applyNumberFilters = (
  pcaps: Pcap[],
  params: SearchParams,
): Pcap[] => {
  let results = [...pcaps]

  // фильтр по total_pkts
  if (params.totalPkts.value !== null) {
    results = results.filter((pcap) => {
      const totalPktsEntry = pcap.summary.find((s) => s.type === 'total_pkts')
      const value = totalPktsEntry?.content[0] ?? 0
      const filterValue = params.totalPkts.value!

      switch (params.totalPkts.operator) {
        case 'gt':
          return value > filterValue
        case 'lt':
          return value < filterValue
        case 'eq':
          return value === filterValue
        default:
          return true
      }
    })
  }

  // фильтр по conversation.packets
  if (params.conversationPackets.value !== null) {
    results = results.filter((pcap) =>
      pcap.summary.some(
        (s) =>
          s.type === 'ip_conversations' &&
          s.content.some((conv) => {
            const filterValue = params.conversationPackets.value!
            switch (params.conversationPackets.operator) {
              case 'gt':
                return conv.packets > filterValue
              case 'lt':
                return conv.packets < filterValue
              case 'eq':
                return conv.packets === filterValue
              default:
                return true
            }
          }),
      ),
    )
  }

  // фильтр по conversation.port
  if (params.conversationPort.value !== null) {
    results = results.filter((pcap) =>
      pcap.summary.some(
        (s) =>
          s.type === 'ip_conversations' &&
          s.content.some((conv) => {
            const filterValue = params.conversationPort.value!
            switch (params.conversationPort.operator) {
              case 'gt':
                return conv.port > filterValue
              case 'lt':
                return conv.port < filterValue
              case 'eq':
                return conv.port === filterValue
              default:
                return true
            }
          }),
      ),
    )
  }

  return results
}

// фильтры по датам
export const applyDateFilters = (
  pcaps: Pcap[],
  params: SearchParams,
): Pcap[] => {
  if (!params.startDate || !params.endDate) {
    return pcaps
  }

  return pcaps.filter((pcap) => {
    const pcapDate = parseISO(pcap.timestamp)
    return isWithinInterval(pcapDate, {
      start: params.startDate as Date,
      end: params.endDate as Date,
    })
  })
}

// сортировка
export const applySorting = (
  pcaps: Pcap[],
  sortOption: SearchSortOption,
): Pcap[] => {
  const sorted = [...pcaps]

  switch (sortOption) {
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )

    case 'oldest':
      return sorted.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      )

    case 'filename_asc':
      return sorted.sort((a, b) => a.filename.localeCompare(b.filename))

    case 'filename_desc':
      return sorted.sort((a, b) => b.filename.localeCompare(a.filename))

    default:
      return sorted
  }
}

export const categoryOptions = [
  { label: 'External', value: 'external' },
  { label: 'Internal', value: 'internal' },
  { label: 'Proxy', value: 'proxy' },
  { label: 'DNS', value: 'dns' },
]

export const operatorOptions = [
  { label: '>', value: 'gt' },
  { label: '<', value: 'lt' },
  { label: '=', value: 'eq' },
]
