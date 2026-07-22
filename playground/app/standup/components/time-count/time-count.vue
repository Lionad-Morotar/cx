<template>
  <div class="time-stamp">
    <span class="time">{{ displayTime }}</span>
    <span class="weekday" v-if="props.weekday">{{ displayWeekday }}</span>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue'
import { useInterval } from '@vueuse/core'
import { dayjs, weekdayStr } from '../../utils'

import type { Dayjs } from 'dayjs'

const props = withDefaults(
  defineProps<{
    time?: Dayjs | string | number | (() => Dayjs | string | number)
    format?: string
    run?: boolean
    weekday?: boolean
  }>(),
  {
    time: () => () => dayjs(),
    format: 'YYYY/MM/DD HH:mm:ss',
    run: true,
    weekday: false,
  },
)

const displayWeekday = ref(weekdayStr(dayjs()))
const displayTime = ref(dayjs().format(props.format))

// 就算刚开始是 500 的间隔，
// 间隔会在几秒钟后变成 1000，
// 可能是 vueuse 的问题，待排查
const checkTime = useInterval(500, { immediate: true })

watchEffect(() => {
  // console.log(checkTime.value)
  if (checkTime.value) {
    const time = props.time instanceof Function ? props.time() : props.time
    displayTime.value = dayjs(time).format(props.format)
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
    color: #373737;
    letter-spacing: 1.5px;
  }
  .time {
    font-size: 20px;
  }
  .weekday {
    font-size: 22px;
  }
}
</style>
