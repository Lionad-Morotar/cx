import type { Item, GroupItem } from '../types'
import { v4 as uuidv4 } from 'uuid'

export const createItem = ({ id, label }: Item) => {
  return {
    id: id || uuidv4(),
    label,
  }
}

export const createGroupItem = ({ label, key, commands }: GroupItem) => {
  return {
    key,
    label,
    commands: commands || [],
  }
}
