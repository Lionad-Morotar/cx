<!-- CxNuxtUIV4InputDate: 包装 Nuxt UI v4 UInputDate，透传尺寸/颜色 与 leading/trailing slot。
  物料层 value（YYYY-MM-DD 字符串）经 CalendarDate 转换为 default-value——
  UInputDate 无任何初始值时渲染为空，字符串是物料层对日期类型的低代码友好表达。
  外层 div 承接 cx 渲染链 fallthrough 的 class/style 与非标 attrs（cmpt 运行时对象等）：
  直接落在 UInputDate 上会经其 v-bind="$attrs" 穿透到 Reka DateFieldRoot/Primitive 组件链，
  在 vnode 归一化阶段触发只读代理写入异常（'set' on proxy）导致整支渲染中断。 -->
<template>
  <div class="cx-input-date-wrapper">
    <UInputDate :default-value="defaultValue" :size="props.size" :color="props.color">
      <template #leading><slot name="leading" /></template>
      <template #trailing><slot name="trailing" /></template>
    </UInputDate>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { CalendarDate } from '@internationalized/date'
import { UInputDate } from '#components'

defineOptions({ name: 'CxNuxtUIV4InputDate', inheritAttrs: false })

const props = useAttrs() as {
  value?: string
  size?: string
  color?: string
}

// 非法日期串时回退 undefined（组件按无值渲染，不抛错中断画布）
const defaultValue = computed(() => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(props.value ?? '')
  if (!m) return undefined
  return new CalendarDate(Number(m[1]), Number(m[2]), Number(m[3]))
})
</script>
