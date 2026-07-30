<template>
  <!-- dev 验收页之间的横向互链导航；当前页高亮。Nuxt 自动导入到所有 dev 页 header。 -->
  <nav class="cx-dev-pages-nav dev-pages-nav">
    <NuxtLink
      v-for="l in links"
      :key="l.to"
      :to="l.to"
      :class="['dev-pages-nav__link', { 'dev-pages-nav__link--active': route.path === l.to }]"
    >
      {{ l.label }}
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
// useRoute 由 Nuxt 自动导入
defineOptions({ name: 'CxDevPagesNav' })

const route = useRoute()

const links = [
  { to: '/dev/components', label: '基础物料' },
  { to: '/dev/components-nuxt-ui-v2', label: 'nuxt-ui v2' },
  { to: '/dev/components-nuxt-ui-v4', label: 'nuxt-ui v4' },
  { to: '/dev/components-vtu', label: 'vtu' },
  { to: '/dev/components-element-plus', label: 'element-plus' },
  { to: '/dev/components-naive-ui', label: 'naive-ui' },
  { to: '/dev/stream', label: 'stream 流式' },
] as const
</script>

<style scoped>
.dev-pages-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.dev-pages-nav__link {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  text-decoration: none;
  background: #fff;
}
.dev-pages-nav__link:hover {
  border-color: #d1d5db;
  color: #374151;
}
.dev-pages-nav__link--active {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}
</style>
