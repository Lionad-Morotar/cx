<template>
  <v-calendar-date-picker
    v-if="date && (date as DatePickerRangeObject)?.start && (date as DatePickerRangeObject)?.end"
    v-model.range="date"
    :columns="2"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
  <v-calendar-date-picker
    v-else
    v-model="date"
    v-bind="{ ...attrs, ...$attrs }"
    @dayclick="onDayClick"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { PropType } from 'vue'

import { DatePicker as VCalendarDatePicker } from 'v-calendar'
/** 原引用路径在 v-calendar@3 中不存在（幻影类型），按使用面本地定义 */
type DatePickerDate = Date | string | number | null
type DatePickerRangeObject = { start: DatePickerDate; end: DatePickerDate }
import 'v-calendar/dist/style.css'

defineOptions({
  name: 'CxDatePicker',
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [Date, Object] as PropType<DatePickerDate | DatePickerRangeObject | null>,
    default: null,
  },
})

const emit = defineEmits(['update:model-value', 'close'])

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
    emit('close')
  },
})

const attrs = {
  transparent: true,
  borderless: true,
  color: 'primary',
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 2,
}

function onDayClick(_: any, event: MouseEvent) {
  const target = event.target as HTMLElement
  target.blur()
}
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  :root {
    --vc-neutral-50: rgb(var(--color-neutral-50));
    --vc-neutral-100: rgb(var(--color-neutral-100));
    --vc-neutral-200: rgb(var(--color-neutral-200));
    --vc-neutral-300: rgb(var(--color-neutral-300));
    --vc-neutral-400: rgb(var(--color-neutral-400));
    --vc-neutral-500: rgb(var(--color-neutral-500));
    --vc-neutral-600: rgb(var(--color-neutral-600));
    --vc-neutral-700: rgb(var(--color-neutral-700));
    --vc-neutral-800: rgb(var(--color-neutral-800));
    --vc-neutral-900: rgb(var(--color-neutral-900));
  }
  .vc-primary {
    --vc-accent-50: rgb(var(--color-primary-50));
    --vc-accent-100: rgb(var(--color-primary-100));
    --vc-accent-200: rgb(var(--color-primary-200));
    --vc-accent-300: rgb(var(--color-primary-300));
    --vc-accent-400: rgb(var(--color-primary-400));
    --vc-accent-500: rgb(var(--color-primary-500));
    --vc-accent-600: rgb(var(--color-primary-600));
    --vc-accent-700: rgb(var(--color-primary-700));
    --vc-accent-800: rgb(var(--color-primary-800));
    --vc-accent-900: rgb(var(--color-primary-900));
  }

  @include b('date-picker') {
    // ...
  }
}
</style>
