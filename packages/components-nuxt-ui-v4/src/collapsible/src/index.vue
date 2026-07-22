<!-- CxNuxtUIV4Collapsible: 包装 Nuxt UI v4 UCollapsible，物料层 open 单向映射 v-model:open -->
<template>
  <UCollapsible
    :open="props.open"
    :disabled="props.disabled"
    :unmount-on-hide="props.unmountOnHide"
  >
    <slot />
    <template #content><slot name="content" /></template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UCollapsible } from '#components'

defineOptions({ name: 'CxNuxtUIV4Collapsible' })

const props = useAttrs() as {
  open?: boolean
  disabled?: boolean
  unmountOnHide?: boolean
}
</script>
