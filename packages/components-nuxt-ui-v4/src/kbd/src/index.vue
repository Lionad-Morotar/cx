<!-- CxNuxtUIV4Kbd: 包装 Nuxt UI v4 UKbd；value 经 default slot 直接渲染，绕过 getKbdKey 的键名转换以保真显示 -->
<template>
  <UKbd :value="props.value" :color="props.color" :variant="props.variant" :size="props.size">
    <template #default
      ><slot>{{ props.value }}</slot></template
    >
  </UKbd>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UKbd } from '#components'

defineOptions({ name: 'CxNuxtUIV4Kbd' })

const props = useAttrs() as {
  value?: string
  color?: string
  variant?: string
  size?: string
}
</script>
