<template>
  <!-- /dev：物料验收页索引，聚合三类 cx 物料的 schema 驱动渲染验收入口 -->
  <main class="page">
    <header class="page-header">
      <h1 class="title">dev · 物料验收</h1>
      <p class="subtitle">/dev · cx 物料 schema 驱动渲染验收入口</p>
    </header>

    <div class="grid">
      <NuxtLink v-for="l in links" :key="l.to" :to="l.to" class="card">
        <header class="card-head">
          <span class="card-name">{{ l.name }}</span>
          <code class="card-key">{{ l.to }}</code>
        </header>
        <p class="card-desc">{{ l.desc }}</p>
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
const links = [
  {
    to: '/dev/components',
    name: 'cx components（基础物料）',
    desc: '自研基础物料（block / text / grid / calendar / page 等）的 schema 驱动渲染验收',
  },
  {
    to: '/dev/components-nuxt-ui-v2',
    name: 'cx components · nuxt-ui v2',
    desc: 'Nuxt UI v2 物料，按官方分类（Elements / Form / Data / Layout / Navigation / Overlay）组织',
  },
  {
    to: '/dev/components-nuxt-ui-v4',
    name: 'cx components · nuxt-ui v4',
    desc: 'Nuxt UI v4 物料，按官方分类（Layout / Element / Form / Data / Navigation / Overlay）组织',
  },
] as const
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
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
}
.card {
  display: block;
  padding: 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
}
.card:hover {
  border-color: #d1d5db;
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
.card-desc {
  font-size: 12px;
  color: #888;
}
</style>
