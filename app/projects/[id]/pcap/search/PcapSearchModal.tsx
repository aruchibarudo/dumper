import React, { useState } from 'react'
import { Select } from '@consta/uikit/Select'
import { DatePicker } from '@consta/uikit/DatePicker'
import { TextField } from '@consta/uikit/TextField'
import { Button } from '@consta/uikit/Button'

import { useProject } from '@/app/context/project/ProjectContext'
import { useModal } from '@/components/ui/modal/hooks'
import { Pcap } from '@/app/projects/[id]/types'
import { searchSortOptions } from '@/app/projects/[id]/pcap/search/utils'
import {
  SearchModalProps,
  SearchSortOption,
} from '@/app/projects/[id]/pcap/search/types'
import SearchResults from '@/app/projects/[id]/pcap/search/SearchResults'
import {
  usePcapSearch,
  useSearchParamsState,
} from '@/app/projects/[id]/pcap/search/hooks'
import { SearchInput } from '@/app/projects/[id]/pcap/search/SearchInput'

export const PcapSearchModal = ({ onSelectPcap }: SearchModalProps) => {
  const { project } = useProject()
  const { closeModal } = useModal()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { searchParams, updateSearchParams } = useSearchParamsState()
  const { filteredPcaps } = usePcapSearch({
    pcaps: project?.pcaps ?? [],
    params: searchParams,
  })

  const handlePcapClick = (pcap: Pcap) => {
    onSelectPcap(pcap.id, pcap.filename)
    closeModal()
  }

  const toggleAdvanced = () => setShowAdvanced((prev) => !prev)

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        placeholder="Поиск PCAP-файлов..."
        value={searchParams.query}
        onChange={(value) => updateSearchParams('query', value)}
      />

      <Button
        label={
          showAdvanced
            ? 'Скрыть расширенный поиск'
            : 'Показать расширенный поиск'
        }
        view="secondary"
        onClick={toggleAdvanced}
        size="s"
      />

      {showAdvanced && (
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Имя файла"
            value={searchParams.filename}
            onChange={(value) => updateSearchParams('filename', value || '')}
            size="s"
          />
          <TextField
            label="Описание"
            value={searchParams.description}
            onChange={(value) => updateSearchParams('description', value || '')}
            size="s"
          />
          <TextField
            label="Номер проекта"
            value={searchParams.projectNumber}
            onChange={(value) =>
              updateSearchParams('projectNumber', value || '')
            }
            size="s"
          />
          <TextField
            label="Хост"
            value={searchParams.hostname}
            onChange={(value) => updateSearchParams('hostname', value || '')}
            size="s"
          />
          <DatePicker
            label="Дата начала"
            value={searchParams.startDate}
            onChange={(value) => updateSearchParams('startDate', value)}
            size="s"
          />
          <DatePicker
            label="Дата окончания"
            value={searchParams.endDate}
            onChange={(value) => updateSearchParams('endDate', value)}
            size="s"
          />
          <TextField
            label="ID"
            value={searchParams.id}
            onChange={(value) => updateSearchParams('id', value || '')}
            size="s"
          />
        </div>
      )}

      <Select
        label="Сортировать по"
        items={searchSortOptions}
        value={searchSortOptions.find((opt) => opt.value === searchParams.sort)}
        onChange={(option) =>
          updateSearchParams('sort', option?.value as SearchSortOption)
        }
        getItemLabel={(item) => item.label}
        getItemKey={(item) => item.value}
        size="s"
      />

      <SearchResults
        pcaps={filteredPcaps}
        searchQuery={searchParams.query}
        onPcapClick={handlePcapClick}
      />
    </div>
  )
}

export default PcapSearchModal
