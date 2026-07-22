<template>
  <template v-if="isReRendering">
    <div :class="ns.e('placeholder-box')" :style="size" />
  </template>
  <UInputMenu
    v-else
    ref="cmpt"
    v-bind="attrs"
    v-model="value"
    v-model:query="query"
    :class="ns.b()"
    :options="options"
    value-key="label"
    label-key="label"
    @open="$emit('open')"
    @close="$emit('close')"
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
    <template v-for="(_, name) in useOmit($slots, ['leading'])" #[name]="x">
      <slot v-if="showSlot(name)" :name="name as unknown as string" v-bind="x" />
    </template>
  </UInputMenu>
</template>

<script setup lang="ts">
import { CxIcon } from '@lionad/cx-vue'
import { omit as useOmit } from 'lodash-es'
import { useAttrs, useTemplateRef, computed, ref } from 'vue'

import { UInputMenu } from '../../../vendor/bridge'

import { useCxSlot, useCxReRender, useCxBEM, safeIcon } from '@lionad/cx-vue'
import type { Placement } from '@popperjs/core'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxInputMenu' })

type UInputMenuProps = ComponentProps<typeof UInputMenu>

const ns = useCxBEM('input-menu')
const inner = defineProps<{
  icon?: string
  trailingIcon?: string
}>()
const props = useAttrs() as UInputMenuProps & {
  cmpt: CxComponentRuntime
  dftValue?: string
  dftQuery?: string
  direction?: Placement
}

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef: any = useTemplateRef('cmpt')
const ui = computed(() => {})

const value = ref(props.dftValue || '')
const query = ref(props.dftQuery || '')

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
      popper: { placement: props.direction || 'bottom' },
    }) as const,
)

const { isReRendering, size } = useCxReRender(cmptRef, () => props.direction)

defineExpose({})
</script>

<style lang="scss">
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('input-menu') {
  }
}
</style>
