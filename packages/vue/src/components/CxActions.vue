<template>
  <!-- 动作按钮组（原为 p-ray p-actions 的 cx 轻量替代；u-button/u-separator 降级为原生元素） -->
  <div class="cx-actions">
    <template v-for="(group, idx) in actions" :key="idx">
      <button
        v-for="button in group"
        :key="button.label"
        type="button"
        class="cx-actions__button"
        @click="emits('click', button)"
      >
        {{ button.label }}
      </button>
      <span v-if="idx < actions.length - 1" class="cx-actions__separator" />
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * 兼容 dropdown-menu actions 字段的按钮组。
 * actions 为分组数组，组间渲染分隔符。
 */
defineOptions({ name: 'CxActions' })

withDefaults(
  defineProps<{
    actions?: Array<Array<{ label: string; [key: string]: any }>>
  }>(),
  { actions: () => [] },
)

const emits = defineEmits(['click'])
</script>

<style scoped>
.cx-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.cx-actions__button {
  padding: 2px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}
.cx-actions__button:hover {
  background: #f3f4f6;
}
.cx-actions__separator {
  width: 1px;
  height: 14px;
  background: #e5e7eb;
}
</style>
