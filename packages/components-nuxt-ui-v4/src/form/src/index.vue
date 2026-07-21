<!-- CxNuxtUIV4Form: 包装 Nuxt UI v4 UForm，作为表单字段容器渲染默认插槽 -->
<template>
  <UForm>
    <slot />
  </UForm>
</template>

<script setup lang="ts">
import { UForm } from '#components'

defineOptions({ name: 'CxNuxtUIV4Form' })
</script>
