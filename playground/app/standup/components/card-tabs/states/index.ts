import { tryOnMounted } from '@vueuse/core'
import { useState } from '../../../hooks'

import type { Ref } from 'vue'
import type { Props, DefinedEmits, Tab } from '../types'

export type CardTabsStates = {
  selected: Ref<string>
}

export const useCardTabsStates = (props: Props, emits: DefinedEmits): CardTabsStates => {
  return props.use
    ? props.use(props, emits)
    : {
        selected: useState(props, 'modelValue', emits, {
          defaultValue: '',
        }),
      }
}

export const useCardTabs = (props: Props, emits: DefinedEmits) => {
  const { selected } = useCardTabsStates(props, emits)
  const select = (tab?: Tab) => {
    if (!tab || tab.disabled) return
    selected.value = tab.value
  }
  const isSelected = (tab?: Tab) => {
    return tab && tab.value === selected.value
  }
  const isDisabled = (tab?: Tab) => {
    return tab && tab.disabled
  }
  if (props.isAutoSelect) {
    tryOnMounted(() => {
      const firstTab = props.tabs.find((tab) => !tab.disabled)
      if (firstTab) {
        selected.value = firstTab.value
      }
    })
  }
  return {
    selected,
    isSelected,
    isDisabled,
    select,
  }
}
