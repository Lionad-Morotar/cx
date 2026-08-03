<template>
  <div class="cx-standup-list-layout standup-list-page">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'cx-standup-list-layout' })
</script>

<style scoped>
/* 页面骨架：品牌头部横贯全宽，主区与成员栏分列。
   间距流体化：投屏大屏放大呼吸，1366 窄屏收窄不破版 */
.standup-list-page {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr) clamp(240px, 18vw, 320px);
  grid-template-areas:
    'header header'
    'left project-members';
  column-gap: clamp(16px, 2vw, 32px);
  padding: clamp(14px, 1.8vw, 26px) clamp(16px, 2.4vw, 40px);
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
</style>
