<template>
  <div class="days-con">
    <div class="empty-tip" v-if="!standups.length">没有找到记录</div>
    <template v-for="(standup, idx) in standups" :key="`${standup.id}${idx}`">
      <StandupContextProvider :item="{ standup, group: group!, idx }">
        <slot name="card-item" />
      </StandupContextProvider>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'

import { StandupContextProvider, StandupGroupKey } from '../../standup-context'

import type { Standup } from '../../../apis'

/**
 * standups 优先取 prop 注入（测试缝隙），否则取注入的 group.standups（生产路径）。
 * group 由外层 group-list 经 StandupGroupKey 注入。
 */
const props = defineProps<{
  standups?: Standup[]
}>()

const group = inject(StandupGroupKey, null)
const standups = computed<Standup[]>(() =>
  props.standups?.length ? props.standups : (group?.standups ?? []),
)
</script>
