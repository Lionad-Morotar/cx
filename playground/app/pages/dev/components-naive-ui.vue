<template>
  <!-- /dev/components-naive-ui：@lionad/cx-comps-naive-ui 物料 schema 驱动渲染验收。
       经 DevShowcase 以 sidebar + 主区多 variants 形态展示；按包冻结六类分组；
       data-table 增量 trigger 经 replay 装配提供流式回放。naive-ui 为 CSS-in-JS，
       样式随组件渲染期注入，宿主侧无 css 装配、不参与 @layer 层序安排。 -->
  <main class="page-dev-components-naive-ui page">
    <header class="page-header">
      <h1 class="title">cx components · naive-ui</h1>
      <p class="subtitle">
        /dev/components-naive-ui · 按包冻结六类组织的 Naive UI 物料 schema 驱动渲染验收
      </p>
      <DevPagesNav />
    </header>

    <div class="showcase-wrap">
      <DevShowcase :groups="groups" :variants="naiveUiVariants" :replay="{ registry, countOf }" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { CxNaiveUi, createNaiveUiTriggerRegistry, mainArrayOf } from '@lionad/cx-comps-naive-ui'
import { toItem, type CxMeta, type ShowcaseGroup } from '~/dev/material-utils'
import { groupByCategory } from '~/dev/naive-ui-categories'
import { naiveUiVariants } from '~/dev/variants'

defineOptions({ name: 'PageDevComponentsNaiveUi' })

// naive-ui 包物料（CxNaiveUi 数组），经 cx-nuxt 的 naive-ui bundle 注册到全局 $cx；
// groupByCategory 按包冻结六类装配，未映射 key 会抛错强制补全映射
const materials = CxNaiveUi as unknown as { _cx_meta: CxMeta }[]
const groups: ShowcaseGroup[] = groupByCategory(materials.map(toItem))

// 回放装配：注册表工厂创建、countOf 取主数组长度（徽标展示用）
const registry = createNaiveUiTriggerRegistry()
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
