<template>
  <div class="header-section">
    <TimeCount weekday />
    <div class="buttons-con">
      <UButton class="manual-sync" color="primary" @mousedown="apiSyncIssues">
        <span>手动同步</span>
      </UButton>
      <template v-if="isTodayStandupInProgress">
        <UButton
          color="success"
          :loading="handleContinueOrStarNewStandup.isLoading"
          @mousedown="handleContinueOrStarNewStandup.exec"
        >
          <span>继续会议</span>
        </UButton>
        <UButton @mousedown="resetParticipantsReq.exec">
          <span>设置参会人</span>
        </UButton>
      </template>
      <template v-else>
        <UButton
          color="primary"
          :loading="handleContinueOrStarNewStandup.isLoading"
          :disabled="isTodayStandupDone || handleContinueOrStarNewStandup.isLoading"
          :title="isTodayStandupDone ? '今日站会已结束' : ''"
          @mousedown="handleContinueOrStarNewStandup.exec"
        >
          <span>开会</span>
        </UButton>
      </template>
      <FullscreenButton />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import FullscreenButton from '../../fullscreen-button/fullscreen-button.vue'
import TimeCount from '../../time-count/time-count.vue'
import { useParticipantsPrompt } from '../../select-participants-dialog/states/use-participants-prompt'
import { useAsync } from '../../../hooks/use-async'
import { refresh, useStandups, useStandupType } from '../../../states/standups'
import {
  apiGetStandupDetail,
  apiStartStandup,
  apiSyncIssues,
  apiUpdateStandupParticipants,
} from '../../../apis'
import { dayjs, timeStr } from '../../../utils'

import type { Standup, User } from '../../../apis'

const router = useRouter()
const toast = useToast()
// meetingType 由页面（view）依据 route.query 同步到全局，这里直接消费全局状态
const meetingType = useStandupType()
const standups = useStandups()
const { getPrompt } = useParticipantsPrompt()

const todayStandup = computed(() =>
  standups.value.find((standup) => dayjs(standup.meetingDate).isSame(dayjs(), 'day')),
)
const isTodayStandupExist = computed(
  () => todayStandup.value && dayjs(todayStandup.value?.meetingDate).isSame(dayjs(), 'day'),
)
const isTodayStandupDone = computed(
  () => isTodayStandupExist.value && ['ENDED'].includes(todayStandup.value!.state),
)
const isTodayStandupInProgress = computed(
  () => isTodayStandupExist.value && ['IN_PROGRESS'].includes(todayStandup.value!.state),
)

const goDashboardPage = (standup: Standup) => {
  if (standup.state === 'IN_PROGRESS' || standup.state === 'ENDED') {
    const page =
      meetingType.value === 'day' ? 'daily' : meetingType.value === 'week' ? 'weekly' : 'monthly'
    router?.push(`/standup/dashboard/${page}?standupID=${standup.id}`)
  }
}

const getSelectedParticipants = async (selected?: User['id'][], notSelected?: User['id'][]) => {
  const selection = await getPrompt(selected, notSelected)
  if (!selection) {
    return false
  }
  if (selection.action === 'cancel') {
    return false
  }
  return selection.unSelected || ([] as User[])
}

const resetParticipantsReq = useAsync(async () => {
  if (!todayStandup.value?.id) {
    return toast.add({ title: '未找到今日会议', color: 'error' })
  }
  const detail = (await apiGetStandupDetail({ id: todayStandup.value.id })).data || {}
  const participants = await getSelectedParticipants([], detail.participants)
  if (!participants) {
    return
  }
  try {
    await apiUpdateStandupParticipants({
      id: todayStandup.value.id,
      participants: participants.map((x) => String(x.id)),
    })
    return toast.add({ title: '设置成功', color: 'success' })
  } catch {
    return toast.add({ title: '设置失败', color: 'error' })
  }
})

const handleContinueOrStarNewStandup = useAsync(async () => {
  const isContinue = todayStandup.value && isTodayStandupInProgress.value
  if (isContinue) {
    return goDashboardPage(todayStandup.value)
  }

  const participants = await getSelectedParticipants()
  if (!participants || participants.length === 0) {
    return
  }

  const req = await apiStartStandup({
    startTime: timeStr(),
    type: meetingType.value,
  })

  const target = req.data
  if (req.success && target?.id) {
    // start 接口只回 id；刷新列表后分组（useStandupGroups 响应式）自动重算
    await refresh()
    await apiUpdateStandupParticipants({
      id: target.id,
      participants: participants.map((x) => String(x.id)),
    })
    await apiGetStandupDetail({ id: target.id })

    nextTick(() => {
      const page = meetingType.value === 'week' ? 'weekly' : 'daily'
      router?.push(`/standup/dashboard/${page}?standupID=${target.id}`)
    })
  } else {
    toast.add({ title: '创建失败', color: 'error' })
  }
})
</script>

<style lang="less" scoped>
.header-section {
  grid-area: time;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .buttons-con {
    :deep(button) {
      width: 76px;
      height: 36px;
      line-height: 36px;
      border-radius: 2px;
    }
  }
}

.manual-sync {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
</style>
