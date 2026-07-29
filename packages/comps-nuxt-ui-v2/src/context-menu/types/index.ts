export type ActionItem = {
  id: string
  label: string
  icon?: string
  click?: (row: any) => void
}

export type Action = ActionItem & {
  actions?: (row: any) => Action[] | Action[][]
}
