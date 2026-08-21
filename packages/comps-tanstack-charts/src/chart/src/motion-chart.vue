<!-- CxTanstackChartsMotionChart: 声明 motion 的物料挂载分支。
     库 vue adapter 的 Chart 内部写死 createSvgChartRenderer，没有 motion renderer
     注入口子；此组件自组装 renderer adapter，把 renderer 换成 motion()。
     行为对齐 vue adapter Chart(prerender 首帧 + mount 接管 + update 响应),裁剪掉
     cx 不用的 tooltipBody slot。 -->
<template>
  <div class="ts-chart-host" :style="hostStyle">
    <!-- 首帧 markup 只注入一次：mount 后 DOM 由 motion renderer 接管（含动画态),
         若随重渲染重设 innerHTML 会摧毁动画状态，故用非响应式常量 -->
    <div
      ref="container"
      class="ts-chart-surface"
      style="width: 100%; height: 100%"
      v-html="initialMarkup"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

import { resolveChartAdapterLayout } from '@tanstack/charts/adapter'
import { createChartRendererAdapter } from '@tanstack/charts/adapter/renderer'
import { motion } from '@tanstack/charts/motion'

import type { CxChartSpec } from '../../shared/translate'

interface Props {
  /** 运行时 DomChartDefinition(translateChartSpec 产物,已含 chart 级 motion 时序) */
  definition: Record<string, unknown>
  ariaLabel: string
  /** spec.motion 的 renderer 级选项(initial/resize);transition/delay 已在 definition.motion */
  motionOptions?: CxChartSpec['motion']
  height?: number
  width?: number
  aspectRatio?: number
  className?: string
}

const props = defineProps<Props>()

// 与库 vue adapter 同模式的 id 前缀(非法字符清洗)
const idPrefix = `ts-chart-${useId().replaceAll(/[^a-zA-Z0-9_-]/g, '')}`

const hostStyle = computed(() => ({
  position: 'relative' as const,
  width: props.width === undefined ? '100%' : `${props.width}px`,
  height: props.height ?? (props.aspectRatio === undefined ? 320 : undefined),
  aspectRatio: props.height === undefined ? props.aspectRatio : undefined,
}))

/** host options 组装:与库 vue adapter toHostOptions 同构,renderer 固定为 motion() */
function toHostOptions() {
  return {
    definition: props.definition,
    ariaLabel: props.ariaLabel,
    height: props.height,
    width: props.width,
    aspectRatio: props.aspectRatio,
    className: props.className,
    idPrefix,
    renderer: motion({
      // 本组件必然先注入 prerender 首帧再 mount,库层 mount 时恒判定 adoptedRoot=true;
      // initial:true 对 adopted 首帧跳过入场动画(语义是 SSR 水合防闪动),而此处首帧
      // 尚未播放过动画,故默认 'always' 重播;物料可显式传 initial:false 关闭
      initial: props.motionOptions?.initial ?? 'always',
      resize: props.motionOptions?.resize,
    }),
  }
}

// adapter/renderer 一次性创建:update 只换 options,不重建(重建会丢动画状态)
const adapter = createChartRendererAdapter(toHostOptions() as never)
const initialMarkup = adapter.prerender() as string

const container = ref<HTMLElement>()
onMounted(() => {
  if (!container.value) return
  adapter.update(toHostOptions() as never)
  adapter.mount(container.value)
})
watch(
  () => [props.definition, props.height, props.width, props.aspectRatio],
  () => adapter.update(toHostOptions() as never),
)
onBeforeUnmount(() => adapter.destroy())
</script>
