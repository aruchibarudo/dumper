import { useCallback, useEffect, useRef, useState } from 'react'
import ForceGraph2D, { NodeObject } from 'react-force-graph-2d'
import TableGraph from '../table/TableGraph'
import {
  calculateGraphWidth,
  initializeGraphData,
  drawNode,
  drawNodePointerArea,
  drawLink,
} from './utils'
import debounce from '@/app/utils/debounce'
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
  const [graphWidth, setGraphWidth] = useState(calculateGraphWidth())
  const [graphHeight, setGraphHeight] = useState(
    selectedCategory
      ? (window.innerHeight - 120) / 2
      : window.innerHeight - 120,
  )

  const scaleFactor = graphWidth / calculateGraphWidth()

  // обновление размеров при ресайзе
  const updateDimensions = useCallback(() => {
    setGraphWidth(calculateGraphWidth())
    setGraphHeight(
      selectedCategory
        ? (window.innerHeight - 120) / 2
        : window.innerHeight - 120,
    )
  }, [selectedCategory])

  const debouncedUpdateDimensions = debounce(updateDimensions, 100)

  useEffect(() => {
    window.addEventListener('resize', debouncedUpdateDimensions)
    return () => window.removeEventListener('resize', debouncedUpdateDimensions)
  }, [debouncedUpdateDimensions])

  // обновление высоты при изменении selectedCategory
  useEffect(() => {
    updateDimensions()
  }, [selectedCategory, updateDimensions])

  // инициализация данных графа
  const { nodes, links } = initializeGraphData({
    data,
    graphWidth,
    graphHeight,
  })

  // центрирование и масштабирование графа
  useEffect(() => {
    if (graphRef.current) {
      // graphRef.current.centerAt(graphWidth / 2, graphHeight / 2 + 40, 0)
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
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      <div
        className="flex-shrink-0"
        style={{ width: `${graphWidth}px`, height: `${graphHeight}px` }}
      >
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
