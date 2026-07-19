import { useCardTabsStates } from '../states'
import type { ComponentEmits } from '@lionad/cx-definition'

export type Tab = {
  // 标签页名称
  name: string
  // 标签页唯一码
  key: string
  // 选中时值
  value: string
  disabled?: boolean
}

export type Props = {
  use: typeof useCardTabsStates
  modelValue?: string
  tabs: Tab[]
  isAutoSelect?: boolean
}

export type Emits = {
  'update:modelValue': [x: string]
}

export type DefinedEmits = ComponentEmits<Emits>
