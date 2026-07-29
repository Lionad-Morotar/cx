<template>
  <!-- 动作按钮组（原为 p-ray p-actions 的 cx 轻量替代；u-button/u-separator 降级为原生元素） -->
  <div class="cx-cx-actions cx-actions">
    <template v-for="(group, idx) in groupedActions" :key="idx">
      <button
        v-for="button in group"
        :key="button.label"
        type="button"
        class="cx-actions__button"
        @click="onClick($event, button)"
      >
        {{ button.label }}
      </button>
      <span v-if="idx < groupedActions.length - 1" class="cx-actions__separator" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * 动作按钮组：兼容 dropdown-menu actions 字段（单组或分组数组，自动归一）。
 * 原版为 p-ray 全局组件 p-actions；视觉差异：u-button/u-separator 降级为原生元素。
 */
defineOptions({ name: 'CxCxActions' })

/** 动作项：label 必填，click 为自带点击回调（与 dropdown-menu actions 兼容） */
type CxAction = { label: string; click?: (button: CxAction, $event: MouseEvent) => void }

const emits = defineEmits(['after-click', 'hover', 'unhover'])

const props = withDefaults(
  defineProps<{
    // 兼容 dropdown-menu actions：单组 CxAction[] 或分组 CxAction[][]，运行时自动归一
    actions?: CxAction[] | CxAction[][]
  }>(),
  { actions: () => [] },
)

const groupedActions = computed(() => {
  const acts = props.actions
  // 首元素是否为数组 → 分组形态；否则包一层数组归一为单组
  const isGroup = Array.isArray(acts?.[0])
  const ret = isGroup ? (acts as CxAction[][]) : [acts as CxAction[]]
  return ret.filter((g) => g && g.length > 0)
})

// 先触发按钮自带 click，再广播 after-click（与原组件一致的执行序）
const onClick = async ($event: MouseEvent, button: CxAction) => {
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
