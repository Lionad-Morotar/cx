<template>
  <div :class="[ns.b()]" />
</template>

<script setup lang="ts">
import { useCxBEM } from '@lionad/cx-vue'

defineOptions({ name: 'CxSkeleton' })

const ns = useCxBEM('skeleton')
</script>

<style lang="scss">
.cx-skeleton {
  position: absolute;
  inset: 0;
  z-index: 10;
  // shimmer 动画：替代 ElSkeleton 的 animated 骨架
  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.06) 25%,
    rgba(0, 0, 0, 0.12) 37%,
    rgba(0, 0, 0, 0.06) 63%
  );
  background-size: 400% 100%;
  animation: cx-skeleton-shimmer 1.4s ease infinite;
}

@keyframes cx-skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
