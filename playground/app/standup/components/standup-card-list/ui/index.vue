<template>
  <div ref="daysConRef" class="cx-standup-card-list days-con" :class="[kls, countClass]">
    <div v-if="!standups.length" class="empty-tip">没有找到{{ meetingTypeName }}记录</div>
    <template v-for="(standup, idx) in standups" :key="`${standup.id}${idx}`">
      <StandupContextProvider :item="{ standup, group: group!, idx }">
        <slot name="card-item" />
      </StandupContextProvider>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from 'vue'

import { StandupContextProvider, StandupGroupKey } from '../../standup-context'
import { useResponseClassName } from '../../../hooks'
import { useStandupType } from '../../../states/standups'

import type { Standup } from '../../../apis'

defineOptions({ name: 'CxStandupCardList' })

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

const meetingType = useStandupType()
const meetingTypeName = computed(
  () => ({ day: '站会', week: '周会', month: '月会' })[meetingType.value] as string,
)

// 列数响应式（日会视图按容器宽度断点收窄列数），与迁移前一致
const daysConRef = ref<HTMLElement>()
const kls =
  meetingType.value === 'day' ? useResponseClassName(computed(() => daysConRef.value)) : []

// 卡片数决定默认列数（4~6 张时按张数，其余用 7 列）；宽度断点类会在 CSS 中覆盖它
const countClass = computed(() => {
  const n = standups.value.length
  return n >= 4 && n <= 6 ? `is-count-${n}` : ''
})
</script>

<style scoped>
.days-con {
  --count: 7;
  --gap-offset: 0px;
  display: grid;
  grid-template-columns: repeat(var(--count, 5), 1fr);
  gap: calc(20px - var(--gap-offset, 0px));
  box-sizing: border-box;
  padding: 8px 20px 14px;
  width: 100%;
  max-width: 100%;

  &.is-count-4 {
    --count: 4;
  }
  &.is-count-5 {
    --count: 5;
  }
  &.is-count-6 {
    --count: 6;
  }

  &.is-sm {
    --count: 6;
    --gap-offset: 2px;
  }
  &.is-xs {
    --count: 5;
    --gap-offset: 4px;
  }
  &.is-x2s {
    --count: 4;
    --gap-offset: 6px;
  }
  &.is-x3s {
    --count: 3;
    --gap-offset: 8px;
  }
  &.is-x4s {
    --count: 2;
    --gap-offset: 10px;
  }
  &.is-x5s {
    --count: 1;
    --gap-offset: 12px;
  }

  .empty-tip {
    padding-left: 25px;
    color: #777;
  }
}
</style>
