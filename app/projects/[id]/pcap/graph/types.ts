import { ForceGraphMethods, NodeObject, LinkObject } from 'react-force-graph-2d'
import { TrafficData } from '@/app/projects/[id]/pcap/table/types'

// типы узлов
export enum NodeType {
  Category = 'category',
  Source = 'source',
  Target = 'target',
  More = 'more',
}

interface BaseNode extends NodeObject {
  type: NodeType
  x: number
  y: number
  fx?: number
  fy?: number
}

export interface CategoryNode extends BaseNode {
  type: NodeType.Category
  width?: number
  height?: number
  defaultColor: string
  name: string
  borderColor: string
}

export interface SourceNode extends BaseNode {
  type: NodeType.Source
  color: string
  ip: string
}

export interface TargetNode extends BaseNode {
  type: NodeType.Target
  color: string
  ip: string
  label: string
}

export interface MoreNode extends BaseNode {
  type: NodeType.More
  categoryName: string
}

export type GraphNode = CategoryNode | SourceNode | TargetNode | MoreNode

// тип для связей на этапе формирования (в allLinks)
export interface RawLink {
  source: string
  target: string
  color: string
  isCategoryLink: boolean
}

export interface TrafficGraphProps {
  data: TrafficData[]
}

export type GraphRef = ForceGraphMethods<NodeObject<GraphNode>, RawLink>

export interface InitializeGraphDataParams {
  data: TrafficData[]
  graphWidth: number
  graphHeight: number
}

export interface GraphData {
  nodes: GraphNode[]
  links: RawLink[]
}

export interface DrawNodeParams {
  node: GraphNode
  ctx: CanvasRenderingContext2D
  scaleFactor: number
  selectedCategory: string | null
}

export interface DrawNodePointerAreaParams {
  node: GraphNode
  color: string
  ctx: CanvasRenderingContext2D
  scaleFactor: number
}

export interface DrawLinkParams {
  link: LinkObject<NodeObject<GraphNode>, RawLink>
  ctx: CanvasRenderingContext2D
  scaleFactor: number
}
