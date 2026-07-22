<template>
  <UCard ref="cmpt" :class="ns.b()">
    <template #header>
      <slot name="header" />
    </template>
    <template #default>
      <slot name="default" />
    </template>
    <template #footer>
      <slot name="footer" />
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { useAttrs, useTemplateRef, computed } from 'vue'

import { useCxBEM } from '@lionad/cx-vue'

import { UCard } from '../../../vendor/bridge'

import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxCard' })

type UCardProps = ComponentProps<typeof UCard>

const ns = useCxBEM('card')
const inner = defineProps<{}>()
const props = useAttrs() as UCardProps & {
  cmpt: CxComponentRuntime
}

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('card') {
    display: grid;
    grid-template: auto minmax(0, 1fr) auto / auto;

    > div:nth-child(2) {
      overflow: hidden auto;
    }
  }
}
</style>
