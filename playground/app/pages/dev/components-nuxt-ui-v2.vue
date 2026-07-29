<template>
  <!-- /dev/components-nuxt-ui-v2：@lionad/cx-comps-nuxt-ui-v2 物料 schema 驱动渲染验收。
       按 Nuxt UI 官方分类（Elements / Form / Data / Layout / Navigation / Overlay）分组展示，
       分类骨架来自 vendored 源码 vendor/src/runtime/components/ 的 6 大目录。 -->
  <main class="page-dev-components-nuxt-ui-v2 page">
    <header class="page-header">
      <h1 class="title">cx components · nuxt-ui v2</h1>
      <p class="subtitle">
        /dev/components-nuxt-ui-v2 · 按 Nuxt UI 官方分类组织的物料 schema 驱动渲染验收
      </p>
      <DevPagesNav />
    </header>

    <section v-for="group in groups" :key="group.name" class="group">
      <h2 class="group-title">
        {{ group.name }}
        <span class="count">{{ group.items.length }}</span>
      </h2>
      <div class="grid">
        <article
          v-for="item in group.items"
          :key="item.meta.key"
          class="card"
          @dblclick="log(item.meta, item.node)"
        >
          <header class="card-head">
            <span class="card-name">{{ item.meta.name }}</span>
            <code class="card-key">{{ item.meta.key }}</code>
            <span v-if="item.meta.headless" class="badge">headless</span>
          </header>
          <p class="card-desc">{{ item.meta.description }}</p>
          <div class="card-preview">
            <CxRender v-if="!item.meta.headless" :components="[item.node]" />
            <span v-else class="muted">无可见 UI（逻辑型物料）</span>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { CxNuxtUIV2 } from '@lionad/cx-comps-nuxt-ui-v2'
import { toItem, type CxMeta } from '~/dev/material-utils'
import { groupByCategory, type CategoryGroup } from '~/dev/nuxt-ui-v2-categories'

defineOptions({ name: 'PageDevComponentsNuxtUiV2' })

// v2 包物料经 cx-nuxt 的 nuxt-ui-v2 bundle 注册到全局 $cx；
// groupByCategory 按官方分类装配成 6 组，未映射 key 会抛错强制补全映射
const materials = [...CxNuxtUIV2] as unknown as { _cx_meta: CxMeta }[]
const groups: CategoryGroup[] = groupByCategory(materials.map(toItem))

const log = (meta: CxMeta, node: unknown) => console.log(meta, node)
</script>

<style scoped>
.page {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 32px 24px;
}
.page-header {
  margin-bottom: 24px;
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
.group {
  margin-top: 32px;
}
.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.count {
  font-size: 12px;
  color: #aaa;
  font-weight: 400;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
}
.card {
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.card-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.card-name {
  font-weight: 600;
  font-size: 14px;
}
.card-key {
  font-size: 11px;
  color: #6b7280;
  background: #f3f4f6;
  padding: 1px 6px;
  border-radius: 4px;
}
.badge {
  font-size: 10px;
  color: #c2410c;
  background: #fff7ed;
  padding: 1px 6px;
  border-radius: 4px;
}
.card-desc {
  font-size: 12px;
  color: #888;
  margin-bottom: 10px;
  min-height: 16px;
}
.card-preview {
  padding: 12px;
  border: 1px dashed #e5e7eb;
  border-radius: 6px;
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}
.muted {
  font-size: 12px;
  color: #bbb;
}
</style>
