<template>
  <URange
    ref="cmpt"
    v-model="value"
    :class="ns.b()"
    v-bind="attrs"
    @change="$emit('change', $event)"
  />
</template>

<script setup lang="ts">
import { safeNum } from '@lionad/cx-definition'

import { useAttrs , useTemplateRef, computed, ref} from 'vue'

import { URange } from '../../../../vendor/bridge'

import { isBoolean } from 'lodash-es'
import { useCxSlot , useCxBEM} from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxMeter' })

type USliderProps = ComponentProps<typeof URange>

const ns = useCxBEM('range')
const inner = defineProps<{
  min?: number | string
  max?: number | string
  step?: number | string
}>()
const props = useAttrs() as USliderProps & {
  cmpt: CxComponentRuntime
}
// console.log('[info] cmpt range -> ', props, inner)

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const value = ref(0)

const attrs = computed(() => ({
  min: safeNum(inner.min, 0),
  max: safeNum(inner.max, 100),
  step: safeNum(inner.step, 1),
  disabled: isBoolean(props.disabled) ? props.disabled : false,
  size: props.size,
  color: props.color
} as const))

defineExpose({})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('range') {
  }
}
</style>
