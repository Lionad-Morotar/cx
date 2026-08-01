<template>
  <!-- Instagram 贴文卡片；贴文空壳期（_cx_streaming 含 post）以骨架条组替换物料占位 -->
  <StreamSkeleton v-if="streamingPost" :class="ns.b()" />
  <InstagramPost v-else v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { InstagramPost } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import StreamSkeleton from '../../shared/stream-skeleton.vue'
import { streamingFields } from '../../shared/streaming'
import { useVtuProps } from '../../shared/use-vtu-props'

import type { InstagramPostProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuInstagramPost', inheritAttrs: false })

const ns = useCxBEM('vtu-instagram-post')
const attrs = useAttrs()
const vtuProps = useVtuProps<InstagramPostProps>(attrs, 'cx-vtu-instagram-post')

// 骨架判据同 x-post：post 空壳期必缺席，渐次闭合后交回物料直渲
const streamingPost = computed(() => streamingFields(attrs).includes('post'))
</script>
