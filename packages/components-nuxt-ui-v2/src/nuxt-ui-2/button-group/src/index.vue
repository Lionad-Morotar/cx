<template>
  <!-- cx-button-group：包装 vendored UButtonGroup，default slot 透传子按钮；
       UButtonGroup 通过 useProvideButtonGroup 向子按钮注入尺寸/方向/圆角上下文 -->
  <UButtonGroup
    ref="cmpt"
    :class="ns.b()"
    :orientation="props.orientation"
    :size="props.size"
  >
    <slot />
  </UButtonGroup>
</template>

<script setup lang="ts">
import { useAttrs, useTemplateRef } from 'vue'

import { UButtonGroup } from '../../../../vendor/bridge'

import { useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxButtonGroup' })

type UButtonGroupProps = ComponentProps<typeof UButtonGroup>

const ns = useCxBEM('button-group')
const props = useAttrs() as UButtonGroupProps & {
  cmpt: CxComponentRuntime
}
const cmptRef = useTemplateRef('cmpt')
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('button-group') {
    // 样式继承自 vendored UButtonGroup 的 Tailwind class
  }
}
</style>
