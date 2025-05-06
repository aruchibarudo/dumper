import { useRef, useEffect } from 'react'
import { Tabs } from '@consta/uikit/Tabs'
import { Button } from '@consta/uikit/Button'
import { Text } from '@consta/uikit/Text'

import { PcapTab, Project } from '@/app/projects/[id]/types'
import { PcapTabsProps } from '@/app/projects/[id]/pcap/tabs/types'
import { useProject } from '@/app/context/project/ProjectContext'
import { useModal } from '@/components/ui/modal/hooks'

export const PcapTabs = ({
  tabs,
  activeTabId,
  onDeletePcap,
}: PcapTabsProps) => {
  const { project, setProject } = useProject()
  const { setModal, closeModal } = useModal()
  const tabsRef = useRef<HTMLDivElement>(null)

  const activeTab = tabs.find((tab) => tab.id === activeTabId)

  const handleTabChange = (tab: PcapTab) => {
    setProject({ ...project, activePcapTab: tab } as Project)
  }

  const showPcapInfo = (pcapId: string) => {
    const pcap = project?.pcaps?.find((p) => p.id === pcapId)
    if (!pcap) return

    const totalPkts =
      pcap.summary.find((s) => s.type === 'total_pkts')?.content[0] || 0

    setModal({
      title: 'Информация о PCAP',
      content: (
        <div className="flex flex-col gap-2">
          <Text>
            <strong>ID:</strong> {pcap.id}
          </Text>
          <Text>
            <strong>Имя файла:</strong> {pcap.filename}
          </Text>
          <Text>
            <strong>Время:</strong> {new Date(pcap.timestamp).toLocaleString()}
          </Text>
          <Text>
            <strong>Хост:</strong> {pcap.hostname}
          </Text>
          <Text>
            <strong>Описание:</strong> {pcap.description}
          </Text>
          <Text>
            <strong>Номер проекта:</strong> {pcap.project_number}
          </Text>
          <Text>
            <strong>Общее количество пакетов:</strong> {totalPkts}
          </Text>
          <div className="flex justify-end mt-4">
            <Button
              label="Закрыть"
              view="secondary"
              onClick={() => closeModal()}
            />
          </div>
        </div>
      ),
      modalProps: { className: 'max-w-md' },
    })
  }

  const deletePcap = (pcapId: string, label?: string) => {
    setModal({
      title: 'Удалить PCAP',
      content: (
        <div className="flex flex-col gap-4">
          <Text>
            Вы уверены, что хотите удалить PCAP-файл &#34;{label || pcapId}
            &#34;?
          </Text>
          <div className="flex gap-2">
            <Button
              label="Удалить"
              view="primary"
              onClick={() => {
                onDeletePcap(pcapId)
                closeModal()
              }}
            />
            <Button
              label="Отмена"
              view="secondary"
              onClick={() => closeModal()}
            />
          </div>
        </div>
      ),
      modalProps: { className: 'max-w-md' },
    })
  }

  useEffect(() => {
    const tabsContainer = tabsRef.current
    if (!tabsContainer) return

    // задаем data-tab-id каждой вкладке
    const tabElements = tabsContainer.querySelectorAll('.Tabs-Tab')
    tabElements.forEach((tabElement, index) => {
      const tabId = tabs[index]?.id
      if (tabId) {
        tabElement.setAttribute('data-tab-id', tabId)
      }
    })

    const handleIconClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // ищем ближайшую иконку
      const iconElement = target.closest('.icons--Icon')
      if (!iconElement) return

      // ищем ближайшую вкладку
      const tabElement = target.closest('.Tabs-Tab')
      const tabId = tabElement?.getAttribute('data-tab-id')
      if (!tabId) return

      // определяем тип иконки
      const isTrashIcon = iconElement.classList.contains('IconTrash')
      const isInfoIcon = iconElement.classList.contains('IconInfo')

      if (isTrashIcon) {
        const tab = tabs.find((t) => t.id === tabId)
        deletePcap(tabId, tab?.label)
      } else if (isInfoIcon) {
        showPcapInfo(tabId)
      }
    }

    tabsContainer.addEventListener('click', handleIconClick)
    return () => {
      tabsContainer.removeEventListener('click', handleIconClick)
    }
  }, [tabs, setModal])

  return (
    <Tabs
      ref={tabsRef}
      value={activeTab}
      onChange={handleTabChange}
      items={tabs}
      getItemLabel={(item) => item.label}
      getItemLeftIcon={(item) => item.leftIcon}
      getItemRightIcon={(item) => item.rightIcon}
      size="m"
      view="bordered"
      fitMode="dropdown"
    />
  )
}

export default PcapTabs
