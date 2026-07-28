<template>
  <div class="cx-view-standup-github-grid standup-by-year">
    <div class="weekdays">
      <div
        v-for="weekday in showDayInWeek"
        :key="weekday"
        class="weekday-name"
        v-text="weekdayStrIDX(weekday)"
      />
    </div>
    <CxScrollbar class="scroll-area">
      <div class="months">
        <div
          v-for="month in showMonthInYear"
          :key="month"
          class="month-name"
          v-text="monthStrIDX(month)"
        />
      </div>
      <div
        class="calendar-col-pointer"
        :style="{
          ['--col-total']: Math.ceil(calendarItems.length),
        }"
      >
        <div
          class="today-col-pointer"
          :data-calendar-items-len="calendarItems.length"
          :data-days-per-week="daysPerWeek"
          :style="{
            ['--col']: Math.floor(passedDays.length / (daysPerWeek || 1)) + 1,
          }"
        />
      </div>
      <div class="calendar" @mouseover="onMouseOver">
        <div
          v-for="item in calendarItems"
          :key="item.id"
          :class="['day', `is-${item.state}`, isToday(item.day) && 'is-today']"
          :data-id="String(item.id)"
          :data-date="`${dayjs(item.day).format('YYYY-MM-DD')} ${weekdayStr(item.day)}`"
          @click="goStandup(item)"
        />
        <div ref="containerRightRef" class="empty" />
      </div>
    </CxScrollbar>
    <div class="legends">
      <div class="legend">
        <div class="day is-IN_PROGRESS"></div>
        <div class="label">进行中</div>
      </div>
      <div class="legend">
        <div class="day is-ENDED"></div>
        <div class="label">已结束</div>
      </div>
      <div class="legend">
        <div class="day is-UNKNOWN"></div>
        <div class="label">未进行</div>
      </div>
      <div class="legend">
        <div :class="['day', 'is-selected', `is-${hoverDay?.state}`]"></div>
        <div class="label">{{ currentHoverDate }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { v4 as uuidV4 } from 'uuid'
import { unref, computed, ref, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { unrefElement } from '@vueuse/core'
import { dayjs, getDayRange, monthStrIDX, weekdayStr, weekdayStrIDX, xToY } from '../../utils'
import { useStandupType, useStandups } from '../../states/standups'

import type { Dayjs } from 'dayjs'
import type { Standups } from '../../apis'

defineOptions({ name: 'CxViewStandupGithubGrid' })

type DayInCalendar = {
  day: Dayjs
  id: string
  state: 'IN_PROGRESS' | 'ENDED' | 'UNKNOWN'
}

const meetingType = useStandupType()

const router = useRouter()
const props = withDefaults(
  defineProps<{
    monthCount?: number
    standups?: Standups
  }>(),
  {
    monthCount: 12,
  },
)

const standups = props.standups ? computed(() => unref(props.standups) || []) : useStandups()

// 从周一到周日都需要展示
const showDayInWeek = ref([1, 2, 3, 4, 5, 6, 0])
const daysPerWeek = computed(() => showDayInWeek.value.length)

// 从一月到十二月都需要展示
const showMonthInYear = ref(xToY(0, 11))
const monthsPerYear = computed(() => showMonthInYear.value.length)

// 从周一开始计算
const from = computed(() =>
  dayjs()
    .startOf('month')
    .startOf('week')
    .add(-props.monthCount + 1, 'month')
    .startOf('week'),
)
const to = computed(() =>
  from.value
    .add(props.monthCount - 1, 'month')
    .add(1, 'month')
    .endOf('month'),
)
const genDay = computed(() => getDayRange(from.value, 'next', to.value))

watchEffect(() => {
  const start = from.value.month()
  const end = to.value.month()
  // console.log('[debug] start', start, from.value.format('YYYY-MM-DD'))
  showMonthInYear.value = [...xToY(start, 11), ...xToY(0, end)].slice(-props.monthCount)
})

watchEffect(() => {
  const start = from.value.weekday()
  // console.log('[debug] start', start, from.value.format('YYYY-MM-DD'))
  showDayInWeek.value = [...xToY(start, 6), ...xToY(0, start - 1)]
})

const calendarItems = computed(() => {
  const days = genDay.value.map((day) => {
    const targetStandup = standups.value.find((y) => dayjs(y.meetingDate).isSame(day, 'day'))
    return {
      day,
      id: uuidV4(),
      state: targetStandup ? targetStandup.state : 'UNKNOWN',
    }
  })
  return days
  // .filter(day => showMonthInYear.value.includes(day.day.month()))
  // .filter(day => showDayInWeek.value.includes(day.day.weekday()))
})
const passedDays = computed(() => calendarItems.value.filter((x) => x.day.isBefore(dayjs(), 'day')))

const hoverDay = ref<DayInCalendar>()
const currentHoverDate = ref('')
const onMouseOver = (event: Event) => {
  const target = event?.target as HTMLElement
  const [id, date] = [target?.getAttribute?.('data-id'), target?.getAttribute?.('data-date')]
  currentHoverDate.value = date || ''

  if (id) {
    hoverDay.value = calendarItems.value.find((y) => String(y.id) === String(id))
  }
}

const goStandup = (x: { day: Dayjs; state: string }) => {
  if (x.state === 'UNKNOWN') {
    return
  }
  const targetStandup = standups.value.find((y) => dayjs(y.meetingDate).isSame(x.day, 'day'))
  if (!targetStandup) return
  const detailPage =
    meetingType.value === 'week' ? '/standup/dashboard/weekly' : '/standup/dashboard/daily'
  return router.push({ path: detailPage, query: { standupID: targetStandup.id } })
}

const containerRightRef = ref()
// 已废弃的跳转分支（保留占位防误删关联样式）
onMounted(() => {
  const $elm = unrefElement(containerRightRef.value)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  $elm?.scrollInToViewIfNeeded?.({ behavior: 'smooth' })
})

const hasToday = computed(() => calendarItems.value.some((x) => isToday(x.day)))
const isToday = (day: Dayjs) => dayjs().isSame(day, 'day')
</script>

<style>
.standup-by-year {
  --item-size: 15px;
  --days-per-week: v-bind(daysPerWeek);
  --months-per-year: v-bind(monthsPerYear);

  --header: calc(1em + 12px);

  display: grid;
  gap: 0.35em 1em;
  grid-template-rows: minmax(0, 1fr) max-content;
  grid-template-columns: max-content minmax(0, 1fr);
  grid-template-areas:
    'weekdays scroll-area'
    '.        legends';
  /* for scrollbar */
  padding-bottom: 16px;

  --gap: 5px;
  --height: calc(
    var(--days-per-week, 7) * var(--item-size) + (var(--days-per-week, 7) - 1) * var(--gap)
  );

  .months {
    grid-area: months;
  }
  .weekdays {
    grid-area: weekdays;
    margin-top: var(--header);
  }
  .scroll-area {
    grid-area: scroll-area;
    display: grid;
    gap: 0.5em;
    grid-template-rows: 12px auto auto;
    grid-template-columns: auto;
    grid-template-areas:
      'months'
      'col-pointer'
      'calendar';
    padding-bottom: 12px;
  }
  .calendar-col-pointer {
    grid-area: col-pointer;
  }
  .legends {
    grid-area: legends;
  }
  .calendar {
    grid-area: calendar;
  }

  .months {
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .month-name {
      font-size: 12px;
      line-height: 1em;

      &:last-child {
        padding-right: calc((1 / v-bind(monthsPerYear) / 1.2 * 100) * 7px);
      }
    }
  }

  .weekdays {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: var(--height);

    .weekday-name {
      font-size: 12px;
      line-height: 1em;
    }
  }
  .calendar-col-pointer {
    display: grid;
    grid-template: 0 / repeat(auto-fill, 15px);
    gap: var(--gap);

    .today-col-pointer {
      grid-area: 1 / var(--col);
      position: relative;
      width: 100%;
      height: 0px;

      &::after {
        content: '';
        position: absolute;
        left: 50%;
        top: 50%;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #fe4d4f;
        transform: translate(-50%, -50%);
      }
    }
  }
  .calendar {
    display: grid;
    grid-template: repeat(auto-fit, var(--item-size)) / repeat(auto-fit, var(--item-size));
    grid-auto-flow: column;
    gap: var(--gap);
    width: fit-content;
    height: var(--height);
  }

  .day {
    box-sizing: border-box;
    width: var(--item-size);
    height: var(--item-size);
    border: solid 2px transparent;
    background: currentColor;
    color: #ececef;
    cursor: pointer;

    &.is-selected,
    &:hover {
      border-color: #666;
    }
    &:active {
      border-color: #333;
    }

    &.is-today.is-today {
      border-color: #fe4d4fff;

      &:hover {
        border-color: #fe5a5d;
      }
      &:active {
        border-color: #ff6c6e;
      }
    }

    &.is-UNKNOWN {
      color: #ececef;
      cursor: revert;
    }
    &.is-IN_PROGRESS {
      color: #73d13d;

      &:hover {
        border-color: #999;
      }
    }
    &.is-ENDED {
      color: #1678ff;
    }
  }

  .legends {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1em;

    .legend {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .label {
      font-size: 12px;
      color: #666;
    }
  }
}
.empty {
  justify-self: flex-end;
  align-self: flex-end;
  width: 1px;
  height: 1px;
  opacity: 0;
}
</style>
