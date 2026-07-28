<template>
  <!-- 图片空态占位（原为 p-ray p-empty-image 的 cx 轻量替代） -->
  <div class="cx-cx-empty-image cx-empty-image">
    <slot>
      <span class="cx-empty-image__label">{{ text }}</span>
    </slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'CxCxEmptyImage' })

withDefaults(
  defineProps<{
    text?: string
  }>(),
  { text: '暂无图片' },
)
</script>

<style scoped>
.cx-empty-image {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 80px;
  border: 1px dashed #d1d5db;
  border-radius: 4px;
  background: #f9fafb;
  color: #9ca3af;
}
.cx-empty-image__label {
  font-size: 12px;
}
</style>
