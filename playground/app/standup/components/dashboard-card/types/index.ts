import { useDashboardCardStates } from '../states'
import type { ComponentEmits } from '@lionad/cx-definition'

export type Props = {
  use: typeof useDashboardCardStates
  title: string
  sideTitle?: string
  themeColor: string
  fullContent: boolean
  isLoading: boolean
}

export type Emits = {
  // empty placeholder
}

export type DefinedEmits = ComponentEmits<Emits>
