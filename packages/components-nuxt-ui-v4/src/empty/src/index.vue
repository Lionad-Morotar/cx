<!-- CxNuxtUIV4Empty: 包装 Nuxt UI v4 UEmpty，透传标题/描述/图标/加载态 -->
<template>
  <UEmpty
    :title="props.title"
    :description="props.description"
    :icon="props.icon"
    :loading="props.loading"
    :variant="props.variant"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UEmpty } from '#components'

defineOptions({ name: 'CxNuxtUIV4Empty' })

const props = useAttrs() as {
  title?: string
  description?: string
  icon?: string
  loading?: boolean
  variant?: string
}
</script>
