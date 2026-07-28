<template>
  <cx-time-count format="HH:mm:ss" :time="getOffset" v-bind="$attrs" class="cx-time-tick" />
</template>

<script lang="ts" setup>
import { dayjs } from '../../utils'
import CxTimeCount from '../time-count'

import type { Dayjs } from 'dayjs'

defineOptions({ name: 'CxTimeTick' })

const props = withDefaults(
  defineProps<{
    from?: Dayjs | string | number
  }>(),
  {
    from: () => dayjs(),
  },
)

const getOffset = () => {
  const ms = dayjs().valueOf() - dayjs(props.from).valueOf()
  const zero = dayjs().startOf('day')
  return zero.add(ms, 'millisecond')
}
</script>
