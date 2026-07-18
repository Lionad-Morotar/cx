<template>
  <template v-if="type === 'none'">
    <slot v-if="not(value)" />
  </template>
  <template v-else-if="type === 'hide'">
    <slot v-if="not(value)" />
  </template>
  <template v-else-if="type === 'for'">
    <template v-for="i in value">
      <slot v-bind="{ index: i, length: value }" />
    </template>
  </template>
</template>

<script setup lang="ts">
import { not } from '@lionad/cx-definition'
import { safeNum } from '@lionad/cx-definition'

import { computed } from 'vue'

import type { CxComponentRuntime } from '@lionad/cx-definition'

defineOptions({ name: 'CxLogic' })

const props = withDefaults(
  defineProps<{
    cmpt: CxComponentRuntime
    type?: 'none' | 'hide' | 'for'
    value?: number | string
    dangerLoop?: boolean
  }>(),
  {
    type: 'none',
    value: 0,
    dangerLoop: false,
  },
)

const value = computed(() => {
  const dftLoop = 100
  const num = safeNum(props.value)
  if (!props.dangerLoop && num > dftLoop) {
    console.warn('[info] loop counts too large:', num, 'will be reset to ' + dftLoop)
    return dftLoop
  }
  return num
})
</script>
