<template>
  <!-- X 贴文卡片；贴文空壳期（_cx_streaming 含 post）以骨架条组替换物料占位 -->
  <StreamSkeleton v-if="streamingPost" :class="ns.b()" />
  <XPost v-else v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { XPost } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import StreamSkeleton from '../../shared/stream-skeleton.vue'
import { streamingFields } from '../../shared/streaming'
import { useVtuProps } from '../../shared/use-vtu-props'

import type { XPostProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuXPost', inheritAttrs: false })

const ns = useCxBEM('vtu-x-post')
const attrs = useAttrs()
const vtuProps = useVtuProps<XPostProps>(attrs, 'cx-vtu-x-post')

// 骨架判据只看标记：post 是唯一顶层字段，key 检出（空壳帧）时必缺席；
// author/text 渐次闭合后 post 出现（部分对象），标记消失即交回物料直渲
const streamingPost = computed(() => streamingFields(attrs).includes('post'))
</script>
