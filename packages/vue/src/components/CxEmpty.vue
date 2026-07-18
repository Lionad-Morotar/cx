<template>
  <!-- 空态占位（原为 p-ray p-empty 的 cx 轻量替代；el-empty 降级为纯样式实现） -->
  <div :class="['cx-empty', { 'cx-empty--loading': loading }]">
    <slot name="icon">
      <span class="cx-empty__icon">∅</span>
    </slot>
    <slot name="text">
      <p class="cx-empty__tip">{{ text }}</p>
    </slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CxEmpty' })

withDefaults(
  defineProps<{
    text?: string
    loading?: boolean
  }>(),
  { text: '暂无数据' },
)
</script>

<style scoped>
.cx-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  color: #9ca3af;
}
.cx-empty__icon {
  font-size: 24px;
  line-height: 1;
}
.cx-empty__tip {
  margin: 0;
  font-size: 12px;
}
.cx-empty--loading .cx-empty__icon {
  animation: cx-empty-spin 1s linear infinite;
}
@keyframes cx-empty-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
