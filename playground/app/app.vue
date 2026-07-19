<template>
  <!-- cx 渲染验收页：同一 schema 经 CxRender 渲染（与 p-ray 编辑器同链路） -->
  <main class="page">
    <h1 class="title">cx playground</h1>
    <section class="demo">
      <!-- cx 渲染链路含 DOM 依赖（与 p-ray 编辑器同为客户端渲染），SSR 阶段由 ClientOnly 隔离 -->
      <ClientOnly>
        <CxRender :components="cmpts" />
      </ClientOnly>
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
</script>

<style scoped>
.page {
  max-width: 720px;
  margin: 40px auto;
  padding: 0 16px;
}
.title {
  font-size: 20px;
  font-weight: 600;
}
.demo {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
</style>
