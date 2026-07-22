<!-- CxNuxtUIV4InputTags: 包装 Nuxt UI v4 UInputTags，物料层 tags 单向映射 default-value -->
<template>
  <UInputTags
    :default-value="props.tags"
    :placeholder="props.placeholder"
    :max-length="props.maxLength"
    :icon="props.icon || undefined"
    :color="props.color"
    :disabled="props.disabled"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UInputTags } from '#components'

defineOptions({ name: 'CxNuxtUIV4InputTags' })

const props = useAttrs() as {
  tags?: string[]
  placeholder?: string
  maxLength?: number
  icon?: string
  color?: string
  disabled?: boolean
}
</script>
