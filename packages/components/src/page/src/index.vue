<template>
  <main :class="ns.b()">
    <slot name="content-start" />
    <slot name="default" />
    <slot name="content" />
    <slot name="content-end" />
  </main>
</template>

<script setup lang="ts">
import { useCxBEM } from '@lionad/cx-vue'

defineOptions({ name: 'CxPage' })

const ns = useCxBEM('page')
const props = withDefaults(defineProps<{}>(), {})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('page') {
    width: 100%;
    height: 100%;
    overflow: hidden auto;

    & > :deep(.el-empty) {
      height: 95%;
    }
  }
}
</style>
