import { useEffect, useRef, useState } from 'react'
import ForceGraph2D, { NodeObject } from 'react-force-graph-2d'
import TableGraph from '../table/TableGraph'
import {
  calculateGraphWidth,
  initializeGraphData,
  drawNode,
  drawNodePointerArea,
  drawLink,
  GRAPH_HEIGHT,
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
  const { nodes, links } = initializeGraphData({ data, graphWidth })

  useEffect(() => {
    const handleResize = () => setGraphWidth(calculateGraphWidth())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (graphRef.current) {
      // graphRef.current.centerAt(graphWidth / 2, GRAPH_HEIGHT / 2 + 40, 0)
      graphRef.current.centerAt(graphWidth / 2 + 10, GRAPH_HEIGHT / 2 + 10, 0)
      // подстраиваем масштаб с отступами и ограничиваем максимальное увеличение
      // graphRef.current.zoomToFit(0, 40)
    }
  }, [graphWidth, nodes, links])

  const handleNodeClick = (node: GraphNode) => {
    if (node.type === NodeType.More) {
      setSelectedCategory(
        selectedCategory === node.categoryName ? null : node.categoryName,
      )
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex-shrink-0" style={{ height: `${GRAPH_HEIGHT}px` }}>
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
          height={GRAPH_HEIGHT}
          maxZoom={1.2}
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
