<!-- CxNuxtUIV4Link: 包装 Nuxt UI v4 ULink；v4 无 label prop，label 经 default slot 回退注入 -->
<template>
  <ULink :to="props.to">
    <slot>{{ props.label }}</slot>
  </ULink>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ULink } from '#components'

defineOptions({ name: 'CxNuxtUIV4Link' })

const props = useAttrs() as {
  to?: string
  label?: string
}
</script>
