import { useEffect, useRef, useState } from 'react'
import ForceGraph2D, { NodeObject } from 'react-force-graph-2d'
import TableGraph from '../table/TableGraph'
import {
  calculateGraphWidth,
  initializeGraphData,
  drawNode,
  drawNodePointerArea,
  drawLink,
} from './utils'
import {
  TrafficGraphProps,
  GraphRef,
  GraphNode,
  NodeType,
  RawLink,
} from './types'

export const TrafficGraph = ({ data }: TrafficGraphProps) => {
  const graphRef = useRef<GraphRef | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [graphWidth, setGraphWidth] = useState(calculateGraphWidth)
  const scaleFactor = graphWidth / calculateGraphWidth()

  const graphHeight = selectedCategory
    ? (window.innerHeight - 120) / 2
    : window.innerHeight - 120
  const { nodes, links } = initializeGraphData({
    data,
    graphWidth,
    graphHeight,
  })

  useEffect(() => {
    const handleResize = () => setGraphWidth(calculateGraphWidth())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (graphRef.current) {
      // graphRef.current.centerAt(graphWidth / 2, graphHeight / 2 + 40, 0)
      // подстраиваем масштаб с отступами
      graphRef.current.zoomToFit(0, 40)
      graphRef.current.zoom(0.99, 0)
    }
  }, [graphWidth, graphHeight, nodes, links])

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === NodeType.More) {
      setSelectedCategory(
        selectedCategory === node.categoryName ? null : node.categoryName,
      )
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex-shrink-0" style={{ height: `${graphHeight}px` }}>
        <ForceGraph2D<NodeObject<GraphNode>, RawLink>
          ref={graphRef}
          graphData={{ nodes, links }}
          nodeCanvasObject={(node, ctx) =>
            drawNode({ node, ctx, scaleFactor, selectedCategory })
          }
          linkCanvasObject={(link, ctx) => drawLink({ link, ctx, scaleFactor })}
          onNodeClick={handleNodeClick}
          nodeLabel="label"
          nodePointerAreaPaint={(node, color, ctx) =>
            drawNodePointerArea({ node, color, ctx, scaleFactor })
          }
          width={graphWidth}
          height={graphHeight}
          minZoom={0.5}
          maxZoom={5}
        />
      </div>
      {selectedCategory && (
        <div className="flex-1 overflow-auto">
          <TableGraph category={selectedCategory} data={data} />
        </div>
      )}
    </div>
  )
}

export default TrafficGraph
