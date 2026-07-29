// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
export interface TableRow {
  [key: string]: any
}

export interface TableColumn {
  key: string
  sortable?: boolean
  sort?: (a: any, b: any, direction: 'asc' | 'desc') => number
  direction?: 'asc' | 'desc'
  class?: string
  rowClass?: string
  [key: string]: any
}

export interface Expanded<T> {
  openedRows: T[]
  row: T | null
}
