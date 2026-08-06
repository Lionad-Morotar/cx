<template>
  <!-- 消息草稿卡片；body 未闭合期间（_cx_streaming 含 body）以骨架条组替换物料占位 -->
  <StreamSkeleton v-if="streamingBody" :class="ns.b()" />
  <!--
    vtu MessageDraft 的 send/undo/cancel 是函数型 prop(非 Vue emit),
    包装件 :on-* 绑定回调再 re-emit,统一上抛供 cx 渲染器经 _cx_events 接线(host 侧 hooks 拦截)。
  -->
  <MessageDraft
    v-else
    v-bind="vtuProps"
    :class="ns.b()"
    :on-send="() => emit('send')"
    :on-undo="() => emit('undo')"
    :on-cancel="() => emit('cancel')"
  />
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

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  send: []
  undo: []
  cancel: []
}>()

const ns = useCxBEM('vtu-message-draft')
const attrs = useAttrs()
const vtuProps = useVtuProps<MessageDraftProps>(attrs, 'cx-vtu-message-draft')

// body 在 email/slack 两分支均 zod 必填：完整帧标记必消失
const streamingBody = computed(() => streamingFields(attrs).includes('body'))
</script>
