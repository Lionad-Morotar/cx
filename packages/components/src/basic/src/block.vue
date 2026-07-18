<template>
  <div :class="[ns.b()]">
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
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('block') {
    @apply relative min-h-6;
  }
}
</style>
