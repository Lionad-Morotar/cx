import type { Data } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const createItem = (data: Partial<Omit<Data, 'id'>>) => {
  return {
    id: uuidv4(),
    ...data,
  }
}
