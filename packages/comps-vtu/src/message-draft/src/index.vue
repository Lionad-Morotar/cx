<template>
  <!-- 消息草稿卡片；body 未闭合期间（_cx_streaming 含 body）以骨架条组替换物料占位 -->
  <StreamSkeleton v-if="streamingBody" :class="ns.b()" />
  <MessageDraft v-else v-bind="vtuProps" :class="ns.b()" />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { MessageDraft } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import StreamSkeleton from '../../shared/stream-skeleton.vue'
import { streamingFields } from '../../shared/streaming'
import { useVtuProps } from '../../shared/use-vtu-props'

import type { MessageDraftProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuMessageDraft', inheritAttrs: false })

const ns = useCxBEM('vtu-message-draft')
const attrs = useAttrs()
const vtuProps = useVtuProps<MessageDraftProps>(attrs, 'cx-vtu-message-draft')

// body 在 email/slack 两分支均 zod 必填：完整帧标记必消失
const streamingBody = computed(() => streamingFields(attrs).includes('body'))
</script>
