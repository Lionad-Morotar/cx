<template>
  <span style="display: none" aria-hidden="true" />
</template>

<script setup lang="ts">
import type { CxComponentRuntime } from '@lionad/cx-definition'
import { useCxNavigate } from '@lionad/cx-vue'
import type { CxNavigateTarget } from '@lionad/cx-vue'

defineOptions({ name: 'CxNavigate' })

defineProps<{ comp: CxComponentRuntime }>()

const navigate = useCxNavigate()

/**
 * 导航物料：经 cx-vue 的 useCxNavigate 桥调用宿主路由（如 vue-router useRouter）。
 * headless 无 UI；exposes push/replace 供 _cx_events 路由触发
 * （如 cx-action success → cx-navigate.push）。
 */
defineExpose({
  push: (to: CxNavigateTarget) => navigate.push(to),
  replace: (to: CxNavigateTarget) => navigate.replace(to),
})
</script>
