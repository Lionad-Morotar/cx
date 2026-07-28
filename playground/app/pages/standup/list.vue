<!-- 站会列表页（日会/周会由 query.type 区分） -->
<template>
  <StandupListView class="page-standup-list" />
</template>

<script lang="ts" setup>
import StandupListView from '~/standup/views/standup-list.vue'

defineOptions({ name: 'PageStandupList' })
</script>
