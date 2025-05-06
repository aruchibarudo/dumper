import { Text } from '@consta/uikit/Text'
import { TrafficGraphContainerProps } from '@/app/projects/[id]/pcap/graph/types'
import dynamic from 'next/dynamic'
// import TrafficGraph from '@/app/projects/[id]/pcap/graph/TrafficGraph'

const TrafficGraph = dynamic(
  () => import('@/app/projects/[id]/pcap/graph/TrafficGraph'),
  {
    ssr: false,
  },
)

const TrafficGraphContainer = ({ pcap }: TrafficGraphContainerProps) => {
  const ipConversations = pcap.summary.find(
    (s) => s.type === 'ip_conversations',
  )?.content

  if (!ipConversations) {
    return (
      <div className="p-4 border rounded">
        <Text>Данные о сетевом трафике отсутствуют</Text>
      </div>
    )
  }

  return (
    <div className="border rounded">
      <TrafficGraph data={ipConversations} />
    </div>
  )
}

export default TrafficGraphContainer
