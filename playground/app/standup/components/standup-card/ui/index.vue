<template>
  <StandupCard
    v-if="standup"
    :standup="standup"
    :group="group"
    :idx="idx"
    :view-type="viewType"
    @mousedown.stop="goDashboardPage(standup)" class="cx-standup-card"
  >
    <template v-if="isWeeklyMeeting" #card-title>
      <div class="time" :title="dayjs(standup.meetingDate).format('YYYY-MM-DD')">
        第{{ toCNNumber(idx + 1) }}周
      </div>
    </template>
  </StandupCard>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'

// 复用迁移前的卡片实现；待视图完成 schema 化后可将该基座迁入本物料目录
import StandupCard from '../../../views/components/standup/standup-card.vue'
import { StandupItemKey } from '../../standup-context'
import { useStandupType } from '../../../states/standups'
import { dayjs, toCNNumber } from '../../../utils'

import type { GroupOfStandup, Standup } from '../../../apis'

defineOptions({ name: 'CxStandupCard' })

const props = withDefaults(
  defineProps<{
    viewType?: 'card' | 'list-item'
  }>(),
  { viewType: 'card' },
)

// 卡片实例数据由 card-list 在 v-for 中经 StandupItemKey 注入
const item = inject(StandupItemKey, null)
const standup = computed(() => item?.standup ?? null)
const group = computed(() => item?.group ?? ({} as GroupOfStandup))
const idx = computed(() => item?.idx ?? 0)

const meetingType = useStandupType()
const isWeeklyMeeting = computed(() => meetingType.value === 'week')

const router = useRouter()
// 与迁移前一致：仅进行中/已结束的站会可跳转看板
const goDashboardPage = (target: Standup) => {
  if (target.state === 'IN_PROGRESS' || target.state === 'ENDED') {
    const page =
      meetingType.value === 'day' ? 'daily' : meetingType.value === 'week' ? 'weekly' : 'monthly'
    router?.push(`/standup/dashboard/${page}?standupID=${target.id}`)
  }
}
</script>
