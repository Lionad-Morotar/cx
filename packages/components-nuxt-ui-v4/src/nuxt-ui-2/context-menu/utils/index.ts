import type { ActionItem } from '../types'
import { v4 as uuidv4 } from 'uuid'

type Item = Omit<ActionItem, 'id'> & { id?: string }

export const createItem = (item: Item) => {
  return {
    id: item.id || uuidv4(),
    label: item.label || '',
    icon: item.icon || ''
  }
}
