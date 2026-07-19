import { useFolderContainerStates } from '../states'
import type { ComponentEmits } from '@lionad/cx-definition'

export type Props = {
  use: typeof useFolderContainerStates
}

export type Emits = {
  // empty
}

export type DefinedEmits = ComponentEmits<Emits>
