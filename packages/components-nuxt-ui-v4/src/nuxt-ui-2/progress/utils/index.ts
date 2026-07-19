import type { Item } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const createItem = ({ label }: Omit<Item, 'id'>) => {
  return {
    id: uuidv4(),
    label
  }
}
