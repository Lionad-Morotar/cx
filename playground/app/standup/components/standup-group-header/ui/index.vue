<template>
  <div class="group-header" @mousedown="toggle">
    <CxSvgIcon class="icon" icon-class="benzhoudianjihou" />
    <div class="group-con-title">
      第{{ toCNNumber(group?.offsetCount ?? 1) }}{{ timeRangeMeterStr(groupByType) }}
    </div>
    <div class="group-range">
      <span>{{ group?.startDay }}</span>
      <span class="sep">~</span>
      <span>{{ group?.endDay }}</span>
    </div>
    <CxSvgIcon class="icon-open" icon-class="xiala-" />
    <CxSvgIcon class="icon-close" icon-class="shouqi3" />
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'

import CxSvgIcon from '../../cx-svg-icon.vue'
import { FolderContainerCtxKey, StandupGroupKey } from '../../standup-context'
import { useStandupType } from '../../../states/standups'
import { timeRangeMeterStr, toCNNumber } from '../../../utils'

// group 由 group-list 注入；折叠上下文由外层 folder-container 注入
const group = inject(StandupGroupKey, null)
const folderCtx = inject(FolderContainerCtxKey, null)
const toggle = () => folderCtx?.toggle()

const meetingType = useStandupType()
const groupByType = computed<'week' | 'month' | 'year'>(
  () => ({ day: 'week', week: 'month', month: 'year' })[meetingType.value] as 'week' | 'month' | 'year',
)
</script>
