import { useMagicKeys } from '@vueuse/core'
import { watchOnce } from '@vueuse/shared'
import { watchEffect, watch } from 'vue'
import { userTeam } from '../../../states/issue-filter'
import { useStandup } from '../../../states/standup'
import { useUserSelectStates } from './states'

import type { User } from '../../../apis'
import type { Props, DefinedEmits } from '../types'

export const useUserSelect = (props: Props, emits: DefinedEmits) => {
  const { curSelection, nextSelection, prevSelection } = useUserSelectStates(props, emits)
  const {
    projectUsers,
    standupAbsentUsers,
    presentUsers,
    standupType,
    firstPresentUser,
    lastPresentUser,
    isAbsent,
    isFirstPresent,
    isLastPresent,
  } = useStandup()

  if (standupType.value === 'week') {
    const stop = watchOnce(presentUsers, () => {
      stop()
      projectUsers.value.unshift(userTeam)
    })
  }
  if (props.absents?.length) {
    watchOnce(presentUsers, () => {
      standupAbsentUsers.value = props.absents || []
    })
  }

  watchEffect(() => {
    if (!curSelection.value) return
    const idx = presentUsers.value.findIndex((x) => String(x.id) === String(curSelection.value!.id))
    const [left, right] = [idx - 1, idx + 1]
    nextSelection.value = presentUsers.value[right] ?? null
    prevSelection.value = presentUsers.value[left] ?? null
  })

  if (props.autoSelect) {
    if (!curSelection.value) {
      if (props.autoSelectDirection === 'first') {
        watchOnce(presentUsers, () => {
          curSelection.value = firstPresentUser.value
        })
      }
      if (props.autoSelectDirection === 'last') {
        watchOnce(presentUsers, () => {
          curSelection.value = lastPresentUser.value
        })
      }
    }
  }

  watchEffect(() => {
    if (props.enableKeyboardControl) {
      const { Ctrl_Alt_ArrowLeft, Ctrl_Alt_ArrowRight } = useMagicKeys()
      watch(
        () => Ctrl_Alt_ArrowLeft?.value,
        (pressed) => pressed && selectPrev(),
      )
      watch(
        () => Ctrl_Alt_ArrowRight?.value,
        (pressed) => pressed && selectNext(),
      )
    }
  })

  const select = (x: User) => (curSelection.value = x)
  const selectNext = () => (curSelection.value = nextSelection.value)
  const selectPrev = () => (curSelection.value = prevSelection.value)

  const states = {
    curSelection,
    nextSelection,
    prevSelection,
    presentUsers,
    isAbsent,
    isFirstPresent: (user: User = curSelection.value!) => isFirstPresent(user),
    isLastPresent: (user: User = curSelection.value!) => isLastPresent(user),
    select,
    selectNext,
    selectPrev,
  }

  return states
}
