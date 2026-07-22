<template>
  <!-- 暂时放一个 div 以便编辑页面选中 -->
  <div :id="cssID" :class="ns.b()" class="min-h-6">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef, computed } from 'vue'

import type { CxComponentRuntime } from '@lionad/cx-definition'
import { useScopedCSS, useCxBEM } from '@lionad/cx-vue'

defineOptions({ name: 'CxUserStyle' })

const props = withDefaults(
  defineProps<{
    cmpt: CxComponentRuntime
    userStyle?: string
  }>(),
  {
    userStyle: '',
  },
)

/** ********************************************************************* 外部状态 */

const ns = useCxBEM('user-style')

// console.log('[info] cmpt', props.cmpt)

/** ********************************************************************* 组件状态 */

const cmptRef = useTemplateRef('cmpt')
const id = `${Date.now()}-${String(Math.random()).slice(-6)}`
const cssID = `is-dynamic-${id}`

useScopedCSS(
  id,
  computed(() => props.userStyle || ''),
  `#is-dynamic-${id}`,
)
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('user-style') {
    /* 静态样式已上提至模板 class */
  }
}
</style>
