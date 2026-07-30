<template>
  <!-- /dev/components：@lionad/cx-comps 物料 schema 驱动渲染验收。
       经 DevShowcase 以 sidebar（分组 + 组件 item）+ 主区多 variants 形态展示；
       分组保持原内联两组（基础物料 / 布局与容器），选中态经 ?c= 持久化。 -->
  <main class="page-dev-components page">
    <header class="page-header">
      <h1 class="title">cx components</h1>
      <p class="subtitle">/dev/components · 物料 schema 驱动渲染验收</p>
      <DevPagesNav />
    </header>

    <div class="showcase-wrap">
      <DevShowcase :groups="groups" :variants="compsVariants" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { CxBasics, CxCalendar, CxGrid, CxPage, CxUserStyle } from '@lionad/cx-comps'
import { toItem, type CxMeta, type ShowcaseGroup } from '~/dev/material-utils'
import { compsVariants } from '~/dev/variants'

defineOptions({ name: 'PageDevComponents' })

const groups: ShowcaseGroup[] = [
  {
    name: '基础物料',
    items: (CxBasics as unknown as { _cx_meta: CxMeta }[]).map(toItem),
  },
  {
    name: '布局与容器',
    items: [CxCalendar, CxGrid, CxPage, CxUserStyle]
      .map((c) => c as unknown as { _cx_meta: CxMeta })
      .map(toItem),
  },
]
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
