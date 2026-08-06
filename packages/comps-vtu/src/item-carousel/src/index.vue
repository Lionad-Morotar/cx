<template>
  <!--
    vtu ItemCarousel 的 itemClick/itemAction 是函数型 prop(非 Vue emit),
    包装件 :on-* 绑定回调再 re-emit,统一上抛供 cx 渲染器经 _cx_events 接线(host 侧 hooks 拦截)。
  -->
  <ItemCarousel
    v-bind="vtuProps"
    :class="ns.b()"
    :on-item-click="(itemId: string) => emit('item-click', itemId)"
    :on-item-action="(itemId: string, actionId: string) => emit('item-action', itemId, actionId)"
  />
</template>

<script setup lang="ts">
import { useAttrs } from 'vue'
import { ItemCarousel } from '@lionad/vtu-components'
import { useCxBEM } from '@lionad/cx-vue'

import { useVtuProps } from '../../shared/use-vtu-props'

import type { ItemCarouselProps } from '@lionad/vtu-components'

defineOptions({ name: 'CxVtuItemCarousel', inheritAttrs: false })

// 与 meta emits 同集合:declare 后这些 on* 从 $attrs 消费,避免 useVtuProps 二次透传造成重复绑定
const emit = defineEmits<{
  'item-click': [itemId: string]
  'item-action': [itemId: string, actionId: string]
}>()

const ns = useCxBEM('vtu-item-carousel')
const vtuProps = useVtuProps<ItemCarouselProps>(useAttrs(), 'cx-vtu-item-carousel')
</script>
