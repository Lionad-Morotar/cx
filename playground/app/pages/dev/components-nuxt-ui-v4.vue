<template>
  <!-- /dev/components-nuxt-ui-v4：@lionad/cx-comps-nuxt-ui-v4 物料 schema 驱动渲染验收。
       按 Nuxt UI v4 官方分类（Layout / Element / Form / Data / Navigation / Overlay）分组展示，
       分类骨架来自官方组件文档（2026-07-22 抓取 ui.nuxt.com/docs/components）。 -->
  <main class="page-dev-components-nuxt-ui-v4 page">
    <header class="page-header">
      <h1 class="title">cx components · nuxt-ui v4</h1>
      <p class="subtitle">
        /dev/components-nuxt-ui-v4 · 按 Nuxt UI v4 官方分类组织的物料 schema 驱动渲染验收
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
            <!-- 流式回放：仅数组增长型物料（有增量 trigger）提供；按 40 tokens/秒
                 复现该物料从 0 增量渲染的过程 -->
            <template v-else-if="replayOf(item).hasTrigger">
              <span
                v-if="replayOf(item).partialCount.value !== null"
                class="badge badge--replay"
                >{{ replayOf(item).partialCount.value }} 项</span
              >
              <button
                class="replay-btn"
                :data-testid="`replay-${item.meta.key}`"
                :title="replayTitle(replayOf(item))"
                @click="replayOf(item).toggle()"
              >
                {{ replayIcon(replayOf(item)) }}
              </button>
            </template>
          </header>
          <p class="card-desc">{{ item.meta.description }}</p>
          <div class="card-preview">
            <span v-if="item.meta.headless" class="muted">无可见 UI（逻辑型物料）</span>
            <DevCardPreview v-else :node="item.node" :replay="replayOf(item)" />
          </div>
          <footer v-if="replayOf(item).doneNote.value" class="card-foot">
            <span class="replay-note">{{ replayOf(item).doneNote.value }}</span>
          </footer>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  CxNuxtUIV4,
  createNuxtUiV4TriggerRegistry,
  mainArrayOf,
} from '@lionad/cx-comps-nuxt-ui-v4'
import { toItem, type CxMeta, type DevItem } from '~/dev/material-utils'
import { replayIcon, replayTitle, useCardReplay, type CardReplay } from '~/dev/use-card-replay'
import { groupByCategory, type CategoryGroup } from '~/dev/nuxt-ui-v4-categories'

defineOptions({ name: 'PageDevComponentsNuxtUiV4' })

// v4 包物料（CxNuxtUIV4 数组），经 cx-nuxt 生成的装配清单注册到全局 $cx；
// groupByCategory 按官方分类装配成 6 组，未映射 key 会抛错强制补全映射
const materials = CxNuxtUIV4 as unknown as { _cx_meta: CxMeta }[]
const groups: CategoryGroup[] = groupByCategory(materials.map(toItem))

// 每卡一个回放实例（setup 期建全，模板只读）；共用一个注册表实例
const registry = createNuxtUiV4TriggerRegistry()
const replays = new Map<string, CardReplay>()
for (const group of groups) {
  for (const item of group.items) {
    replays.set(
      item.meta.key,
      useCardReplay(item.node, {
        registry,
        countOf: (node) => mainArrayOf(node)?.length ?? null,
      }),
    )
  }
}
const replayOf = (item: DevItem): CardReplay => replays.get(item.meta.key)!

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
.badge--replay {
  color: #1d4ed8;
  background: #eff6ff;
}
.replay-btn {
  margin-left: auto;
  width: 24px;
  height: 24px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #2563eb;
  font-size: 11px;
  line-height: 1;
  cursor: pointer;
}
.replay-btn:hover {
  border-color: #2563eb;
  background: #eff6ff;
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
  /* 有界预览高度：error/main 等页面级布局物料带 min-h-[calc(100vh-...)] 视口高假设，
     流内高度受祖先约束，故用 max-height 收口、overflow 滚动，避免撑高 grid 行；
     sidebar 等 fixed 类逃逸不受祖先约束，已在物料层用 ui replacer 解除视口定位 */
  max-height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}
.card-foot {
  margin-top: 8px;
}
.replay-note {
  font-size: 11px;
  color: #c2410c;
}
.muted {
  font-size: 12px;
  color: #bbb;
}
</style>
