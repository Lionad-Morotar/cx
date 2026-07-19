import { tryOnMounted } from '@vueuse/core'
import { useState } from '../../../hooks'

import type { Ref } from 'vue'
import type { Props, DefinedEmits } from '../types'

export type States = {
  // todo
}

export const useFolderContainerStates = (props: Props, emits: DefinedEmits): States => {
  return props.use
    ? props.use(props, emits)
    : {
        // todo
      }
}

export const useFolderContainer = (props: Props, emits: DefinedEmits) => {
  useFolderContainerStates(props, emits)
  tryOnMounted(() => {})
  return {}
}
