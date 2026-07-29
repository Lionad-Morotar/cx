<!-- CxNuxtUIV4User: 包装 Nuxt UI v4 UUser，物料层扁平 props 组装 avatar 对象 -->
<template>
  <UUser
    :name="props.name"
    :description="props.description"
    :avatar="{ src: props.avatarSrc }"
    :size="props.size"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UUser } from '#components'

defineOptions({ name: 'CxNuxtUIV4User' })

const props = useAttrs() as {
  name?: string
  description?: string
  avatarSrc?: string
  size?: string
}
</script>
