<template>
  <!-- /dev/components-vtu：@lionad/cx-comps-vtu 物料 schema 驱动渲染验收。
       经 DevShowcase 以 sidebar + 主区多 variants 形态展示；按 vtu 官方 6 分类分组；
       含增量 trigger 的数组增长型物料经 replay 装配提供流式回放。 -->
  <main class="page-dev-components-vtu page">
    <header class="page-header">
      <h1 class="title">cx components · vtu</h1>
      <p class="subtitle">
        /dev/components-vtu · 按 tool-ui-vue 官方分类组织的物料 schema 驱动渲染验收
      </p>
      <DevPagesNav />
    </header>

    <div class="showcase-wrap">
      <DevShowcase :groups="groups" :variants="vtuVariants" :replay="{ registry, countOf }" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { CxVtu, createVtuTriggerRegistry, mainArrayOf } from '@lionad/cx-comps-vtu'
import { toItem, type CxMeta, type ShowcaseGroup } from '~/dev/material-utils'
import { groupByCategory } from '~/dev/vtu-categories'
import { vtuVariants } from '~/dev/variants'

defineOptions({ name: 'PageDevComponentsVtu' })

// vtu 包物料（CxVtu 数组），经 cx-nuxt 生成的装配清单注册到全局 $cx；
// groupByCategory 按官方分类装配成 6 组，未映射 key 会抛错强制补全映射
const materials = CxVtu as unknown as { _cx_meta: CxMeta }[]
const groups: ShowcaseGroup[] = groupByCategory(materials.map(toItem))

// 回放装配：注册表工厂创建、countOf 取主数组长度（徽标展示用）
const registry = createVtuTriggerRegistry()
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
