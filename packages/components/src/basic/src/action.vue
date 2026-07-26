<template>
  <span style="display: none" aria-hidden="true" />
</template>

<script setup lang="ts">
import type { CxComponentRuntime } from '@lionad/cx-definition'

defineOptions({ name: 'CxAction' })

const props = defineProps<{
  comp: CxComponentRuntime
  action?: (...args: any[]) => Promise<any> | any
  args?: any[]
}>()

const emit = defineEmits<{ success: [data: any]; error: [err: any] }>()

/**
 * 编排枢纽物料：执行宿主注入的异步函数（如 API 调用），把 loading/data/error
 * 写进自身 comp.data，供其他物料经 _cx_data_config 按同名 key 绑定；成功/失败
 * 经 emit 供 _cx_events 路由到 cx-toast/cx-navigate。
 *
 * 异步封装在物料内部——框架事件系统只需同步派发"调 exec"，Promise 等待与
 * try-catch 在此处完成，消解了框架事件不支持 async 的限制。
 *
 * 本物料是纯粹的异步执行器 + 状态机：业务知识全在 props.action（宿主 view 层
 * 注入），与 cx-logic「物料是通用原语，业务在拓扑」保持一致。
 */
async function exec(...runtimeArgs: any[]) {
  props.comp.data.loading = true
  props.comp.data.error = null
  try {
    const data = await props.action?.(...(props.args ?? []), ...runtimeArgs)
    props.comp.data.data = data
    emit('success', data)
  } catch (err) {
    props.comp.data.error = err
    emit('error', err)
  } finally {
    props.comp.data.loading = false
  }
}

defineExpose({ exec })
</script>
