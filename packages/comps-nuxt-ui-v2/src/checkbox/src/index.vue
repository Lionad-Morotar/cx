<template>
  <UCheckbox
    ref="comp"
    v-model="value"
    :class="ns.b()"
    :color="props.color"
    :required="has(props.required)"
    :disabled="has(props.disabled)"
    @change="$emit('change', $event)"
  >
    <template #label="x">
      <slot v-if="showSlot('label')" name="label" v-bind="x" />
      <span v-else>{{ props.label }}</span>
    </template>
    <template #help="x">
      <slot v-if="showSlot('help')" name="help" v-bind="x" />
      <span v-else>{{ props.help }}</span>
    </template>
  </UCheckbox>
</template>

<script setup lang="ts">
import { has } from '@lionad/cx-definition'
import { useAttrs, useTemplateRef, ref } from 'vue'

import { UCheckbox } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxCheckbox' })

type UCheckboxProps = ComponentProps<typeof UCheckbox>

const ns = useCxBEM('checkbox')
const inner = defineProps<{}>()
const props = useAttrs() as UCheckboxProps & {
  comp: CxComponentRuntime
}
const { showSlot } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')
const value = ref(false)
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('checkbox') {
    // ...
  }
}
</style>
