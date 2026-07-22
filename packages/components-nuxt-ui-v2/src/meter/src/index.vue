<template>
  <UMeter ref="cmpt" :class="ns.b()" v-bind="attrs">
    <!-- ignored, we patched nuxt-ui v2 -->
    <!-- @vue-ignore -->
    <template v-if="attrs.icon || showSlot('icon')" #icon="x">
      <slot v-if="showSlot('icon')" name="label" v-bind="x" />
      <CxIcon v-else :name="attrs.icon" />
    </template>
    <template v-if="showSlot('label')" #label="x">
      <slot name="label" v-bind="x" />
    </template>
    <template v-if="showSlot('indicator')" #indicator="x">
      <slot name="indicator" v-bind="x" />
    </template>
  </UMeter>
</template>

<script setup lang="ts">
import { CxIcon } from '@lionad/cx-vue'
import { safeNum } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed } from 'vue'

import { UMeter } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM, safeIcon } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxMeter' })

type UMeterProps = ComponentProps<typeof UMeter>

const ns = useCxBEM('meter')

const emits = defineEmits(['update:value'])
const inner = defineProps<{
  value?: number | string
  min?: number | string
  max?: number | string
  icon?: string
}>()
const props = useAttrs() as UMeterProps & {
  cmpt: CxComponentRuntime
  label?: string
}
// console.log('[info] cmpt meter -> ', props, inner)

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const attrs = computed(
  () =>
    ({
      value: safeNum(inner.value, 0),
      min: safeNum(inner.min, 0),
      max: safeNum(inner.max, 100),
      icon: safeIcon(inner.icon) || '',
      label: props.label || '',
      size: props.size,
      color: props.color,
    }) as const,
)

defineExpose({})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('meter') {
  }
}
</style>
