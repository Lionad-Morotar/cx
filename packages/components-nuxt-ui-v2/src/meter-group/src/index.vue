<template>
  <!-- cx-meter-group：包装 vendored UMeterGroup，default slot 透传子 UMeter；
       UMeterGroup 在 setup 顶层要求 default slot 存在（否则抛错），故子项为必填 -->
  <UMeterGroup
    ref="cmpt"
    :class="ns.b()"
    :min="safeNum(props.min, 0)"
    :max="safeNum(props.max, 100)"
    :size="props.size"
    :indicator="props.indicator"
  >
    <slot />
  </UMeterGroup>
</template>

<script setup lang="ts">
import { safeNum } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef } from 'vue'

import { UMeterGroup } from '../../../vendor/bridge'

import { useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxMeterGroup' })

type UMeterGroupProps = ComponentProps<typeof UMeterGroup>

const ns = useCxBEM('meter-group')
const props = useAttrs() as UMeterGroupProps & {
  cmpt: CxComponentRuntime
}
const cmptRef = useTemplateRef('cmpt')
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('meter-group') {
    // 样式继承自 vendored UMeterGroup 的 Tailwind class
  }
}
</style>
