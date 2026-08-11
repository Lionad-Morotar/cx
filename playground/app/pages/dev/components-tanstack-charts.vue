<template>
  <!-- /dev/components-tanstack-charts：@lionad/cx-comps-tanstack-charts 物料 schema 驱动渲染验收。
       TanStack Charts 零 CSS 分发（样式=definition theme + inline style），无宿主样式注入；
       6 件物料全量流式 trigger（5 array + 1 scalar）经 replay 装配提供流式回放 -->
  <main class="page-dev-components-tanstack-charts page">
    <header class="page-header">
      <h1 class="title">cx components · tanstack-charts</h1>
      <p class="subtitle">
        /dev/components-tanstack-charts · TanStack Charts 物料 schema 驱动渲染验收（JSON definition
        投影）
      </p>
      <DevPagesNav />
    </header>

    <div class="showcase-wrap">
      <DevShowcase :groups="groups" :replay="{ registry, countOf }" />
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  CxTanstackCharts,
  createTanstackChartsTriggerRegistry,
  mainArrayOf,
} from '@lionad/cx-comps-tanstack-charts'
import { toItem, type CxMeta, type ShowcaseGroup } from '~/dev/material-utils'
import { groupByCategory } from '~/dev/tanstack-charts-categories'

defineOptions({ name: 'PageDevComponentsTanstackCharts' })

// TanStack Charts 包物料（CxTanstackCharts 数组），经 cx-nuxt 的 tanstack-charts bundle
// 注册到全局 $cx；groupByCategory 未映射 key 会抛错强制补全映射
const materials = CxTanstackCharts as unknown as { _cx_meta: CxMeta }[]
const groups: ShowcaseGroup[] = groupByCategory(materials.map(toItem))

// 回放装配：注册表工厂创建、countOf 取主数组长度（徽标展示用）
const registry = createTanstackChartsTriggerRegistry()
const countOf = (node: { key: string; data?: Record<string, unknown> }) =>
  mainArrayOf(node)?.length ?? null
</script>

<style scoped>
.page {
  /* 全局样式把 #__nuxt 钉死为 height:100% + overflow:hidden（站会布局契约）：
     页面以 flex 列承接——header 固定、showcase 区 flex-1 内部双区各自滚动 */
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}
.page-header {
  flex-shrink: 0;
  padding: 20px 24px 12px;
}
.title {
  font-size: 20px;
  font-weight: 600;
}
.subtitle {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
}
.showcase-wrap {
  flex: 1;
  min-height: 0;
}
</style>
