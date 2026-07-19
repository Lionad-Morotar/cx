import { useState } from '../../../hooks'

import type { Ref } from 'vue'
import type { User } from '../../../apis'
import type { Props, DefinedEmits } from '../types'

export type UserSelectStates = {
  curSelection: Ref<User | null>
  nextSelection: Ref<User | null>
  prevSelection: Ref<User | null>
}

export const useUserSelectStates = (props: Props, emits: DefinedEmits): UserSelectStates => {
  return props.use
    ? props.use(props, emits)
    : {
        curSelection: useState(props, 'user', emits),
        nextSelection: useState(props, 'nextUser', emits),
        prevSelection: useState(props, 'prevUser', emits),
      }
}
