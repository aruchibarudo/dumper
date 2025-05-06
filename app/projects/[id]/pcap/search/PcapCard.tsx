import React from 'react'
import { format, parseISO } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Card } from '@consta/uikit/Card'
import { Text } from '@consta/uikit/Text'

import { PcapCardProps } from '@/app/projects/[id]/pcap/search/types'
import { highlightSearchText } from '@/app/projects/[id]/pcap/search/utils'

const PcapCard = ({ pcap, searchQuery, onClick }: PcapCardProps) => (
  <Card
    className="p-4 cursor-pointer hover:bg-gray-100"
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && onClick()}
    aria-label={`Выбрать PCAP ${pcap.filename}`}
  >
    <Text
      view="primary"
      dangerouslySetInnerHTML={{
        __html: highlightSearchText(pcap.filename, searchQuery),
      }}
    />
    <Text
      view="secondary"
      size="s"
      dangerouslySetInnerHTML={{
        __html: highlightSearchText(pcap.description, searchQuery),
      }}
    />
    <Text view="secondary" size="s">
      Загружено:{' '}
      {format(parseISO(pcap.timestamp), 'dd MMM yyyy, HH:mm', {
        locale: ru,
      })}
    </Text>
  </Card>
)

export default PcapCard
