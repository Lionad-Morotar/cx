<template>
  <!-- 代码差异卡片；三键（patch/oldCode/newCode）全缺席期间以骨架条组替换物料占位 -->
  <StreamSkeleton v-if="streamingDiff" :class="ns.b()" />
  <CodeDiff v-else v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { CodeDiff } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import StreamSkeleton from '../../shared/stream-skeleton.vue'
import { useVtuProps } from '../../shared/use-vtu-props'

import type { CodeDiffProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuCodeDiff', inheritAttrs: false })

const ns = useCxBEM('vtu-code-diff')
const attrs = useAttrs()
const vtuProps = useVtuProps<CodeDiffProps>(attrs, 'cx-vtu-code-diff')

// 双模式互斥且无必填键（三键全可选），_cx_streaming 标记会终态常亮故
// 声明层不设 skeletonFields；骨架判据改为直查三键——schema superRefine
// 保证完整帧必含其一，判据终态必假
const streamingDiff = computed(
  () => attrs.patch == null && attrs.oldCode == null && attrs.newCode == null,
)
</script>
