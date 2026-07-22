<template>
  <template v-if="isReRendering">
    <div :class="ns.e('placeholder-box')" :style="size" />
  </template>
  <button v-else ref="cmpt" :class="ns.b()" class="flex">
    <UToggle v-model="value" v-bind="attrs" @change="$emit('change', $event)" />
  </button>
</template>

<script setup lang="ts">
import { has } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed, ref } from 'vue'

import { UToggle } from '../../../vendor/bridge'

import { useCxSlot, useCxReRender, useCxBEM, safeIcon } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxToggle' })

type USwitchProps = ComponentProps<typeof UToggle>

const ns = useCxBEM('toggle')
const inner = defineProps<{}>()
const props = useAttrs() as USwitchProps & {
  cmpt: CxComponentRuntime
  dftValue?: boolean
}

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const value = ref(has(props.dftValue))

const attrs = computed(
  () =>
    ({
      onIcon: safeIcon(props.onIcon),
      offIcon: safeIcon(props.offIcon),
      loading: has(props.loading) || false,
      disabled: has(props.loading) ? true : has(props.disabled),
      size: props.size,
      color: props.color,
    }) as const,
)

const { isReRendering, size } = useCxReRender(cmptRef, () => {
  return [
    // props.dftValue,
  ]
})

defineExpose({})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('toggle') {
  }
}
</style>
