<!-- 周会看板页 -->
<template>
  <WeeklyDashboardView class="page-standup-dashboard-weekly" />
</template>

<script lang="ts" setup>
import WeeklyDashboardView from '~/standup/views/weekly-standup-dashboard.vue'

defineOptions({ name: 'PageStandupDashboardWeekly' })
</script>
