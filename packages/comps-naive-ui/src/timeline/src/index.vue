<!-- CxNaiveUiTimeline: 包装 naive-ui NTimeline；items JSON 经 v-for 展开为 NTimelineItem
     （title/content/time/type 均 NTimelineItem prop） -->
<template>
  <NTimeline v-bind="restProps" :class="ns.b()" data-testid="cx-naive-ui-timeline">
    <NTimelineItem
      v-for="(item, index) in items"
      :key="index"
      :type="item.type"
      :title="item.title"
      :content="item.content"
      :time="item.time"
    />
  </NTimeline>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NTimeline, NTimelineItem } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiTimeline', inheritAttrs: false })

/** 低代码侧配置的事件形态 */
interface TimelineItem {
  title: string
  content?: string
  time?: string
  type?: 'default' | 'success' | 'info' | 'warning' | 'error'
}

const ns = useCxBEM('naive-ui-timeline')
const naiveProps = useNaiveUiProps(useAttrs())
const items = computed<TimelineItem[]>(() => {
  const raw = naiveProps.value.items
  return Array.isArray(raw) ? (raw as TimelineItem[]) : []
})
const restProps = computed(() => {
  const { items: _items, ...rest } = naiveProps.value
  return rest
})
</script>
