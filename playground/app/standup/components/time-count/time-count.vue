<template>
  <div class="cx-time-count time-stamp" :class="{ 'is-split': props.split }">
    <template v-if="props.split">
      <span class="date">{{ displayDate }}</span>
      <span v-if="displayClock" class="clock">{{ displayClock }}</span>
      <span v-if="props.weekday" class="weekday">{{ displayWeekday }}</span>
    </template>
    <template v-else>
      <span class="time">{{ displayTime }}</span>
      <span v-if="props.weekday" class="weekday">{{ displayWeekday }}</span>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { useInterval } from '@vueuse/core'
import { dayjs, weekdayStr } from '../../utils'

import type { Dayjs } from 'dayjs'

defineOptions({ name: 'CxTimeCount' })

const props = withDefaults(
  defineProps<{
    time?: Dayjs | string | number | (() => Dayjs | string | number)
    format?: string
    run?: boolean
    weekday?: boolean
    /** split：把 format 按空格拆成日期段 + 时钟段分开呈现（品牌区大日期排版用） */
    split?: boolean
  }>(),
  {
    time: () => () => dayjs(),
    format: 'YYYY/MM/DD HH:mm:ss',
    run: true,
    weekday: false,
    split: false,
  },
)

// format 按首个空格拆分：日期 tokens 与时钟 tokens 分别格式化。
// 无空格的 format（如纯日期）时钟段为空，模板自动隐藏
const [dateFmt, clockFmt = ''] = props.format.split(' ')

const displayWeekday = ref(weekdayStr(dayjs()))
const displayTime = ref(dayjs().format(props.format))
const displayDate = ref(dayjs().format(dateFmt))
const displayClock = ref(clockFmt ? dayjs().format(clockFmt) : '')

// 就算刚开始是 500 的间隔，
// 间隔会在几秒钟后变成 1000，
// 可能是 vueuse 的问题，待排查
const checkTime = useInterval(500, { immediate: true })

watchEffect(() => {
  // console.log(checkTime.value)
  if (checkTime.value) {
    const time = props.time instanceof Function ? props.time() : props.time
    const m = dayjs(time)
    displayTime.value = m.format(props.format)
    displayDate.value = m.format(dateFmt)
    displayClock.value = clockFmt ? m.format(clockFmt) : ''
    displayWeekday.value = weekdayStr(dayjs(displayTime.value))
  }
})
</script>

<style scoped>
.time-stamp {
  display: flex;
  align-items: center;
  gap: 1.5em;

  .time,
  .weekday {
    flex-shrink: 0;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-weight: bold;
    color: var(--su-ink);
    letter-spacing: 1.5px;
  }
  .time {
    font-size: 20px;
  }
  .weekday {
    font-size: 22px;
  }
}

/* split：品牌区排版。日期为展示字体主角，时钟与星期降为伴读 */
.time-stamp.is-split {
  gap: 0.6em;
  align-items: baseline;

  .date {
    font-family: var(--su-font-display);
    font-weight: 800;
    font-stretch: 115%;
    font-size: clamp(28px, 3.2vw, 44px);
    line-height: 1;
    letter-spacing: 0.01em;
    color: var(--su-ink);
    font-variant-numeric: tabular-nums;
  }
  .clock {
    font-family: var(--su-font-display);
    font-weight: 500;
    font-size: clamp(13px, 1.2vw, 16px);
    letter-spacing: 0.06em;
    color: var(--su-ink-3);
    font-variant-numeric: tabular-nums;
  }
  .weekday {
    font-family: var(--su-font-display);
    font-weight: 600;
    font-size: clamp(13px, 1.2vw, 16px);
    letter-spacing: 0.06em;
    color: var(--su-ink-2);
  }
}
</style>
