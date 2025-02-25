import { AgGridReact } from 'ag-grid-react'
import { theme } from '@consta/ag-grid-adapter/theme'
import { TableGraphProps } from '@/app/projects/[id]/pcap/table/types'
import {
  DEFAULT_COL_DEF,
  filterDataByCategory,
  PAGINATION_PAGE_SIZE,
  TABLE_COLUMN_DEFS,
} from '@/app/projects/[id]/pcap/table/utils'

const TableGraph = ({ category, data }: TableGraphProps) => {
  const categoryData = filterDataByCategory(data, category)

  return (
    <div className="h-full w-full">
      <AgGridReact
        rowData={categoryData}
        columnDefs={TABLE_COLUMN_DEFS}
        defaultColDef={DEFAULT_COL_DEF}
        paginationPageSize={PAGINATION_PAGE_SIZE}
        theme={theme}
        pagination
      />
    </div>
  )
}

export default TableGraph
