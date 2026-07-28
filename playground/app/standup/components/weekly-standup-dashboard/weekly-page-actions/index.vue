<template>
  <div class="cx-weekly-page-actions buttons-con">
    <div v-if="isToday" class="meeting-spent-time-count">
      <img class="time-icon" :src="IconTime" />
      <cx-time-tick v-if="isCurStandupInProgress" :from="meetingDate" format="HH:mm:ss" />
      <cx-time-tick v-else :time="meetingDurationMS" format="HH:mm:ss" />
    </div>

    <UButton
      v-if="isCurStandupInProgress"
      ref="stopStandupButtonRef"
      variant="link"
      color="success"
      :loading="stopStandupReq.isLoading"
      @click="stopStandupReq.exec"
      >结束会议</UButton
    >
    <UButton ref="goBackBtnRef" @click="router.go(-1)">
      <span>返回</span>
    </UButton>
    <cx-fullscreen-button />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAsync } from '../../../hooks/use-async'
import { apiStopStandup } from '../../../apis'
import CxTimeTick from '../../time-tick'
import CxFullscreenButton from '../../fullscreen-button'
import { useStandupDetail } from '../../../states/standups'
import { dayjs } from '../../../utils'

import IconTime from '../../../assets/time.svg'

defineOptions({ name: 'CxWeeklyPageActions' })

const router = useRouter()
const toast = useToast()
const stopStandupButtonRef = ref<HTMLButtonElement>()
const goBackBtnRef = ref<HTMLButtonElement>()

const standup = useStandupDetail()
const isCurStandupInProgress = computed(() => standup.value.state === 'IN_PROGRESS')

const meetingDate = computed(() => {
  const date = standup.value.meetingDate
  const time = standup.value.startTime
  return date && time ? `${standup.value.meetingDate} ${standup.value.startTime}` : ''
})
const isToday = computed(() => dayjs().isSame(dayjs(meetingDate.value), 'day'))

const isCurStandupEnded = computed(() => standup.value.state === 'ENDED')
const meetingDurationMS = computed(() => {
  if (!isCurStandupEnded.value) {
    return 0
  }
  const end = dayjs(`${standup.value!.meetingDate} ${standup.value!.endTime}`).valueOf()
  const start = dayjs(`${standup.value!.meetingDate} ${standup.value!.startTime}`).valueOf()
  const zeroOClock = dayjs().startOf('day')
  return zeroOClock.add(end - start, 'millisecond')
})

const stopStandupReq = useAsync(async () => {
  const res = await apiStopStandup({
    type: 'week',
  })
  if (res.success) {
    toast.add({ title: '会议已结束', color: 'success' })
    await new Promise((resolve) => setTimeout(resolve, 500))
    router.go(-1)
  }
})
</script>

<style scoped>
.buttons-con {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;

  .meeting-spent-time-count {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    margin-right: 12.5px;
    padding: 8px 12px;
    width: auto;
    height: 34px;
    background: #e2f9e7;
    border-radius: 4px;

    .time-icon {
      width: 16px;
      height: 16px;
      color: #20ce86;
      fill: #20ce86;
    }
    .time {
      font-size: 14px;
      letter-spacing: 0;
    }
  }

  .el-button,
  button {
    width: 80px;
    height: 34px;
    line-height: 34px;
    border-radius: 3px;
  }
}
</style>
