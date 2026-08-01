<template>
  <!-- 代码块卡片；code 未闭合期间（_cx_streaming 含 code）以骨架条组替换物料占位 -->
  <StreamSkeleton v-if="streamingCode" :class="ns.b()" />
  <CodeBlock v-else v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { CodeBlock } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import StreamSkeleton from '../../shared/stream-skeleton.vue'
import { streamingFields } from '../../shared/streaming'
import { useVtuProps } from '../../shared/use-vtu-props'

import type { CodeBlockProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuCodeBlock', inheritAttrs: false })

const ns = useCxBEM('vtu-code-block')
const attrs = useAttrs()
const vtuProps = useVtuProps<CodeBlockProps>(attrs, 'cx-vtu-code-block')

// code 为 zod 必填：完整帧标记必消失，骨架覆盖整个代码传输期（language
// 等短元数据虽已闭合，骨架一次性替换为完整代码块而非逐属性露出）
const streamingCode = computed(() => streamingFields(attrs).includes('code'))
</script>
