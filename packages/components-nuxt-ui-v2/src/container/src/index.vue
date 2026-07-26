<template>
  <UContainer ref="comp" :class="ns.b()">
    <template #default>
      <slot v-if="showSlot('default')" name="default" />
      <CxEmptyImage v-else="showDefault()" />
    </template>
  </UContainer>
</template>

<script setup lang="ts">
import { CxEmptyImage, CxEmpty } from '@lionad/cx-vue'
import { useAttrs, useTemplateRef, computed } from 'vue'

import { UContainer } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxContainer' })

type UContainerProps = ComponentProps<typeof UContainer>

const ns = useCxBEM('container')
const inner = defineProps<{}>()
const props = useAttrs() as UContainerProps & {
  comp: CxComponentRuntime
}
const { showSlot, showDefault } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')
const ui = computed(() => {})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('container') {
    // ...
  }
}
</style>
