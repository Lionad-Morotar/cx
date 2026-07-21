<template>
  <UInput
    ref="cmpt"
    v-bind="attrs"
    v-model="value"
    :class="ns.b()"
    @change="$emit('change', $event)"
    @blur="$emit('blur', $event)"
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
    <template v-if="showSlot('trailing')" #trailing="x">
      <slot name="trailing" v-bind="x" />
    </template>
  </UInput>
</template>

<script setup lang="ts">
import { CxIcon } from '@lionad/cx-vue'
import { has } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed, ref } from 'vue'

import { UInput } from '../../../../vendor/bridge'

import { useCxSlot, useCxBEM, safeIcon } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxInput' })

type UInputProps = ComponentProps<typeof UInput>

const ns = useCxBEM('input')
const inner = defineProps<{
  icon?: string
  type?: UInputProps['type']
}>()
const props = useAttrs() as UInputProps & {
  cmpt: CxComponentRuntime
  dftQuery?: string
}

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const value = ref(props.dftQuery || '')

const attrs = computed(
  () =>
    ({
      icon: safeIcon(inner.icon),
      type: inner.type || 'text',
      placeholder: props.placeholder || '',
      loading: has(props.loading) || false,
      disabled: has(props.loading) ? true : has(props.disabled),
      padded: props.padded === false ? false : true,
      variant: props.variant || 'outline',
      size: props.size,
      color: props.color,
    }) as const,
)

defineExpose({})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('input') {
  }
}
</style>
