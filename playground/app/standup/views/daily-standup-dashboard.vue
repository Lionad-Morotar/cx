<template>
  <cx-daily-standard-dashboard-page>
    <!-- use template to override the default template -->
    <template #page-header-right-end>
      <span style="margin-right: 12px">Happy ~</span>
    </template>
  </cx-daily-standard-dashboard-page>
</template>

<script lang="ts" setup>
import { CxDailyStandardDashboardPage } from '../components'
</script>
