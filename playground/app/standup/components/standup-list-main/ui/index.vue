<template>
  <CxScrollbar class="left-scroll-area">
    <!-- 当期分组标题 -->
    <div class="list-section-title is-first">
      本{{ timeRangeMeterStr(groupByType) }}{{ meetingTypeName }}
    </div>
    <!-- 当期分组列表（schema 子节点 cx-standup-group-list） -->
    <div class="list-section">
      <slot />
    </div>
    <!-- 历史标题 -->
    <div class="list-section-title is-second">历史{{ meetingTypeName }}</div>
    <!-- 历史站会 -->
    <div class="history-section">
      <StandupByYear class="history-con" :standups="standups" />
    </div>
  </CxScrollbar>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import StandupByYear from '../../view-standup-github-grid'
import { useStandups, useStandupType } from '../../../states/standups'
import { timeRangeMeterStr } from '../../../utils'

defineOptions({ name: 'cx-standup-list-main' })

const meetingType = useStandupType()
const standups = useStandups()

const meetingTypeName = computed(
  () =>
    ({ day: '站会', week: '周会', month: '月会' })[meetingType.value] as string,
)
const groupByType = computed<'week' | 'month' | 'year'>(
  () => ({ day: 'week', week: 'month', month: 'year' })[meetingType.value] as 'week' | 'month' | 'year',
)
</script>

<style scoped>
.left-scroll-area {
  grid-area: left;
  display: grid;
  grid-template-rows: 78px auto 78px minmax(0, 1fr);
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'h1'
    'current-standup-group'
    'h2'
    'history-standups';
}

.list-section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: #262626;

  &.is-first {
    grid-area: h1;
  }
  &.is-second {
    grid-area: h2;
  }
}

.list-section {
  grid-area: current-standup-group;
  position: relative;
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
}

.history-section {
  grid-area: history-standups;
  display: grid;
  grid-template: minmax(min-content, max-content) / minmax(min-content, max-content);
  position: relative;
  min-height: 130px;

  .history-con {
    padding-right: 2em;
    padding-bottom: 1em;
  }
}
</style>
