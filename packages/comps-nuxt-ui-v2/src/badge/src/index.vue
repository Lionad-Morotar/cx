<template>
  <UBadge
    ref="comp"
    :class="ns.b()"
    :ui="ui"
    :size="props.size || 'sm'"
    :variant="props.variant"
    :color="props.color"
  >
    <template #leading>
      <slot v-if="showSlot('leading')" name="leading" />
      <span v-else>{{ inner.prefix || '' }}</span>
    </template>
    <template #default>
      <slot v-if="showSlot('default')" name="default" />
      <span v-else>{{ props.label || '' }}</span>
    </template>
    <template #trailing>
      <slot v-if="showSlot('trailing')" name="trailing" />
      <span v-else>{{ props.postfix || '' }}</span>
    </template>
  </UBadge>
</template>

<script setup lang="ts">
import { useAttrs, useTemplateRef, computed } from 'vue'

import { UBadge } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxBadge' })

type UBadgeProps = ComponentProps<typeof UBadge>

const ns = useCxBEM('badge')
const inner = defineProps<{
  // 如果不捕获的话会自动被 badge 捕获并当做 attrs 绑定到 DOM 上，但是 DOM 不能绑定一些特定字符的 prefix
  prefix?: string
}>()
const props = useAttrs() as UBadgeProps & {
  comp: CxComponentRuntime
  round?: boolean
  postfix?: string
}
const { showSlot } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')
const ui = computed(() => (props.round ? { rounded: 'rounded-full' } : {}))
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('badge') {
    // ...
  }
}
</style>
