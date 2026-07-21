<template>
  <div :class="[ns.b()]">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useCxBEM } from '@lionad/cx-vue'

defineOptions({ name: 'CxScrollbar' })

const ns = useCxBEM('scrollbar')
</script>

<style lang="scss">
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('scrollbar') {
    overflow: auto;
    // firefox：细滚动条
    scrollbar-width: thin;
    // webkit：自定义滚动条尺寸与样式，替代 el-scrollbar 的视觉
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.25);
      border-radius: 3px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
  }
}
</style>
