<template>
  <div ref="chartRef" :style="{ width: w, height: h }" />
</template>

<script setup lang="ts">
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
  import * as echarts from 'echarts'

  defineOptions({ name: 'CxEchart', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      w?: string
      h?: string
      options?: Record<string, unknown> | null
    }>(),
    { w: '100%', h: '300px', options: null },
  )

  const chartRef = ref<HTMLDivElement | null>(null)
  let chartInstance: echarts.ECharts | null = null
  let resizeObserver: ResizeObserver | null = null
  let rafId: number | null = null

  // 流式回放的中间帧 options 是增量解析的半成品（字段未到位即为 undefined），
  // 喂给 echarts 会在 paint 阶段异步爆炸（如渐变 colorStops 缺 color）；
  // 帧内一旦出现 undefined 即视为中间帧，跳过等后续完整帧
  const hasUndefinedDeep = (val: unknown): boolean => {
    if (val === undefined) return true
    if (val === null || typeof val !== 'object') return false
    if (Array.isArray(val)) return val.some(hasUndefinedDeep)
    return Object.values(val).some(hasUndefinedDeep)
  }

  const toArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : v ? [v] : [])

  // 流式中间帧常出现 legend.data 先于 series 流入：merge 模式下 echarts 按名
  // 找不到 series 会逐条 dev 警告。legend 引用缺失即视为中间帧，跳过等完整帧
  const hasLegendSeriesMissing = (
    options: Record<string, unknown>,
  ): boolean => {
    const legendNames = toArr(options.legend)
      .flatMap((lg) =>
        toArr((lg as { data?: unknown }).data).map((d) =>
          typeof d === 'string' ? d : (d as { name?: unknown })?.name,
        ),
      )
      .filter((n): n is string => typeof n === 'string' && n !== '')
    if (!legendNames.length) return false
    const seriesNames = new Set<string>()
    for (const s of toArr(options.series)) {
      const so = s as { name?: unknown; data?: unknown } | null
      if (typeof so?.name === 'string' && so.name) seriesNames.add(so.name)
      for (const d of toArr(so?.data)) {
        const dn = (d as { name?: unknown } | null)?.name
        if (typeof dn === 'string' && dn) seriesNames.add(dn)
      }
    }
    return legendNames.some((n) => !seriesNames.has(n))
  }

  // options 流式后至：挂载时可能尚无数据，watch 到有效 options 再 init；
  // 后续 options 变更经 setOption 增量刷新（Fork EchartSet 并补响应式）。
  const render = () => {
    if (!chartRef.value || !props.options) return
    if (hasUndefinedDeep(props.options)) return
    if (hasLegendSeriesMissing(props.options)) return
    // 容器 0 尺寸（v-show 隐藏面板内 display:none）不 init：
    // echarts 对 0 尺寸 DOM 会告警且面板转可见后不会自动重排，
    // 等 ResizeObserver 报告非 0 再建实例
    if (!chartInstance) {
      const { clientWidth, clientHeight } = chartRef.value
      if (clientWidth === 0 || clientHeight === 0) return
      chartInstance = echarts.init(chartRef.value)
    }
    try {
      chartInstance.setOption(props.options)
    } catch {
      // 中间帧可能含闸门拦不住的坏值（如流式截断的颜色字符串）：
      // echarts 的同步 paint（setOption 内 zr.flush）在其主流程标志复位之前执行，
      // 一旦爆炸实例内部标志永久卡死、后续 setOption 全被拒，
      // 只能 dispose 等下一帧走统一入口重建
      chartInstance?.dispose()
      chartInstance = null
    }
  }

  // 回放 20 次/秒的高频同步 setOption 会撞上 echarts 主流程造成重入，
  // rAF 合并调度：一帧内多次变化只渲染最后一次，且移出 Vue flush 同步链
  const scheduleRender = () => {
    if (rafId != null || typeof requestAnimationFrame === 'undefined') return
    rafId = requestAnimationFrame(() => {
      rafId = null
      render()
    })
  }

  onMounted(() => {
    scheduleRender()
    if (chartRef.value && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver((entries) => {
        const box = entries[0]?.contentRect
        if (!box || box.width <= 0 || box.height <= 0) return
        // 尺寸由 0 转非 0：实例尚未创建（0 尺寸不 init）时唤醒首渲染，已创建则重排
        if (chartInstance) chartInstance.resize()
        else scheduleRender()
      })
      resizeObserver.observe(chartRef.value)
    }
  })
  watch(() => props.options, scheduleRender, { deep: true })

  onBeforeUnmount(() => {
    if (rafId != null) cancelAnimationFrame(rafId)
    rafId = null
    resizeObserver?.disconnect()
    resizeObserver = null
    chartInstance?.dispose()
    chartInstance = null
  })
</script>
