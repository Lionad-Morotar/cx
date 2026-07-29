<template>
  <UBreadcrumb
    ref="comp"
    :class="ns.b()"
    :links="props.links || []"
    :divider="props.divider || '/'"
  >
    <template v-if="showSlotDefault" #default="x">
      <slot name="default" v-bind="x" />
    </template>
    <template v-if="showSlotDivider" #divider="x">
      <slot name="divider" v-bind="x" />
    </template>
    <template v-if="showSlotIcon" #icon="x">
      <slot name="icon" v-bind="x" />
    </template>
  </UBreadcrumb>
</template>

<script setup lang="ts">
import { useAttrs, computed, useTemplateRef } from 'vue'

import { useCxBEM } from '@lionad/cx-vue'

import { UBreadcrumb } from '../../../vendor/bridge'

import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxBreadcrumb' })

type UBadgeProps = ComponentProps<typeof UBreadcrumb>

const ns = useCxBEM('breadcrumb')
const inner = defineProps<{}>()
const props = useAttrs() as UBadgeProps & {
  comp: CxComponentRuntime
}
const showSlotDefault = computed(() => props.comp?.components?.['default']?.length)
const showSlotDivider = computed(() => props.comp?.components?.['divider']?.length)
const showSlotIcon = computed(() => props.comp?.components?.['icon']?.length)

const compRef = useTemplateRef('comp')
const ui = computed(() => {})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('breadcrumb') {
    // ...
  }
}
</style>
