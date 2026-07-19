import { v4 as uuidv4 } from 'uuid'
export const createItem = ({ label, content }: { label: string; content: string }) => {
  return {
    id: uuidv4(),
    label,
    content,
  }
}
