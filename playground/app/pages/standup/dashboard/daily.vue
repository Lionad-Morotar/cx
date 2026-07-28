<!-- 日会看板页 -->
<template>
  <DailyDashboardView class="page-standup-dashboard-daily" />
</template>

<script lang="ts" setup>
import DailyDashboardView from '~/standup/views/daily-standup-dashboard.vue'

defineOptions({ name: 'PageStandupDashboardDaily' })
</script>
