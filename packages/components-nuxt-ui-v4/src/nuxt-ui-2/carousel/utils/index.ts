import { v4 as uuidv4 } from 'uuid'
export const createItem = ({ content }: { content: string }) => {
  return {
    id: uuidv4(),
    content
  }
}
