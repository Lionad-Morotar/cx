<!-- CxNuxtUIV4Separator: 包装 Nuxt UI v4 USeparator 分割线 -->
<template>
  <USeparator
    :label="props.label"
    :orientation="props.orientation"
    :color="props.color"
    :type="props.type"
  >
    <template #default><slot /></template>
  </USeparator>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { USeparator } from '#components'

defineOptions({ name: 'CxNuxtUIV4Separator' })

const props = useAttrs() as {
  label?: string
  orientation?: string
  color?: string
  type?: string
}
</script>
