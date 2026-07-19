<template>
  <!-- 动作按钮组（原为 p-ray p-actions 的 cx 轻量替代；u-button/u-separator 降级为原生元素） -->
  <div class="cx-actions">
    <template
      v-for="(group, idx) in groupedActions"
      :key="idx"
    >
      <button
        v-for="button in group"
        :key="button.label"
        type="button"
        class="cx-actions__button"
        @click="onClick($event, button)"
      >
        {{ button.label }}
      </button>
      <span
        v-if="idx < groupedActions.length - 1"
        class="cx-actions__separator"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 动作按钮组：兼容 dropdown-menu actions 字段（单组或分组数组，自动归一）。
 * 原版为 p-ray 全局组件 p-actions；视觉差异：u-button/u-separator 降级为原生元素。
 */
defineOptions({ name: 'CxActions' })

const emits = defineEmits(['after-click', 'hover', 'unhover'])

const props = withDefaults(
  defineProps<{
    actions?: any[]
  }>(),
  { actions: () => [] }
)

const groupedActions = computed(() => {
  const acts = props.actions
  const isGroup = acts?.[0]?.[0]
  const ret = isGroup ? acts : [acts]
  return ret.filter((g: any) => g && g.length > 0)
})

// 先触发按钮自带 click，再广播 after-click（与原组件一致的执行序）
const onClick = async ($event: MouseEvent, button: any) => {
  await button?.click?.(button, $event)
  emits('after-click', button, $event)
}
</script>

<style scoped>
.cx-actions {
  display: flex;
  flex-direction: column;
}
.cx-actions__button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: transparent;
  font-size: 12px;
  text-align: left;
  cursor: pointer;
}
.cx-actions__button:hover {
  background: #f3f4f6;
}
.cx-actions__separator {
  height: 1px;
  margin: 4px 0;
  background: #e5e7eb;
}
</style>
