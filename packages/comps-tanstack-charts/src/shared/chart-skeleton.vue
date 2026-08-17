<template>
  <!-- 图表流式骨架：definition 未闭合期间替换 Chart 占位，柱条错落脉冲暗示图表生长。
       全 inline style + WAAPI 脉冲：保持包零 css 分发契约（样式不经 style.css 装配） -->
  <div
    :class="ns.b()"
    :style="shellStyle"
    data-testid="cx-tanstack-charts-chart-skeleton"
    aria-hidden="true"
  >
    <div :style="plotStyle">
      <div
        v-for="(height, i) in barHeights"
        :key="i"
        :ref="(el) => setBarRef(el, i)"
        :style="{ ...barStyle, height }"
      ></div>
    </div>
    <div :style="baselineStyle"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useCxBEM } from '@lionad/cx-vue'

import type { CSSProperties } from 'vue'

// height 与 Chart 的 height prop 对齐：骨架与揭示态等高，替换瞬间无布局跳动
const props = withDefaults(defineProps<{ height?: number }>(), { height: 320 })

const ns = useCxBEM('tanstack-charts-chart-skeleton')

const normalizedHeight = computed(() =>
  Number.isFinite(props.height) && props.height > 0 ? props.height : 320,
)

// 柱高错落序列：模拟柱状图轮廓，避免等宽条的机械感
const HEIGHTS = ['42%', '68%', '55%', '82%', '61%']
const barHeights = computed(() => HEIGHTS)

const shellStyle = computed<CSSProperties>(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  width: '100%',
  boxSizing: 'border-box',
  height: `${normalizedHeight.value}px`,
  padding: '1rem 1rem 0',
  border: '1px solid rgba(148, 163, 184, 0.25)',
  borderRadius: '0.75rem',
}))

const plotStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-evenly',
  gap: '8%',
  flex: '1',
  minHeight: '0',
}

const barStyle: CSSProperties = {
  flex: '1',
  maxWidth: '3rem',
  borderRadius: '0.375rem 0.375rem 0 0',
  background:
    'linear-gradient(180deg, rgba(148, 163, 184, 0.32) 0%, rgba(148, 163, 184, 0.18) 100%)',
}

const baselineStyle: CSSProperties = {
  height: '2px',
  borderRadius: '1px',
  background: 'rgba(148, 163, 184, 0.35)',
}

// WAAPI 脉冲：相位错开暗示数据逐项到达；happy-dom 无 element.animate，守卫跳过
const bars: (Element | null)[] = []
const animations: Animation[] = []

function setBarRef(el: Element | { $el?: Element } | null, i: number) {
  bars[i] = el instanceof Element ? el : ((el as { $el?: Element } | null)?.$el ?? null)
}

onMounted(() => {
  bars.forEach((bar, i) => {
    if (!bar || typeof (bar as HTMLElement).animate !== 'function') return
    animations.push(
      (bar as HTMLElement).animate([{ opacity: 0.55 }, { opacity: 1 }, { opacity: 0.55 }], {
        duration: 1400,
        iterations: Infinity,
        delay: i * 150,
        easing: 'ease-in-out',
      }),
    )
  })
})

onBeforeUnmount(() => {
  for (const animation of animations) animation.cancel()
  animations.length = 0
  bars.length = 0
})
</script>
