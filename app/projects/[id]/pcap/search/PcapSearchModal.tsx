import React, { useState, useMemo } from 'react'
import { format, isWithinInterval, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Select } from '@consta/uikit/Select'
import { Card } from '@consta/uikit/Card'
import { DatePicker } from '@consta/uikit/DatePicker'
import { TextField } from '@consta/uikit/TextField'
import { Text } from '@consta/uikit/Text'
import { IconSearchStroked } from '@consta/icons/IconSearchStroked'
import { Button } from '@consta/uikit/Button'

import { useProject } from '@/app/context/project/ProjectContext'
import { useModal } from '@/components/ui/modal/hooks'
import { Pcap } from '@/app/projects/[id]/types'
import {
  highlightSearchText,
  searchSortOptions,
} from '@/app/projects/[id]/pcap/search/utils'
import {
  SearchModalProps,
  SearchSortOption,
} from '@/app/projects/[id]/pcap/search/types'

const PcapSearchModal = ({ onSelectPcap }: SearchModalProps) => {
  const { project } = useProject()
  const { closeModal } = useModal()
  const [query, setQuery] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [projectNumber, setProjectNumber] = useState('')
  const [filename, setFilename] = useState('')
  const [hostname, setHostname] = useState('')
  const [description, setDescription] = useState('')
  const [id, setId] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [sort, setSort] = useState<SearchSortOption>('newest')

  const filteredPcaps = useMemo(() => {
    if (!project?.pcaps) return []

    let result = [...project.pcaps]

    // фильтрация по основному запросу
    if (query) {
      const lowerQuery = query.toLowerCase()
      result = result.filter(
        (pcap) =>
          pcap.project_number.toLowerCase().includes(lowerQuery) ||
          pcap.filename.toLowerCase().includes(lowerQuery) ||
          pcap.hostname.toLowerCase().includes(lowerQuery) ||
          pcap.description.toLowerCase().includes(lowerQuery) ||
          pcap.id.toLowerCase().includes(lowerQuery),
      )
    }

    // фильтрация по расширенным полям
    if (showAdvanced) {
      if (projectNumber) {
        result = result.filter((pcap) =>
          pcap.project_number
            .toLowerCase()
            .includes(projectNumber.toLowerCase()),
        )
      }
      if (filename) {
        result = result.filter((pcap) =>
          pcap.filename.toLowerCase().includes(filename.toLowerCase()),
        )
      }
      if (hostname) {
        result = result.filter((pcap) =>
          pcap.hostname.toLowerCase().includes(hostname.toLowerCase()),
        )
      }
      if (description) {
        result = result.filter((pcap) =>
          pcap.description.toLowerCase().includes(description.toLowerCase()),
        )
      }
      if (id) {
        result = result.filter((pcap) =>
          pcap.id.toLowerCase().includes(id.toLowerCase()),
        )
      }
      if (startDate && endDate) {
        result = result.filter((pcap) => {
          const pcapDate = parseISO(pcap.timestamp)
          return isWithinInterval(pcapDate, {
            start: startDate,
            end: endDate,
          })
        })
      }
    }

    // сортировка
    result.sort((a, b) => {
      switch (sort) {
        case 'newest':
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        case 'oldest':
          return (
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          )
        case 'filename_asc':
          return a.filename.localeCompare(b.filename)
        case 'filename_desc':
          return b.filename.localeCompare(a.filename)
        default:
          return 0
      }
    })

    return result
  }, [
    project?.pcaps,
    query,
    showAdvanced,
    projectNumber,
    filename,
    hostname,
    description,
    id,
    startDate,
    endDate,
    sort,
  ])

  const handlePcapClick = (pcap: Pcap) => {
    onSelectPcap(pcap.id, pcap.filename)
    closeModal()
  }

  return (
    <div className="flex flex-col gap-4">
      <TextField
        placeholder="Поиск PCAP-файлов..."
        leftSide={IconSearchStroked}
        value={query}
        onChange={(value) => setQuery(value || '')}
        aria-label="Поиск PCAP-файлов"
        size="s"
      />
      <Button
        label={
          showAdvanced
            ? 'Скрыть расширенный поиск'
            : 'Показать расширенный поиск'
        }
        view="secondary"
        onClick={() => setShowAdvanced(!showAdvanced)}
        size="s"
      />
      {showAdvanced && (
        <div className="grid grid-cols-2 gap-4">
          <TextField
            label="Номер проекта"
            value={projectNumber}
            onChange={(value) => setProjectNumber(value || '')}
            size="s"
          />
          <TextField
            label="Имя файла"
            value={filename}
            onChange={(value) => setFilename(value || '')}
            size="s"
          />
          <TextField
            label="Хост"
            value={hostname}
            onChange={(value) => setHostname(value || '')}
            size="s"
          />
          <TextField
            label="Описание"
            value={description}
            onChange={(value) => setDescription(value || '')}
            size="s"
          />
          <TextField
            label="ID"
            value={id}
            onChange={(value) => setId(value || '')}
            size="s"
          />
          <DatePicker
            label="Дата начала"
            value={startDate}
            onChange={(value) => setStartDate(value)}
            size="s"
          />
          <DatePicker
            label="Дата окончания"
            value={endDate}
            onChange={(value) => setEndDate(value)}
            size="s"
          />
        </div>
      )}
      <Select
        label="Сортировать по"
        items={searchSortOptions}
        value={searchSortOptions.find((opt) => opt.value === sort)}
        onChange={(option) => setSort(option?.value as SearchSortOption)}
        getItemLabel={(item) => item.label}
        getItemKey={(item) => item.value}
        size="s"
      />
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
        <Text view="primary">Результаты поиска</Text>
        {filteredPcaps.length === 0 && (
          <Text view="alert">PCAP-файлы не найдены</Text>
        )}
        {filteredPcaps.map((pcap) => (
          <Card
            key={pcap.id}
            className="p-4 cursor-pointer hover:bg-gray-100"
            onClick={() => handlePcapClick(pcap)}
            role="button"
            tabIndex={0}
            onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) =>
              e.key === 'Enter' && handlePcapClick(pcap)
            }
            aria-label={`Выбрать PCAP ${pcap.filename}`}
          >
            <Text
              view="primary"
              dangerouslySetInnerHTML={{
                __html: highlightSearchText(pcap.filename, query),
              }}
            />
            <Text
              view="secondary"
              size="s"
              dangerouslySetInnerHTML={{
                __html: highlightSearchText(pcap.description, query),
              }}
            />
            <Text view="secondary" size="s">
              Загружено:{' '}
              {format(parseISO(pcap.timestamp), 'dd MMM yyyy, HH:mm', {
                locale: ru,
              })}
            </Text>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PcapSearchModal
