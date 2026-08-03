<!-- 简化版 cx-card（低代码渲染器全局卡片外壳的站会域等价物）
  原用途：weekly-main-content 的 <cx-card :name="'任务列表'"> 外壳，
  提供 header（name + action 区）+ body 结构，class 保真便于样式复用 -->
<template>
  <div class="cx-cx-card cx-card">
    <div class="cx-card__header">
      <div class="cx-card__name">{{ name }}</div>
      <div class="cx-card__action-con">
        <slot name="action"></slot>
      </div>
    </div>
    <div class="cx-card__body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'CxCxCard' })

defineProps<{ name?: string }>()
</script>

<style scoped>
.cx-card {
  display: flex;
  flex-direction: column;
  background: var(--su-bg-raised);
  border-radius: 4px;
  overflow: hidden;
}
.cx-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}
.cx-card__name {
  font-weight: 600;
}
.cx-card__body {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
</style>
