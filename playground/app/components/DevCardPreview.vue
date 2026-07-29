<template>
  <!-- 卡片预览区的回放渲染分支：setup 内一次性收窄 partial 的 null，
       模板零空值断言。渲染片段（无包裹元素），不改变卡片预览区布局。 -->
  <!-- 回放中：增量帧（数组增长型物料逐项长出；首帧未到前等待空态） -->
  <template v-if="replay.phase.value === 'playing'">
    <CxRender v-if="partialComponents.length" :components="partialComponents" />
    <span v-else class="muted">等待首个完整条目…</span>
  </template>
  <!-- 播完：完整渲染；无增量 trigger 的物料附一次性渲染说明 -->
  <template v-else-if="replay.phase.value === 'done'">
    <CxRender :components="[node]" />
    <span v-if="!replay.sawPartial.value" class="replay-note"
      >无增量 trigger，围栏闭合一次性渲染</span
    >
  </template>
  <CxRender v-else :components="[node]" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toRenderNode } from '~/dev/material-utils'
import type { CardReplay } from '~/dev/use-card-replay'
import type { CxComponentRuntime } from '@lionad/cx-definition'

defineOptions({ name: 'DevCardPreview' })

const props = defineProps<{
  node: CxComponentRuntime
  replay: CardReplay
}>()

// 增量帧 → CxRender 节点数组；null 收窄在 setup 内完成，模板按 length 分支
const partialComponents = computed(() => {
  const partial = props.replay.partial.value
  return partial ? [toRenderNode(partial)] : []
})
</script>

<style scoped>
.muted {
  font-size: 12px;
  color: #bbb;
}
.replay-note {
  margin-top: 6px;
  font-size: 11px;
  color: #c2410c;
}
</style>
