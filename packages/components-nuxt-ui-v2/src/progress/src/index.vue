<template>
  <UProgress ref="cmpt" :class="ns.b()" v-bind="attrs">
    <template v-for="(_, name) in $slots" #[name]="x">
      <slot v-if="showSlot(name)" :name="name as unknown as string" v-bind="x" />
    </template>
  </UProgress>
</template>

<script setup lang="ts">
import { safeNum } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed } from 'vue'

import { UProgress } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import type { Item } from '../types'

defineOptions({ name: 'CxProgress' })

type UProgressProps = ComponentProps<typeof UProgress>

const ns = useCxBEM('progress')

const emits = defineEmits(['update:value'])
const inner = defineProps<{
  max?: number | string
}>()
const props = useAttrs() as UProgressProps & {
  cmpt: CxComponentRuntime
  type?: 'number' | 'label'
  maxItems?: Item[]
}
// console.log('[info] cmpt progress -> ', props, inner)

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const attrs = computed(
  () =>
    ({
      value: props.value == null ? undefined : safeNum(props.value, 0),
      max:
        props.type === 'number'
          ? safeNum(inner.max, 100)
          : props.type === 'label'
            ? (props.maxItems || []).map((x) => x.label)
            : undefined,
      size: props.size,
      color: props.color,
      animation: props.animation || 'carousel',
    }) as const,
)

defineExpose({})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('progress') {
  }
}
</style>
