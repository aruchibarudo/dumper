'use client'

import React, { use, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Tabs } from '@consta/uikit/Tabs'
import { Text } from '@consta/uikit/Text'

import { PcapTab, ProjectPageProps } from '@/app/projects/[id]/types'
import { TrafficData } from '@/app/projects/[id]/pcap/table/types'
import data from './data.json'

const TrafficGraph = dynamic(
  () => import('@/app/projects/[id]/pcap/graph/TrafficGraph'),
  {
    ssr: false,
  },
)

const ProjectPage = ({ params }: ProjectPageProps) => {
  const { id } = use(params)
  const [activePcapTab, setActivePcapTab] = useState<PcapTab | null>(null)

  // @todo: заменить на fetch
  const project = data

  const pcapTabs: PcapTab[] = project.pcaps.map((pcap) => ({
    id: pcap.id,
    label: pcap.filename,
  }))

  useEffect(() => {
    if (pcapTabs.length > 0 && !activePcapTab) {
      setActivePcapTab(pcapTabs[0])
    }
  }, [pcapTabs, activePcapTab])

  const activePcap = project.pcaps.find((pcap) => pcap.id === activePcapTab?.id)
  const ipConversations = activePcap?.summary.find(
    (s) => s.type === 'ip_conversations',
  )?.content as TrafficData[] | undefined

  return (
    <>
      <div className="flex items-center gap-4">
        <Text size="2xl" className="whitespace-nowrap">
          [{project.name}]
        </Text>
        <Text view="secondary">{project.description}</Text>
      </div>

      <Tabs
        value={activePcapTab}
        onChange={setActivePcapTab}
        items={pcapTabs}
        getItemLabel={(item) => item.label}
        size="m"
        view="bordered"
        fitMode="dropdown"
      />

      {activePcapTab && ipConversations && (
        <div className="border">
          <TrafficGraph data={ipConversations} />
        </div>
      )}
    </>
  )
}

export default ProjectPage
