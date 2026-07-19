export type Sort = ('' | 'desc' | 'asc')[]

export type Column = {
  key: string
  name: string
  kls?: (x: any) => string
  title?: (x: any) => string
  sort?: Sort
}

export type Columns = Column[]

export type SelectedSort = { column: Column; sort: string } | null
