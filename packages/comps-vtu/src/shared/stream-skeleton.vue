<template>
  <!-- 流式骨架条组：长主体未闭合期间替换物料占位，行宽递减示意文本体量 -->
  <div :class="ns.b()" data-testid="cx-vtu-stream-skeleton" aria-hidden="true">
    <div
      v-for="(width, i) in lineWidths"
      :key="i"
      :class="ns.e('line')"
      :style="{ width }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCxBEM } from '@lionad/cx-vue'

const props = withDefaults(defineProps<{ lines?: number }>(), { lines: 3 })

const ns = useCxBEM('vtu-stream-skeleton')

// 行宽循环序列：长短错落模拟真实段落，避免等宽条的机械感
const WIDTHS = ['100%', '86%', '62%']
const lineWidths = computed(() =>
  Array.from({ length: Math.max(1, props.lines) }, (_, i) => WIDTHS[i % WIDTHS.length]),
)
</script>

<style scoped>
/* 中性卡片外壳：骨架期物料被替换，各物料外壳样式（边框/圆角/内边距）不一，
   取公约数样式保持「这里有内容在生长」的空间占位，避免揭示瞬间布局跳动 */
.cx-vtu-stream-skeleton {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  width: 100%;
  padding: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 0.75rem;
}

.cx-vtu-stream-skeleton__line {
  height: 1rem;
  border-radius: 0.375rem;
  background: linear-gradient(
    90deg,
    rgba(148, 163, 184, 0.18) 25%,
    rgba(148, 163, 184, 0.32) 50%,
    rgba(148, 163, 184, 0.18) 75%
  );
  background-size: 200% 100%;
  animation: cx-vtu-stream-skeleton-pulse 1.4s ease-in-out infinite;
}

@keyframes cx-vtu-stream-skeleton-pulse {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
