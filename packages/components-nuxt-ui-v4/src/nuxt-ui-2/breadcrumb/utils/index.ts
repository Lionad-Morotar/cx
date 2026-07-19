import { v4 as uuidv4 } from 'uuid'
export const createItem = ({ label, icon }: { label: string; icon: string }) => {
  return {
    id: uuidv4(),
    label,
    icon,
  }
}
