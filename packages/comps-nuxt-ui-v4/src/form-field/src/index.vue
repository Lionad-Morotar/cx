<!-- CxNuxtUIV4FormField: 包装 Nuxt UI v4 UFormField，透传 label/校验/提示 与主要 slot -->
<template>
  <UFormField
    :label="props.label"
    :required="props.required"
    :error="props.error"
    :hint="props.hint"
    :help="props.help"
  >
    <template #default="slotProps"><slot v-bind="slotProps" /></template>
    <template #label><slot name="label" /></template>
    <template #help><slot name="help" /></template>
    <template #error="slotProps"><slot name="error" v-bind="slotProps" /></template>
  </UFormField>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UFormField } from '#components'

defineOptions({ name: 'CxNuxtUIV4FormField' })

const props = useAttrs() as {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  help?: string
}
</script>
