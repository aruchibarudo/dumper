import { useMemo, useState } from 'react'
import { SearchParams, UsePcapSearchParams, UsePcapSearchResult } from './types'
import {
  applyDateFilters,
  applySorting,
  applyTextFilters,
  defaultSearchParams,
} from '@/app/projects/[id]/pcap/search/utils'

export const useSearchParamsState = (
  initialState: Partial<SearchParams> = {},
) => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    ...defaultSearchParams,
    ...initialState,
  })

  const updateSearchParams = <K extends keyof SearchParams>(
    key: K,
    value: SearchParams[K],
  ) => {
    setSearchParams((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const resetSearchParams = () => {
    setSearchParams(defaultSearchParams)
  }

  return {
    searchParams,
    setSearchParams,
    updateSearchParams,
    resetSearchParams,
  }
}

export const usePcapSearch = ({
  pcaps,
  params,
}: UsePcapSearchParams): UsePcapSearchResult => {
  const filteredPcaps = useMemo(() => {
    if (!pcaps.length) return []

    let results = [...pcaps]

    // фильтрация по параметрам
    results = applyTextFilters(results, params)
    results = applyDateFilters(results, params)
    results = applySorting(results, params.sort)

    return results
  }, [pcaps, params])

  return {
    filteredPcaps,
    searchStats: {
      total: pcaps.length,
      filtered: filteredPcaps.length,
    },
  }
}
