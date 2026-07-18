<template>
  <div>
    <!-- cx internal error boundary -->
    {{ info }} <span v-if="component">- {{ key }} - {{ id }}</span>
  </div>
</template>

<script setup lang="ts">
import type { CxComponentRuntime } from '@lionad/cx-definition'

defineOptions({ name: 'CxRenderInfo' })

const props = withDefaults(
  defineProps<{
    component?: CxComponentRuntime
    info?: string
  }>(),
  {},
)

const component = props?.component || ({} as CxComponentRuntime)
const key = (component.key || '').slice(-6)
const id = (component.id || '').slice(-6)

const info = props?.info || 'no msg'
</script>
