<template>
  <!-- /dev/components：@lionad/cx-components 物料的 schema 驱动渲染验收页 -->
  <main class="page">
    <header class="page-header">
      <h1 class="title">cx components</h1>
      <p class="subtitle">/dev/components · 物料 schema 驱动渲染验收</p>
    </header>

    <section v-for="group in groups" :key="group.name" class="group">
      <h2 class="group-title">
        {{ group.name }}
        <span class="count">{{ group.items.length }}</span>
      </h2>
      <div class="grid">
        <article v-for="item in group.items" :key="item.meta.key" class="card">
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
import { CxBasics, CxCalendar, CxGrid, CxPage, CxUserStyle } from '@lionad/cx-components'
import type { CxComponentRuntime } from '@lionad/cx-definition'

interface CxMeta {
  key: string
  name: string
  description?: string
  headless?: boolean
  props?: Record<string, { initial?: unknown }>
  slots?: unknown
}

// 从物料 props 的 initial 构造默认 data，供 CxRender 渲染示例
function buildDefaultData(meta: CxMeta): Record<string, unknown> {
  const data: Record<string, unknown> = {}
  for (const [k, p] of Object.entries(meta.props || {})) {
    if (p?.initial !== undefined) data[k] = p.initial
  }
  return data
}

function textNode(content: string): CxComponentRuntime {
  return {
    id: `dev-text-${content}`,
    key: 'cx-text',
    name: '文本',
    aliasKeys: [],
    data: { content },
    props: {},
    emits: {},
    exposes: {},
    parents: [],
    components: {},
  } as CxComponentRuntime
}

function toItem(cmpt: { _cx_meta: CxMeta }): { meta: CxMeta; node: CxComponentRuntime } {
  const meta = cmpt._cx_meta
  const node = {
    id: `dev-${meta.key}`,
    key: meta.key,
    name: meta.name,
    aliasKeys: [],
    data: buildDefaultData(meta),
    props: {},
    emits: {},
    exposes: {},
    parents: [],
    components: {},
  } as CxComponentRuntime
  // 有 default slot 的容器塞示例文本，避免空壳看不出效果
  if (meta.slots) {
    node.components = { default: [textNode('示例内容')] }
  }
  return { meta, node }
}

const groups: { name: string; items: ReturnType<typeof toItem>[] }[] = [
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
  max-width: 1200px;
  margin: 32px auto;
  padding: 0 16px;
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
