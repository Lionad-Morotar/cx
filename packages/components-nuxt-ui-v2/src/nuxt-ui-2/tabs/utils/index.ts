import { v4 as uuidv4 } from 'uuid'
export const createTab = (name: string) => {
  return {
    name,
    value: uuidv4(),
  }
}
