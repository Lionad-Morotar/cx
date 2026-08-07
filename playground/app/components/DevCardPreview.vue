<template>
  <!-- 卡片预览区的回放渲染分支：setup 内一次性收窄 partial 的 null，
       模板零空值断言。渲染片段（无包裹元素），不改变卡片预览区布局。 -->
  <!-- 回放中：增量帧（数组增长型物料逐项长出；首帧未到前等待空态） -->
  <template v-if="replay.phase.value === 'playing'">
    <CxRender v-if="partialComponents.length" :components="partialComponents" />
    <span v-else class="muted">等待首个完整条目…</span>
  </template>
  <!-- 播完：完整渲染（无增量 trigger 物料的说明文案由页面在卡片 footer 渲染） -->
  <template v-else-if="replay.phase.value === 'done'">
    <CxRender :components="[node]" />
  </template>
  <CxRender v-else :components="[node]" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toRenderableComponents } from '@lionad/cx-render'
import type { CardReplay } from '~/dev/use-card-replay'
import type { CxComponentRuntime } from '@lionad/cx-definition'

defineOptions({ name: 'DevCardPreview' })

const props = defineProps<{
  node: CxComponentRuntime
  replay: CardReplay
}>()

// 增量帧 → CxRender 节点数组：官方桥 prune + 赋确定性 id；
// 修剪后无可渲染节点为空数组，模板按 length 分支
const partialComponents = computed(
  () => toRenderableComponents(props.replay.partial.value, 'card-preview') ?? [],
)
</script>

<style scoped>
.muted {
  font-size: 12px;
  color: #bbb;
}
</style>
