<template>
  <div class="cx-standup-group-header group-header" @mousedown="toggle">
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

defineOptions({ name: 'CxStandupGroupHeader' })

// group 由 group-list 注入；折叠上下文由外层 folder-container 注入
const group = inject(StandupGroupKey, null)
const folderCtx = inject(FolderContainerCtxKey, null)
const toggle = () => folderCtx?.toggle()

const meetingType = useStandupType()
const groupByType = computed<'week' | 'month' | 'year'>(
  () =>
    ({ day: 'week', week: 'month', month: 'year' })[meetingType.value] as 'week' | 'month' | 'year',
)
</script>

<style scoped>
.group-header {
  display: grid;
  grid-template: 28px / auto auto 1fr auto;
  box-sizing: border-box;
  padding: 10px 16px;
  align-items: center;
  gap: 12px;
  width: 100%;
  cursor: pointer;
  user-select: none;
  transition: background var(--su-dur) var(--su-ease);

  &:hover {
    background: var(--su-bg-raised);
  }

  .icon {
    font-size: 16px;
    color: var(--su-ink-3);
  }
  .group-con-title {
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--su-ink);
  }
  .group-range {
    display: flex;
    align-items: center;
    color: var(--su-ink-3);
    font-variant-numeric: tabular-nums;

    .sep {
      margin: 0 0.3em;
      font-size: 12px;
    }
  }
  .icon-open,
  .icon-close {
    color: var(--su-ink-3);
    font-size: 12px;
  }
  .icon-collapse {
    font-size: 12px;
  }
}
</style>
