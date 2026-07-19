import type { Item } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const createItem = ({ label, value }: Omit<Item, 'id'>) => {
  return {
    id: uuidv4(),
    label,
    value: value || label
  }
}
