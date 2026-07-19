<template>
  <cx-weekly-standard-dashboard-page>
    <!-- use template to override the default template -->
    <template #page-header-center-end>
      <h4>Happy ~</h4>
    </template>
  </cx-weekly-standard-dashboard-page>
</template>

<script lang="ts" setup>
import { CxWeeklyStandardDashboardPage } from '../components'
</script>
