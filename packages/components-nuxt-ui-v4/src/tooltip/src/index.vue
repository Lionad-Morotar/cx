<!-- CxNuxtUIV4Tooltip: 包装 Nuxt UI v4 UTooltip。
  v4 无顶级 placement，方位通过 content.side 传入；物料层做此映射。 -->
<template>
  <UTooltip :text="props.text" :open="props.open" :content="{ side: props.placement }">
    <template #default><slot name="default" /></template>
  </UTooltip>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UTooltip } from '#components'

defineOptions({ name: 'CxNuxtUIV4Tooltip' })

const props = useAttrs() as {
  text?: string
  placement?: string
  open?: boolean
}
</script>
