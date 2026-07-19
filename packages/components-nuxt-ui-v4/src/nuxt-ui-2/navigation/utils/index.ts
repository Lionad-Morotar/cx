import type { Item } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const createItem = (label: string) => {
  return {
    label,
    value: uuidv4()
  } as Item
}
