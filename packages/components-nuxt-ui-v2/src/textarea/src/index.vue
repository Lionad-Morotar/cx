<template>
  <UTextarea
    ref="cmpt"
    v-bind="attrs"
    v-model="value"
    :class="ns.b()"
    @change="$emit('change', $event)"
    @blur="$emit('blur', $event)"
  />
</template>

<script setup lang="ts">
import { has, safeNum } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed, ref } from 'vue'

import { UTextarea } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxTextarea' })

type UTextareaProps = ComponentProps<typeof UTextarea>

const ns = useCxBEM('textarea')
const inner = defineProps<{
  rows?: number
}>()
const props = useAttrs() as UTextareaProps & {
  cmpt: CxComponentRuntime
}

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const value = ref('')

const attrs = computed(
  () =>
    ({
      placeholder: props.placeholder || '',
      autoresize: has(props.autoresize),
      rows: has(props.autoresize) ? 0 : safeNum(inner.rows, 0),
      maxrows: has(props.autoresize) ? safeNum(props.maxrows, 0) : undefined,
      resize: has(props.resize),
      padded: props.padded === false ? false : true,
      variant: props.variant || 'outline',
      size: props.size,
      color: props.color || 'primary',
    }) as const,
)

defineExpose({})
</script>

<style lang="scss">
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('textarea') {
  }
}
</style>
