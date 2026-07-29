<!-- CxNuxtUIV4Icon: 包装 Nuxt UI v4 UIcon；无 slot，仅透传 name 与 size -->
<template>
  <UIcon :name="props.name" :size="props.size" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UIcon } from '#components'

defineOptions({ name: 'CxNuxtUIV4Icon' })

const props = useAttrs() as {
  name?: string
  size?: string | number
}
</script>
