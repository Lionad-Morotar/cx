<template>
  <div class="cx-standup-list-layout standup-list-page">
    <slot />
  </div>
</template>

<script lang="ts" setup>
defineOptions({ name: 'cx-standup-list-layout' })
</script>

<style scoped>
.standup-list-page {
  display: grid;
  grid-template-rows: 30px minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr) 271px;
  grid-template-areas:
    'time time'
    'left project-members';
  padding: 18px 24px;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}
</style>
