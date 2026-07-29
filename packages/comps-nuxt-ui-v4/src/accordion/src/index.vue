<!-- CxNuxtUIV4Accordion: 包装 Nuxt UI v4 UAccordion；multiple 布尔映射到 v4 type（single/multiple） -->
<template>
  <UAccordion
    :items="props.items"
    :type="props.multiple ? 'multiple' : 'single'"
    :collapsible="props.collapsible"
    :disabled="props.disabled"
  >
    <template #default="scope"><slot v-bind="scope" /></template>
    <template #leading="scope"><slot name="leading" v-bind="scope" /></template>
    <template #trailing="scope"><slot name="trailing" v-bind="scope" /></template>
    <template #content="scope"><slot name="content" v-bind="scope" /></template>
  </UAccordion>
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { UAccordion } from '#components'

defineOptions({ name: 'CxNuxtUIV4Accordion' })

const props = useAttrs() as {
  items?: any[]
  multiple?: boolean
  collapsible?: boolean
  disabled?: boolean
}
</script>
