import { ColDef } from 'ag-grid-community'

export type TrafficData = {
  source: string
  target: string
  category: string
  packets: number
  port: number
}

export interface TableGraphProps {
  category: string
  data: TrafficData[]
}

export type TableColumnDef = ColDef<TrafficData>
