import { TableColumnDef, TrafficData } from './types'

export const TABLE_COLUMN_DEFS: TableColumnDef[] = [
  { headerName: 'Source', field: 'source', sortable: true, filter: true },
  { headerName: 'Target', field: 'target', sortable: true, filter: true },
  {
    headerName: 'Packets',
    field: 'packets',
    sortable: true,
    filter: 'agNumberColumnFilter',
  },
  { headerName: 'Port', field: 'port', sortable: true, filter: true },
]

export const DEFAULT_COL_DEF = {
  flex: 1,
  minWidth: 100,
}

export const PAGINATION_PAGE_SIZE = 20

export const filterDataByCategory = (
  data: TrafficData[],
  category: string,
): TrafficData[] => {
  return data.filter((item) => item.category === category)
}
