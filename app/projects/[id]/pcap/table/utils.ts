import { TableColumnDef, TrafficData } from './types'

export const TABLE_COLUMN_DEFS: TableColumnDef[] = [
  { headerName: 'Источник', field: 'source', sortable: true, filter: true },
  { headerName: 'Цель', field: 'target', sortable: true, filter: true },
  {
    headerName: 'Пакеты',
    field: 'packets',
    sortable: true,
    filter: 'agNumberColumnFilter',
  },
  { headerName: 'Порт', field: 'port', sortable: true, filter: true },
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
