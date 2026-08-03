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
        <span v-if="standup.state === 'IN_PROGRESS'" class="progress-state" type="success"
          >进行中</span
        >
        <span v-else-if="standup.state === 'ENDED'" class="progress-state">已结束</span>
        <span v-else class="progress-state" type="info" plain>未进行</span>
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
      <div v-if="isWeeklyMeeting" class="icon-tip">
        {{ displayMeetingOrder(props.idx) }}
      </div>
      <div v-else class="icon-tip">{{ weekdayENShort }}</div>
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

<style scoped>
/* 状态色映射：进行中=LIVE / 已结束=DONE / 未进行=PENDING。
   边框恒 1px 占位，悬浮只换颜色与辉光，几何尺寸不跳变 */
.standup-card {
  position: relative;
}

.standup-card.is-card {
  display: grid;
  grid-template: 32px 118px / 100%;
  background: var(--su-bg-raised);
  border-radius: var(--su-radius-card);
  border: solid 1px var(--su-border);
  transition:
    border-color var(--su-dur) var(--su-ease),
    box-shadow var(--su-dur) var(--su-ease),
    translate var(--su-dur) var(--su-ease);
  overflow: hidden;

  &.is-week-meeting {
    grid-template: 32px 138px / 100%;
  }

  &.is-IN_PROGRESS,
  &.is-ENDED {
    cursor: pointer;

    &:hover {
      translate: 0 -2px;
      box-shadow: var(--su-shadow-raised);
    }
    &:active {
      translate: 0 0;
    }
  }

  &.is-IN_PROGRESS {
    border-color: color-mix(in oklab, var(--su-state-live) 45%, transparent);

    .day-header {
      background: var(--su-state-live);
    }
    &:hover {
      border-color: var(--su-state-live);
      box-shadow: 0 8px 28px var(--su-state-live-glow);
    }
  }
  &.is-ENDED {
    .day-header {
      background: var(--su-state-done);
    }
    &:hover {
      border-color: var(--su-state-done);
      box-shadow: 0 8px 28px var(--su-state-done-glow);
    }
  }

  .day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    background: var(--su-state-pending);

    .time,
    :deep(.time) {
      color: var(--su-ink-invert);
      font-family: var(--su-font-display);
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 0.04em;
      font-variant-numeric: tabular-nums;
    }
    .progress-state {
      color: var(--su-ink-invert);
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      padding: 0.15em 0.6em;
      border-radius: var(--su-radius-pill);
      background: color-mix(in oklab, var(--su-ink-invert) 22%, transparent);
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
      color: var(--su-ink-3);
      font-size: 14px;
    }
    .value {
      color: var(--su-ink);
      font-size: 13px;
      font-variant-numeric: tabular-nums;
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
    font-family: var(--su-font-display);
    font-size: 28px;
    font-weight: 800;
    font-stretch: 110%;
    color: color-mix(in oklab, var(--su-ink) 8%, transparent);
    fill: color-mix(in oklab, var(--su-ink) 8%, transparent);
    line-height: 28px;
    letter-spacing: 1.5px;
    pointer-events: none;

    .icon {
      width: 32px;
      height: 32px;
      color: inherit;
      fill: inherit;
    }
    :deep(svg) {
      color: inherit;
      fill: inherit;
    }
  }
}
.standup-card.is-list-item {
  display: grid;
  grid-template: 26px / auto minmax(max-content, 153px) minmax(max-content, 1fr) 50px;
  gap: 2em;
  padding: 8px 12px;
  align-items: center;
  background: var(--su-bg-raised);
  border-radius: var(--su-radius-control);
  border: solid 1px var(--su-border);
  transition:
    border-color var(--su-dur) var(--su-ease),
    box-shadow var(--su-dur) var(--su-ease);

  &.is-IN_PROGRESS,
  &.is-ENDED {
    cursor: pointer;

    &:hover {
      border-color: var(--su-border-strong);
      box-shadow: var(--su-shadow-card);
    }
  }
  &.is-IN_PROGRESS {
    border-color: color-mix(in oklab, var(--su-state-live) 45%, transparent);
  }

  .icon-face {
    font-size: 14px;
  }
  &.is-IN_PROGRESS .icon-face {
    color: var(--su-state-live);
  }
  &.is-ENDED .icon-face {
    color: var(--su-state-done);
  }
  .time {
    color: var(--su-ink);
    font-variant-numeric: tabular-nums;
  }
  .time-range {
    display: flex;
    align-items: center;
    gap: 0.2em;
    font-size: 13px;
    color: var(--su-ink-2);
    font-variant-numeric: tabular-nums;

    .sep {
      display: inline-block;
      width: 0.2em;
    }
    .label {
      color: var(--su-ink-3);
    }
  }

  :deep(.el-tag),
  :deep([class*='badge']) {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .standup-card.is-card,
  .standup-card.is-list-item {
    transition: none;
  }
  .standup-card.is-card.is-IN_PROGRESS:hover,
  .standup-card.is-card.is-ENDED:hover {
    translate: none;
  }
}
</style>
