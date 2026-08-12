<template>
  <!--
    vtu LinkPreview 的 navigate 是真 emit(handleNavigate 只 emit 不内建跳转),
    必须用 @ 监听再 re-emit,否则点击零反应。上抛附标题(回写文案要可读标题,
    语义层取不到 spec props)。
  -->
  <LinkPreview
    v-bind="vtuProps"
    :class="ns.b()"
    @navigate="(href: string) => emit('navigate', href, vtuProps.title)"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { LinkPreview } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { LinkPreviewProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuLinkPreview', inheritAttrs: false })

const emit = defineEmits<{
  navigate: [href: string, title: string | undefined]
}>()

const ns = useCxBEM('vtu-link-preview')
const vtuProps = useVtuProps<LinkPreviewProps>(useAttrs(), 'cx-vtu-link-preview')
</script>
