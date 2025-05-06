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

  // основной запрос
  if (params.query) {
    const lowerQuery = params.query.toLowerCase()
    results = results.filter((pcap) =>
      Object.entries(pcap).some(
        ([key, value]) =>
          key !== 'summary' &&
          typeof value === 'string' &&
          value.toLowerCase().includes(lowerQuery),
      ),
    )
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
