import {
  GraphNode,
  NodeType,
  CategoryNode,
  RawLink,
  InitializeGraphDataParams,
  GraphData,
  DrawNodeParams,
  DrawNodePointerAreaParams,
  DrawLinkParams,
} from './types'
import { NodeObject } from 'react-force-graph-2d'

// константы цветов из @consta/uikit
export const COLORS = {
  INTERNAL: '#24A148',
  PROXY: '#FF9D2B',
  DNS: '#1066DA',
  EXTERNAL: '#EB3449',
  SOURCE_COLORS: ['#FFD83D', '#0071B2', '#24A148', '#FF9D2B'],
  TARGET: '#737373',
  MORE_TEXT: '#0071B2',
  BLACK: '#000000',
} as const

// константы размеров
export const GRAPH_HEIGHT = 450
export const MAX_CANVAS_WIDTH = 1920
export const PARENT_PADDING = 64 // p-4 (32px) + py-4 (32px)
export const SOURCE_RADIUS = 20
export const TARGET_RADIUS = 5
export const MORE_WIDTH = 60
export const MORE_HEIGHT = 20

// константы шрифтов
export const FONT_BASE = 'Arial'
export const FONT_SIZE_LARGE = 14
export const FONT_SIZE_SMALL = 12

// функция вычисления ширины графа
export const calculateGraphWidth = (): number => {
  return Math.min(window.innerWidth - PARENT_PADDING, MAX_CANVAS_WIDTH)
}

// инициализация узлов и связей
export const initializeGraphData = ({
  data,
  graphWidth,
}: InitializeGraphDataParams): GraphData => {
  const scaleFactor = graphWidth / MAX_CANVAS_WIDTH
  const centerX = graphWidth / 2

  // уникальные источники
  const uniqueSources = Array.from(new Set(data.map((item) => item.source)))
  const sourceSpacing = GRAPH_HEIGHT / (uniqueSources.length + 1)
  const sourceNodes: Record<string, GraphNode> = {}
  uniqueSources.forEach((source, index) => {
    sourceNodes[source] = {
      id: `source_${source}`,
      type: NodeType.Source,
      x: centerX,
      y: sourceSpacing * (index + 1),
      fx: centerX,
      fy: sourceSpacing * (index + 1),
      color: COLORS.SOURCE_COLORS[index % COLORS.SOURCE_COLORS.length],
      ip: source,
    }
  })

  // связи источников
  const sourceConnections: Record<string, Record<string, Set<string>>> = {}
  data.forEach((item) => {
    if (!sourceConnections[item.source]) sourceConnections[item.source] = {}
    if (!sourceConnections[item.source][item.category])
      sourceConnections[item.source][item.category] = new Set()
    sourceConnections[item.source][item.category].add(item.target)
  })

  // категории
  const categoryTargets: Record<string, Record<string, number>> = {}
  data.forEach((item) => {
    if (!categoryTargets[item.category]) categoryTargets[item.category] = {}
    categoryTargets[item.category][item.target] =
      (categoryTargets[item.category][item.target] || 0) + item.packets
  })

  const categoryBlocks: Record<string, CategoryNode> = {
    internal: {
      id: 'category_internal',
      type: NodeType.Category,
      x: centerX - 600 * scaleFactor,
      y: 150,
      defaultColor: COLORS.INTERNAL,
      name: 'internal',
      borderColor: COLORS.INTERNAL,
    },
    proxy: {
      id: 'category_proxy',
      type: NodeType.Category,
      x: centerX - 600 * scaleFactor,
      y: 350,
      defaultColor: COLORS.PROXY,
      name: 'proxy',
      borderColor: COLORS.PROXY,
    },
    dns: {
      id: 'category_dns',
      type: NodeType.Category,
      x: centerX + 600 * scaleFactor,
      y: 150,
      defaultColor: COLORS.DNS,
      name: 'dns',
      borderColor: COLORS.DNS,
    },
    external: {
      id: 'category_external',
      type: NodeType.Category,
      x: centerX + 600 * scaleFactor,
      y: 350,
      defaultColor: COLORS.EXTERNAL,
      name: 'external',
      borderColor: COLORS.EXTERNAL,
    },
  }

  const targetNodes: Record<string, GraphNode> = {}
  const moreNodes: Record<string, GraphNode> = {}
  const canvasContext = document.createElement('canvas').getContext('2d')!
  canvasContext.font = `${FONT_SIZE_SMALL}px ${FONT_BASE}`

  const categoryEntries = Object.entries(categoryBlocks)

  for (const [category, block] of categoryEntries) {
    const targetsWithPackets = Object.entries(categoryTargets[category])
      .sort(([, packetsA], [, packetsB]) => packetsB - packetsA)
      .slice(0, 10)
    const maxTextWidth = Math.max(
      ...targetsWithPackets.map(
        ([target]) => canvasContext.measureText(target).width,
      ),
    )
    const blockWidth = Math.max(240, maxTextWidth + 40)
    const rowCount = Math.ceil(targetsWithPackets.length / 2)
    const blockHeight = Math.max(70, rowCount * 20 + 30)
    const { x, y } = block
    const categoryLeft = x - blockWidth / 2
    const categoryTop = y - blockHeight / 2

    targetsWithPackets.forEach(([target], i) => {
      const columnIndex = i % 2
      const rowIndex = Math.floor(i / 2)
      const nodeX = categoryLeft + 10 + columnIndex * (blockWidth / 2 - 10)
      const nodeY = categoryTop + 10 + rowIndex * 20
      const displayText =
        target.length > 15 ? `${target.slice(0, 15)}...` : target
      targetNodes[`${category}_${target}`] = {
        id: `target_${category}_${target}`,
        type: NodeType.Target,
        x: nodeX,
        y: nodeY,
        fx: nodeX,
        fy: nodeY,
        color: COLORS.TARGET,
        ip: displayText,
        label: target,
      }
    })

    moreNodes[category] = {
      id: `more_${category}`,
      type: NodeType.More,
      x,
      y: categoryTop + rowCount * 20 + 15,
      fx: x,
      fy: categoryTop + rowCount * 20 + 15,
      categoryName: block.name,
    }

    block.width = blockWidth
    block.height = blockHeight
    block.fx = x
    block.fy = y
  }

  // узлы(вершины) графа
  const allNodes: GraphNode[] = []
  for (const [category, block] of categoryEntries) {
    let borderColor = block.defaultColor
    for (const [source, connections] of Object.entries(sourceConnections)) {
      const connectedTargets = connections[category]
      const fullTargets = new Set(Object.keys(categoryTargets[category]))
      if (
        connectedTargets &&
        connectedTargets.size === fullTargets.size &&
        Array.from(connectedTargets).every((t) => fullTargets.has(t))
      ) {
        borderColor = sourceNodes[source].color
        break
      }
    }
    block.borderColor = borderColor
    allNodes.push(block)
    allNodes.push(moreNodes[category])
  }
  Object.values(sourceNodes).forEach((node) => allNodes.push(node))
  Object.values(targetNodes).forEach((node) => allNodes.push(node))

  // связи (ребра) графа
  const allLinks: RawLink[] = []
  for (const [source, connections] of Object.entries(sourceConnections)) {
    for (const [category, connectedTargets] of Object.entries(connections)) {
      const fullTargets = new Set(Object.keys(categoryTargets[category]))
      if (
        connectedTargets.size === fullTargets.size &&
        Array.from(connectedTargets).every((t) => fullTargets.has(t))
      ) {
        allLinks.push({
          source: `source_${source}`,
          target: `category_${category}`,
          color: sourceNodes[source].color,
          isCategoryLink: true,
        })
      } else {
        connectedTargets.forEach((target) => {
          if (targetNodes[`${category}_${target}`]) {
            allLinks.push({
              source: `source_${source}`,
              target: `target_${category}_${target}`,
              color: sourceNodes[source].color,
              isCategoryLink: false,
            })
          }
        })
      }
    }
  }

  return { nodes: allNodes, links: allLinks }
}

// отрисовка узлов
export const drawNode = ({
  node,
  ctx,
  scaleFactor,
  selectedCategory,
}: DrawNodeParams) => {
  if (node.type === NodeType.Category) {
    const { x, y, width = 0, height = 0, borderColor, name } = node
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.strokeRect(x - width / 2, y - height / 2, width, height)
    ctx.fillStyle = COLORS.BLACK
    ctx.font = `${FONT_SIZE_LARGE}px ${FONT_BASE}`
    ctx.textAlign = 'center'
    ctx.fillText(name, x, y - height / 2 - 10)
    ctx.font = `${FONT_SIZE_SMALL}px ${FONT_BASE}`
    ctx.fillStyle = COLORS.MORE_TEXT
    const buttonText = name === selectedCategory ? 'Скрыть' : 'Подробнее'
    ctx.fillText(buttonText, x, y + height / 2 - 15)
  } else if (node.type === NodeType.Source) {
    const { x, y, color, ip } = node
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, SOURCE_RADIUS * scaleFactor, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = COLORS.BLACK
    ctx.font = `${FONT_SIZE_SMALL * scaleFactor}px ${FONT_BASE}`
    ctx.textAlign = 'left'
    ctx.fillText(ip, x + 25 * scaleFactor, y + 4 * scaleFactor)
  } else if (node.type === NodeType.Target) {
    const { x, y, color, ip } = node
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, TARGET_RADIUS * scaleFactor, 0, 2 * Math.PI)
    ctx.fill()
    ctx.fillStyle = COLORS.BLACK
    ctx.font = `${FONT_SIZE_SMALL * scaleFactor}px ${FONT_BASE}`
    ctx.textAlign = 'left'
    ctx.fillText(ip, x + 10 * scaleFactor, y + 3 * scaleFactor)
  }
}

// отрисовка области клика для узлов
export const drawNodePointerArea = ({
  node,
  color,
  ctx,
  scaleFactor,
}: DrawNodePointerAreaParams) => {
  ctx.fillStyle = color
  if (node.type === NodeType.More) {
    const width = MORE_WIDTH * scaleFactor
    const height = MORE_HEIGHT * scaleFactor
    ctx.fillRect(node.x - width / 2, node.y - height / 2, width, height)
  } else {
    const radius = node.type === NodeType.Source ? SOURCE_RADIUS : TARGET_RADIUS
    ctx.beginPath()
    ctx.arc(node.x, node.y, radius * scaleFactor, 0, 2 * Math.PI)
    ctx.fill()
  }
}

// отрисовка связей
export const drawLink = ({ link, ctx, scaleFactor }: DrawLinkParams) => {
  const source = link.source as NodeObject<GraphNode>
  const target = link.target as NodeObject<GraphNode>
  ctx.strokeStyle = link.color
  ctx.lineWidth = scaleFactor
  ctx.beginPath()
  if (link.isCategoryLink) {
    const sourceX = source.x!
    const sourceY = source.y!
    const {
      x: targetX,
      y: targetY,
      width = 0,
      height = 0,
    } = target as CategoryNode
    const targetLeft = targetX! - width / 2
    const targetRight = targetX! + width / 2
    const targetTop = targetY! - height / 2
    const targetBottom = targetY! + height / 2
    const endX = sourceX < targetX! ? targetLeft : targetRight
    const endY = Math.max(targetTop, Math.min(targetBottom, sourceY))
    ctx.moveTo(sourceX, sourceY)
    ctx.lineTo(endX, endY)
  } else {
    ctx.moveTo(source.x!, source.y!)
    ctx.lineTo(target.x!, target.y!)
  }
  ctx.stroke()
}
