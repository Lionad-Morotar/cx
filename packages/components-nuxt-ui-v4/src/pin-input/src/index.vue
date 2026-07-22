<!-- CxNuxtUIV4PinInput: 包装 Nuxt UI v4 UPinInput，透传位数/类型/掩码等 props -->
<template>
  <UPinInput
    :length="props.length"
    :type="props.type"
    :mask="props.mask"
    :otp="props.otp"
    :placeholder="props.placeholder"
    :separator="props.separator || undefined"
    :color="props.color"
    :disabled="props.disabled"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UPinInput } from '#components'

defineOptions({ name: 'CxNuxtUIV4PinInput' })

const props = useAttrs() as {
  length?: number
  type?: 'text' | 'number'
  mask?: boolean
  otp?: boolean
  placeholder?: string
  separator?: number
  color?: string
  disabled?: boolean
}
</script>
