<template>
  <!--
    vtu ItemCarousel 的 itemClick/itemAction 是真 emit(实现只走 emit,不调函数 prop),
    必须用 @ 监听——:on-* kebab v-bind 进不了 emit 的 camel 键查找,事件会丢。
    re-emit 回宿主侧统一用 kebab 的 item-click/item-action(与 meta emits/hydrate 同键)。
  -->
  <ItemCarousel
    v-bind="vtuProps"
    :class="ns.b()"
    @item-click="(itemId: string) => emit('item-click', itemId)"
    @item-action="(itemId: string, actionId: string) => emit('item-action', itemId, actionId)"
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
