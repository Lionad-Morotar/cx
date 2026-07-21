<!-- CxNuxtUIV4InputDate: 包装 Nuxt UI v4 UInputDate，透传占位/尺寸/颜色 与 leading/trailing slot。
  注：UInputDate 为复合组件（Input + Calendar），dev 示例无 modelValue 时渲染空注释，
  生产需传入 modelValue（Date）才能完整渲染日历，属已知待优化项。 -->
<template>
  <UInputDate
    :placeholder="props.placeholder"
    :size="props.size"
    :color="props.color"
  >
    <template #leading><slot name="leading" /></template>
    <template #trailing><slot name="trailing" /></template>
  </UInputDate>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UInputDate } from '#components'

defineOptions({ name: 'CxNuxtUIV4InputDate' })

const props = useAttrs() as {
  placeholder?: string
  size?: string
  color?: string
}
</script>
