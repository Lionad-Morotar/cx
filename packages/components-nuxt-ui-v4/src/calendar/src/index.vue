<!-- CxNuxtUIV4Calendar: 包装 Nuxt UI v4 UCalendar，透传展示配置 props -->
<template>
  <UCalendar
    :type="props.type"
    :multiple="props.multiple"
    :range="props.range"
    :number-of-months="props.numberOfMonths"
    :fixed-weeks="props.fixedWeeks"
    :week-numbers="props.weekNumbers"
    :color="props.color"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UCalendar } from '#components'

defineOptions({ name: 'CxNuxtUIV4Calendar' })

const props = useAttrs() as {
  type?: 'date' | 'month' | 'year'
  multiple?: boolean
  range?: boolean
  numberOfMonths?: number
  fixedWeeks?: boolean
  weekNumbers?: boolean
  color?: string
}
</script>
