<template>
  <div class="list-con">
    <template v-for="group in groups" :key="group.startDay">
      <StandupContextProvider :group="group">
        <slot name="group-item" />
      </StandupContextProvider>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import { StandupContextProvider } from '../../standup-context'
import { useStandupGroups } from '../states/use-standup-groups'

import type { GroupOfStandup } from '../../../apis'

/**
 * groups 优先取 prop 注入（测试缝隙：schema 静态，测试经 data.groups 注入受控数据）；
 * 生产环境 schema 不填该字段，回退到 store 计算的分组。
 */
const props = defineProps<{
  groups?: GroupOfStandup[]
}>()

const storeGroups = useStandupGroups()
const groups = computed<GroupOfStandup[]>(() =>
  props.groups?.length ? props.groups : storeGroups.value,
)
</script>
