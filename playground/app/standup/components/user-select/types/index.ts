import { useUserSelectStates } from '../states'
import type { User, Users } from '../../../apis'
import type { ComponentEmits } from '@lionad/cx-definition'

export type Props = {
  use: typeof useUserSelectStates
  user?: User | null
  nextUser?: User | null
  prevUser?: User | null
  absents?: Users
  autoSelect?: boolean
  autoSelectDirection?: 'first' | 'last'
  enableKeyboardControl?: boolean
}

export type Emits = {
  'update:user': [x: User | null]
  'update:next-user': [x: User | null]
  'update:prev-user': [x: User | null]
}

export type DefinedEmits = ComponentEmits<Emits>
