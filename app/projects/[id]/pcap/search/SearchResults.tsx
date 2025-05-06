import React from 'react'
import { Text } from '@consta/uikit/Text'

import { SearchResultsProps } from '@/app/projects/[id]/pcap/search/types'
import PcapCard from '@/app/projects/[id]/pcap/search/PcapCard'

const SearchResults = ({
  pcaps,
  searchQuery,
  onPcapClick,
}: SearchResultsProps) => {
  const totalPcaps = pcaps.length

  if (!totalPcaps) {
    return <Text view="alert">PCAP-файлы не найдены</Text>
  }

  return (
    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
      <Text view="primary">Найдено файлов: {totalPcaps}</Text>

      {pcaps.map((pcap) => (
        <PcapCard
          key={pcap.id}
          pcap={pcap}
          searchQuery={searchQuery}
          onClick={() => onPcapClick(pcap)}
        />
      ))}
    </div>
  )
}

export default SearchResults
