<template>
  <UChip
    ref="cmpt"
    :class="ns.b()"
    :color="props.color"
    :size="props.size"
    :position="props.position || 'top-right'"
    :text="props.text || ''"
    :show="props.show === false ? false : true"
    :inset="props.inset || false"
  >
    <template #default="x">
      <slot name="default" v-bind="x" />
    </template>
    <template v-if="showSlotContent" #content="x">
      <slot name="content" v-bind="x" />
    </template>
  </UChip>
</template>

<script setup lang="ts">
import { useAttrs, computed, useTemplateRef } from 'vue'

import { useCxBEM } from '@lionad/cx-vue'

import { UChip } from '../../../vendor/bridge'

import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxChip' })

type UChipProps = ComponentProps<typeof UChip>

const ns = useCxBEM('chip')
const inner = defineProps<{}>()
const props = useAttrs() as UChipProps & {
  cmpt: CxComponentRuntime
}
const showSlotContent = computed(() => props.cmpt?.components?.['content']?.length)

const cmptRef = useTemplateRef('cmpt')
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('chip') {
    // ...
  }
}
</style>
