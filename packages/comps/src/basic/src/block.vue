<template>
  <div :class="ns.b()" class="relative min-h-6">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useCxBEM } from '@lionad/cx-vue'

defineOptions({ name: 'CxBlock' })

const ns = useCxBEM('block')

// const datas = inject('cx-datas', {})
// console.log('datas', datas)
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('block') {
    /* 静态样式已上提至模板 class */
  }
}
</style>
