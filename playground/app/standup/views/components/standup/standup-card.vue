<template>
  <div
    class="standup-card"
    :class="[`is-${standup.state}`, `is-${props.viewType}`, `is-${meetingType}-meeting`]"
  >
    <template v-if="props.viewType === 'card'">
      <div class="day-header">
        <slot name="card-title">
          <div class="time">
            {{ dayjs(standup.meetingDate).format(isWeeklyMeeting ? 'MM / DD' : 'DD') }}
          </div>
        </slot>
        <span class="progress-state" v-if="standup.state === 'IN_PROGRESS'" type="success"
          >进行中</span
        >
        <span class="progress-state" v-else-if="standup.state === 'ENDED'">已结束</span>
        <span class="progress-state" v-else type="info" plain>未进行</span>
      </div>
      <div class="day-content">
        <div class="line">
          <div class="label" title="日期">
            <!-- <object class="icon" :data="IconDay" type="image/svg+xml"></object> -->
            <img class="icon" :src="IconDay" />
          </div>
          <div class="value">
            {{ dayjs(standup.meetingDate).format('YYYY/MM/DD') }}
          </div>
        </div>
        <div class="line">
          <div class="label" title="时间">
            <!-- <object
              class="icon"
              :data="IconStartTime"
              type="image/svg+xml"
            ></object> -->
            <img class="icon" :src="IconStartTime" />
          </div>
          <div class="value">{{ displayStandupTime }}</div>
        </div>
        <div class="line">
          <div class="label" title="会议时长">
            <!-- <object class="icon" :data="IconTime" type="image/svg+xml"></object> -->
            <img class="icon" :src="IconTime" />
          </div>
          <div class="value">{{ displayDuration }}</div>
        </div>
      </div>
      <div class="icon-tip" v-if="isWeeklyMeeting">
        {{ displayMeetingOrder(props.idx) }}
      </div>
      <div class="icon-tip" v-else>{{ weekdayENShort }}</div>
    </template>
    <template v-if="props.viewType === 'list-item'">
      <CxSvgIcon v-if="standup.state === 'IN_PROGRESS'" class="icon-face" icon-class="meh-fill" />
      <CxSvgIcon v-else-if="standup.state === 'ENDED'" class="icon-face" icon-class="smile-fill" />
      <CxSvgIcon v-else class="icon-face" icon-class="frown-fill" />
      <div class="time">{{ standup.meetingDate }}</div>
      <div class="time-range">
        <template v-if="standup.startTime">
          <span class="value">{{ standup.startTime }}</span>
          <span class="label">开始</span>
        </template>
        <template v-if="standup.endTime">
          <span class="sep" />
          <span class="value">{{ standup.endTime }}</span>
          <span class="label">结束</span>
        </template>
      </div>
      <UBadge v-if="standup.state === 'IN_PROGRESS'" color="success">进行中</UBadge>
      <UBadge v-else-if="standup.state === 'ENDED'">已结束</UBadge>
      <UBadge v-else color="info" variant="outline">未进行</UBadge>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { isEmpty, dayjs, weekdayStrEN, secondToManStringCN } from '../../../utils'
import { useStandupType } from '../../../states/standups'

import IconTime from '../../../assets/time.svg'
import IconDay from './icons/day.svg'
import IconStartTime from './icons/start-time.svg'

import type { Standup, GroupOfStandup } from '../../../apis'

const meetingType = useStandupType()
const isWeeklyMeeting = computed(() => meetingType.value === 'week')

const props = defineProps<{
  group: GroupOfStandup
  standup: Standup
  viewType: 'card' | 'list-item'
  idx: number
}>()

const standup = computed(() => props.standup)

const weekdayENShort = computed(() => weekdayStrEN(standup.value.meetingDate, true))

const displayStandupTime = computed(() => {
  const time = [
    isEmpty(standup.value.startTime) ? '' : standup.value.startTime,
    isEmpty(standup.value.endTime) ? '' : standup.value.endTime,
  ]
  return time.join(' - ')
})

const displayDuration = computed(() => {
  // console.log('standup.value', standup.value)
  if (isEmpty(standup.value.startTime)) {
    return '-'
  }
  const time = [
    standup.value.meetingDate + ' ' + standup.value.startTime,
    standup.value.endTime ? standup.value.meetingDate + ' ' + standup.value.endTime : dayjs(),
  ]
  // console.log(time)

  if (time.length < 2) {
    return '-'
  }

  return secondToManStringCN((dayjs(time[1]).valueOf() - dayjs(time[0]).valueOf()) / 1000)
})

const displayMeetingOrder = (idx: number) => {
  const mapper = {
    0: '1st',
    1: '2nd',
    2: '3rd',
    3: '4th',
    4: '5th',
    5: '6th',
  } as const
  return mapper[idx as keyof typeof mapper] || ''
}
</script>

<style lang="less" scoped>
.standup-card {
  position: relative;
}

.standup-card.is-card {
  display: grid;
  grid-template: 32px 118px / 100%;
  background: white;
  border-radius: 4px;
  border: solid 1px transparent;
  transition: 0.2s;
  overflow: hidden;

  &.is-week-meeting {
    grid-template: 32px 138px / 100%;
  }

  &.is-IN_PROGRESS,
  &.is-ENDED {
    cursor: pointer;

    &:hover {
      border-color: #5c9ef6;
    }
    &:active {
      border-color: #388af7;
    }
  }

  &.is-IN_PROGRESS {
    .day-header {
      background: #73d13d;
    }
  }
  &.is-ENDED {
    .day-header {
      background: #1678ff;
    }
  }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    background: #8c8c8c;

    .time,
    :deep(.time),
    .progress-state {
      color: white;
      font-size: 14px;
    }
    .time,
    :deep(.time) {
      font-weight: bold;
    }
  }

  .day-content {
    padding: 8px 10px;

    .line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 24px;
    }
    .label {
      display: grid;
      place-items: center;
      color: #666;
      font-size: 14px;
    }
    .value {
      color: #222;
      font-size: 14px;
    }
  }

  &.is-week-meeting {
    .icon-tip {
      font-size: 30px;
    }
  }
  .icon-tip {
    position: absolute;
    bottom: 8px;
    right: 8px;
    font-size: 28px;
    font-weight: bold;
    color: #f0f0f0;
    fill: #f0f0f0;
    line-height: 28px;
    letter-spacing: 1.5px;

    .icon {
      width: 32px;
      height: 32px;
      color: #f0f0f0;
      fill: #f0f0f0;
    }
    :deep(svg) {
      color: #f0f0f0;
      fill: #f0f0f0;
    }
  }
}
.standup-card.is-list-item {
  display: grid;
  grid-template: 26px / auto minmax(max-content, 153px) minmax(max-content, 1fr) 50px;
  gap: 2em;
  padding: 8px 12px;
  align-items: center;
  background: white;
  border-radius: 4px;
  border: solid 1px transparent;
  transition: 0.2s;

  &.is-IN_PROGRESS,
  &.is-ENDED {
    cursor: pointer;

    &:hover {
      border-color: #5c9ef6;
    }
    &:active {
      border-color: #388af7;
    }
  }

  .icon-face {
    font-size: 14px;
  }
  .time {
    color: #333;
  }
  .time-range {
    display: flex;
    align-items: center;
    gap: 0.2em;
    font-size: 14px;
    color: #333;

    .sep {
      display: inline-block;
      width: 0.2em;
    }
    .label {
      color: #999;
    }
  }

  :deep(.el-tag),
  :deep([class*='badge']) {
    font-size: 12px;
  }
}
</style>
