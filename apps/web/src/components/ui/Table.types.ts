export interface TableColumn<T = Record<string, unknown>> {
  key: string
  label: string
  sortable?: boolean
  width?: string
  class?: string
  format?: (value: unknown, row: T) => string
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<any>[]
  rows: T[]
  rowKey?: string
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
  rowClickable?: boolean
  emptyText?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  onPageChange?: (page: number) => void
}