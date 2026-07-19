<template>
  <!-- playground 首页：能力导航 + schema 渲染验收 -->
  <main class="page">
    <h1 class="title">cx playground</h1>

    <!-- 站会模块入口（EAP 迁移版，与 playground 同等重量的一等公民） -->
    <section class="section">
      <h2 class="section-title">站会管理</h2>
      <div class="entry-cards">
        <NuxtLink class="entry-card" to="/standup/list?type=day">
          <div class="entry-name">日会列表</div>
          <div class="entry-desc">按周分组的站会卡片、开会流程、成员拖拽排序</div>
        </NuxtLink>
        <NuxtLink class="entry-card" to="/standup/list?type=week">
          <div class="entry-name">周会列表</div>
          <div class="entry-desc">按月分组的周会卡片、最后工作日标记</div>
        </NuxtLink>
      </div>
    </section>

    <!-- 迁移物料的 schema 驱动渲染验收：与手写组装同物料、经 CxRender 渲染 -->
    <section class="section">
      <h2 class="section-title">迁移物料 · schema 驱动渲染</h2>
      <div class="demo">
        <CxRender :components="standupMaterialCmpts" />
      </div>
    </section>

    <!-- cx 基础渲染链路验收（原有 demo） -->
    <section class="section">
      <h2 class="section-title">基础物料 · schema 驱动渲染</h2>
      <div class="demo">
        <CxRender :components="cmpts" />
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import type { CxComponentRuntime } from '@lionad/cx-definition'

const cmpts = ref<CxComponentRuntime[]>([
  {
    id: 'demo-root',
    key: 'cx-block',
    name: '根容器',
    aliasKeys: [],
    data: {},
    props: {},
    emits: {},
    exposes: {},
    parents: [],
    components: {
      default: [
        {
          id: 'demo-text',
          key: 'cx-text',
          name: '文本',
          aliasKeys: [],
          data: { content: '你好，cx — 来自独立 monorepo 的渲染' },
          props: {},
          emits: {},
          exposes: {},
          parents: ['demo-root'],
          components: {},
        },
        {
          id: 'demo-btn',
          key: 'cx-button',
          name: '按钮',
          aliasKeys: [],
          data: { label: 'nuxt-ui 物料按钮', color: 'primary' },
          props: {},
          emits: {},
          exposes: {},
          parents: ['demo-root'],
          components: {},
        },
      ] as CxComponentRuntime[],
    },
  } as CxComponentRuntime,
])

// 站会迁移物料（dashboard-card）的 schema 驱动渲染
const standupMaterialCmpts = ref<CxComponentRuntime[]>([
  {
    id: 'standup-card-root',
    key: 'cx-dashboard-card',
    name: '看板卡',
    aliasKeys: [],
    data: { title: '昨天', themeColor: '#fbad15' },
    props: {},
    emits: {},
    exposes: {},
    parents: [],
    components: {
      default: [
        {
          id: 'standup-card-text',
          key: 'cx-text',
          name: '文本',
          aliasKeys: [],
          data: { content: '迁移物料经 CxRender 渲染成功' },
          props: {},
          emits: {},
          exposes: {},
          parents: ['standup-card-root'],
          components: {},
        },
      ] as CxComponentRuntime[],
    },
  } as CxComponentRuntime,
])
</script>

<style scoped>
.page {
  max-width: 860px;
  margin: 40px auto;
  padding: 0 16px;
}
.title {
  font-size: 20px;
  font-weight: 600;
}
.section {
  margin-top: 24px;
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 10px;
}
.entry-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}
.entry-card {
  display: block;
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.15s;
}
.entry-card:hover {
  border-color: #1890ff;
}
.entry-name {
  font-weight: 600;
  margin-bottom: 6px;
}
.entry-desc {
  font-size: 12px;
  color: #888;
}
.demo {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
</style>
