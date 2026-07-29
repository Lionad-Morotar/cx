<!-- CxNuxtUIV4Error: 包装 Nuxt UI v4 UError，物料层扁平 props 组装为 error 对象 -->
<template>
  <UError
    :error="{
      statusCode: props.statusCode,
      statusMessage: props.statusMessage,
      message: props.message,
    }"
    :icon="props.icon || undefined"
    :redirect="props.redirect"
    :clear="props.clear"
  >
    <template #leading><slot name="leading" /></template>
    <template #links><slot name="links" /></template>
  </UError>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UError } from '#components'

defineOptions({ name: 'CxNuxtUIV4Error' })

const props = useAttrs() as {
  statusCode?: number
  statusMessage?: string
  message?: string
  icon?: string
  redirect?: string
  clear?: boolean
}
</script>
