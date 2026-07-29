<!-- CxNuxtUIV4ColorPicker: 包装 Nuxt UI v4 UColorPicker，物料层 value 单向映射 default-value -->
<template>
  <UColorPicker
    :default-value="props.value"
    :format="props.format"
    :size="props.size"
    :disabled="props.disabled"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UColorPicker } from '#components'

defineOptions({ name: 'CxNuxtUIV4ColorPicker' })

const props = useAttrs() as {
  value?: string
  format?: 'hex' | 'rgb' | 'hsl' | 'cmyk' | 'lab'
  size?: string
  disabled?: boolean
}
</script>
