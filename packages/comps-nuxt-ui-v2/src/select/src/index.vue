<template>
  <template v-if="isReRendering">
    <div :class="ns.e('placeholder-box')" :style="size" />
  </template>
  <USelect
    v-else
    ref="comp"
    v-bind="attrs"
    v-model="value"
    :class="ns.b()"
    :items="options"
    label-key="label"
    value-key="value"
    @change="$emit('change', $event)"
  >
    <template v-if="safeIcon(inner.icon) || showSlot('leading')" #leading="x">
      <slot v-if="showSlot('leading')" name="leading" v-bind="x" />
      <CxIcon
        v-else-if="props.loading"
        name="i-heroicons-arrow-path-20-solid"
        class="animate-spin"
      />
      <CxIcon v-else :name="safeIcon(inner.icon)" />
    </template>
    <template #trailing="x">
      <slot v-if="showSlot('trailing')" name="trailing" v-bind="x" />
    </template>
  </USelect>
</template>

<script setup lang="ts">
import { CxIcon } from '@lionad/cx-vue'
import { useAttrs, useTemplateRef, computed, ref } from 'vue'

import { USelect } from '../../../vendor/bridge'

import { useCxSlot, useCxReRender, useCxBEM, safeIcon } from '@lionad/cx-vue'
import type { Placement } from '@popperjs/core'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxSelect' })

type USelectProps = ComponentProps<typeof USelect>

const ns = useCxBEM('select')
const inner = defineProps<{
  icon?: string
  trailingIcon?: string
}>()
const props = useAttrs() as USelectProps & {
  comp: CxComponentRuntime
  dftValue?: string
  direction?: Placement
}

const { showSlot } = useCxSlot(props.comp)

const compRef: any = useTemplateRef('comp')
const ui = computed(() => {})

const value = ref(props.dftValue || '')

const options = computed(() => {
  return props.options || []
})

const attrs = computed(
  () =>
    ({
      class: (props as any).class,
      icon: safeIcon(inner.icon),
      trailingIcon: safeIcon(inner.trailingIcon) || 'i-heroicons-chevron-down-20-solid',
      placeholder: props.placeholder || '',
      loading: props.loading || false,
      disabled: props.disabled || false || props.loading,
      padded: props.padded === false ? false : true,
      variant: props.variant || 'outline',
      size: props.size,
      color: props.color,
      // popper: { placement: props.direction || 'bottom' }
    }) as const,
)

const { isReRendering, size } = useCxReRender(compRef, () => props.direction)

defineExpose({})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('select') {
  }
}
</style>
