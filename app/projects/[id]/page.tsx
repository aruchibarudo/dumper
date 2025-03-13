'use client'

import React, { use, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Tabs } from '@consta/uikit/Tabs'
import { Text } from '@consta/uikit/Text'

import { PcapTab, ProjectPageProps } from '@/app/projects/[id]/types'
import { TrafficData } from '@/app/projects/[id]/pcap/table/types'
import { Button } from '@consta/uikit/Button'
import { IconAdd } from '@consta/icons/IconAdd'
import data from './data.json'
import { DumpUploadForm } from '@/app/projects/[id]/pcap/form/DumpUploadForm'
import { Modal } from '@consta/uikit/Modal'

const TrafficGraph = dynamic(
  () => import('@/app/projects/[id]/pcap/graph/TrafficGraph'),
  {
    ssr: false,
  },
)

const ProjectPage = ({ params }: ProjectPageProps) => {
  const { id } = use(params)
  const [activePcapTab, setActivePcapTab] = useState<PcapTab | null>(null)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

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

  const handleDumpUploaded = () => {
    // @todo: добавить логику обновления списка pcap
    console.log('Дамп загружен')
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Text size="2xl" className="whitespace-nowrap">
          [{project.name}]
        </Text>

        <Text view="secondary">{project.description}</Text>

        <Button
          label="Загрузить дамп"
          iconLeft={IconAdd}
          view="clear"
          onClick={() => setIsUploadModalOpen(true)}
        />
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

      <Modal
        isOpen={isUploadModalOpen}
        onClickOutside={() => setIsUploadModalOpen(false)}
        onClose={() => setIsUploadModalOpen(false)}
        className="p-4 max-w-md"
      >
        <DumpUploadForm
          projectId={id}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={handleDumpUploaded}
        />
      </Modal>
    </>
  )
}

export default ProjectPage
