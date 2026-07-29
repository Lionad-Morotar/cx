<template>
  <!-- /dev/components：@lionad/cx-components 物料的 schema 驱动渲染验收页 -->
  <main class="page-dev-components page">
    <header class="page-header">
      <h1 class="title">cx components</h1>
      <p class="subtitle">/dev/components · 物料 schema 驱动渲染验收</p>
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
            <!-- 流式回放：内置物料均无增量 trigger，回放演示围栏闭合一次性渲染 -->
            <button
              v-else
              class="replay-btn"
              :data-testid="`replay-${item.meta.key}`"
              :title="replayTitle(replayOf(item))"
              @click="replayOf(item).toggle()"
            >
              {{ replayIcon(replayOf(item)) }}
            </button>
          </header>
          <p class="card-desc">{{ item.meta.description }}</p>
          <div class="card-preview">
            <span v-if="item.meta.headless" class="muted">无可见 UI（逻辑型物料）</span>
            <DevCardPreview v-else :node="item.node" :replay="replayOf(item)" />
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import {
  CxBasics,
  CxCalendar,
  createComponentsTriggerRegistry,
  CxGrid,
  CxPage,
  CxUserStyle,
} from '@lionad/cx-components'
import { toItem, type CxMeta, type DevItem } from '~/dev/material-utils'
import { replayIcon, replayTitle, useCardReplay, type CardReplay } from '~/dev/use-card-replay'

defineOptions({ name: 'PageDevComponents' })

const groups: { name: string; items: DevItem[] }[] = [
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

// 每卡一个回放实例（setup 期建全，模板只读）；内置物料判定零 trigger，
// 空注册表使回放全程无增量帧，演示「围栏闭合一次性渲染」的诚实行为
const registry = createComponentsTriggerRegistry()
const replays = new Map<string, CardReplay>()
for (const group of groups) {
  for (const item of group.items) {
    replays.set(item.meta.key, useCardReplay(item.node, { registry }))
  }
}
const replayOf = (item: DevItem): CardReplay => replays.get(item.meta.key)!

const log = (meta: CxMeta, node: unknown) => console.log(meta, node)
</script>

<style scoped>
.page {
  /* 全局样式把 #__nuxt 钉死为 height:100% + overflow:hidden（站会布局契约），
     页面须自携滚动容器，否则内容超出视口会被直接裁剪 */
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
