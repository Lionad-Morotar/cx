<template>
  <span style="display: none" aria-hidden="true" />
</template>

<script setup lang="ts">
import type { CxComponentRuntime } from '@lionad/cx-definition'
import { watchEffect } from 'vue'

import { safeEval } from './computed-eval'

defineOptions({ name: 'CxComputed' })

const props = defineProps<{
  cmpt: CxComponentRuntime
  expr: string
  ctx?: Record<string, any>
}>()

/**
 * 派生状态物料：用受限表达式（safeEval）对 ctx 求值，结果写入 cmpt.data.value，
 * 供其他物料经 _cx_data_config 绑定。用于声明「:disabled="a || b"」这类布尔逻辑。
 *
 * safeEval 不执行任意代码（无 eval/Function），标识符仅查 ctx；
 * 非法语法抛错时回退 undefined + 警告，保持渲染链路可用。
 */
watchEffect(() => {
  try {
    props.cmpt.data.value = safeEval(props.expr, props.ctx ?? {})
  } catch (e) {
    console.warn('[cx-computed] 表达式求值失败:', props.expr, e)
    props.cmpt.data.value = undefined
  }
})
</script>
