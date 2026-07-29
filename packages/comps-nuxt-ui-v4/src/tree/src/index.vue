<!-- CxNuxtUIV4Tree: 包装 Nuxt UI v4 UTree，透传节点 items 与多选 -->
<template>
  <UTree :items="props.items" :multiple="props.multiple" />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UTree } from '#components'

defineOptions({ name: 'CxNuxtUIV4Tree' })

const props = useAttrs() as {
  items?: unknown[]
  multiple?: boolean
}
</script>
