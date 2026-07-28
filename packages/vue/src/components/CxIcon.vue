<template>
  <!-- cx 轻量图标：title 悬浮提示用原生 attribute 替代 tooltip 依赖 -->
  <span
    :class="[
      'cx-icon',
      { 'cx-icon--center': center, 'cx-icon--touchable': touchable, 'cx-icon--active': active },
    ]"
    :title="title"
    role="img"
    class="cx-cx-icon" @click="emits('click', $event)"
  >
    <slot>
      <Icon v-if="name" :icon="name" :width="size" :height="size" class="cx-icon__svg" />
    </slot>
  </span>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

/**
 * 物料通用的图标渲染（原为 p-ray 全局组件 p-icon 的 cx 轻量替代）。
 * 视觉差异：tooltip 降级为原生 title 属性。
 */
defineOptions({ name: 'CxCxIcon' })

withDefaults(
  defineProps<{
    name?: string
    size?: string | number
    title?: string
    center?: boolean
    touchable?: boolean
    active?: boolean
  }>(),
  { size: 16 },
)

const emits = defineEmits(['click'])
</script>

<style scoped>
.cx-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.cx-icon--touchable {
  cursor: pointer;
}
.cx-icon--active {
  color: var(--cx-primary, #3b82f6);
}
</style>
