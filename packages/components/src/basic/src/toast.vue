<template>
  <span style="display: none" aria-hidden="true" />
</template>

<script setup lang="ts">
import type { CxComponentRuntime } from '@lionad/cx-definition'
import { useCxToast } from '@lionad/cx-vue'
import type { CxToastOptions } from '@lionad/cx-vue'

defineOptions({ name: 'CxToast' })

defineProps<{ cmpt: CxComponentRuntime }>()

const toast = useCxToast()

/**
 * 反馈物料：经 cx-vue 的 useCxToast 桥调用宿主 toast 实现（如 nuxt-ui useToast）。
 * headless 无 UI；exposes show 供 _cx_events 路由触发
 * （如 cx-action success → cx-toast.show）。
 */
defineExpose({
  show: (opts: CxToastOptions) => toast.show(opts),
})
</script>
