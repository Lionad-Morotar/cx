<template>
  <UPopover :popper="{ placement: 'bottom-start' }" class="cx-date-picker">
    <UButton icon="i-heroicons-calendar-days-20-solid" :label="label" />

    <template #panel="{ close }">
      <!-- date picker -->
      <template v-if="isDateMode">
        <cx-date-picker v-model="date" is-required @close="closeWithEmit(close)" />
      </template>

      <!-- range picker -->
      <template v-if="isDateRangeMode">
        <div class="flex items-center sm:divide-x divide-neutral-200 dark:divide-neutral-800">
          <div class="hidden sm:flex flex-col py-4">
            <UButton
              v-for="(range, index) in ranges"
              :key="index"
              :label="range.label"
              color="neutral"
              :variant="'subtle' as any"
              class="rounded-none px-6"
              :class="[
                isRangeSelected(range)
                  ? 'bg-neutral-100 dark:bg-neutral-800'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/50',
              ]"
              truncate
              @click="selectRange(range)"
            />
          </div>
          <cx-date-picker v-model="selected" @close="closeWithEmit(close)" />
        </div>
      </template>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { Time } from '@lionad/cx-vue'

import { computed, ref, watch } from 'vue'

import { UButton, UPopover } from '../../../vendor/bridge'

import CxDatePicker from './date-picker.vue'

defineOptions({ name: 'CxDatePicker' })

const emits = defineEmits(['change', 'close'])
const props = withDefaults(
  defineProps<{
    mode?: 'date' | 'date-range'
  }>(),
  {
    mode: 'date',
  },
)

const isDateMode = computed(() => props.mode === 'date')
const isDateRangeMode = computed(() => props.mode === 'date-range')

const label = computed(() => {
  if (isDateMode.value) return Time(date.value).format('YY-MM-DD')
  if (isDateRangeMode.value)
    return `${Time(selected.value.start).format('YY-MM-DD')} - ${Time(selected.value.end).format('YY-MM-DD')}`
  return 'Unknown Date'
})

/* ------------------------------- Date Picker ------------------------------ */

const date = ref(new Date())
watch(date, () => {
  if (isDateMode.value) {
    emits('change', date.value)
  }
})

/* ---------------------------- Date Range Picker --------------------------- */

const ranges = [
  { label: '上周', duration: 7, meter: 'days' },
  { label: '上月', duration: 1, meter: 'month' },
  { label: '上季度', duration: 3, meter: 'months' },
  { label: '上半年', duration: 6, meter: 'months' },
  { label: '去年', duration: 1, meter: 'year' },
] as const

type Range = (typeof ranges)[number]

const selected = ref({
  start: Time(new Date()).subtract(7, 'days').toDate(),
  end: Time(new Date()).add(7, 'days').toDate(),
})
watch(selected, () => {
  if (isDateRangeMode.value) {
    emits('change', selected.value)
  }
})

function isRangeSelected(duration: Range) {
  return (
    Time(selected.value.start).isSame(Time().subtract(duration.duration, duration.meter), 'day') &&
    Time(selected.value.end).isSame(Time(), 'day')
  )
}

function selectRange(duration: Range) {
  selected.value = {
    start: Time().subtract(duration.duration, duration.meter).toDate(),
    end: Time().toDate(),
  }
}

/* ------------------------------ interactions ------------------------------ */

const closeWithEmit = (close: () => void) => {
  close()
  emits('close')
}
</script>
