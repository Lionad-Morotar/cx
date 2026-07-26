<template>
  <UKbd ref="comp" :class="ns.b()" v-bind="attrs">
    <template v-if="showSlot('default')" #default="x">
      <slot name="default" v-bind="x" />
    </template>
  </UKbd>
</template>

<script setup lang="ts">
import { useAttrs, useTemplateRef, computed } from 'vue'

import { UKbd } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxKbd' })

type UKbdProps = ComponentProps<typeof UKbd>

const ns = useCxBEM('kbd')

const emits = defineEmits(['update:value'])
const inner = defineProps<{}>()
const props = useAttrs() as UKbdProps & {
  comp: CxComponentRuntime
}

const { showSlot } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')
const ui = computed(() => {})

const attrs = computed(
  () =>
    ({
      value: props.value,
      size: props.size,
    }) as const,
)

defineExpose({})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('kbd') {
  }
}
</style>
