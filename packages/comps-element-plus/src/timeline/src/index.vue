<!-- CxElementPlusTimeline: 包装 EP ElTimeline；items JSON 经 v-for 展开为 ElTimelineItem -->
<template>
  <ElTimeline v-bind="restProps" :class="ns.b()" data-testid="cx-element-plus-timeline">
    <ElTimelineItem
      v-for="(item, index) in items"
      :key="index"
      :timestamp="item.timestamp"
      :type="item.type"
      :color="item.color"
      :hollow="item.hollow"
    >
      {{ item.content }}
    </ElTimelineItem>
  </ElTimeline>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { ElTimeline, ElTimelineItem } from 'element-plus'
import { useCxBEM } from '@lionad/cx-vue'

import { useEpProps } from '../../shared/use-ep-props'

defineOptions({ name: 'CxElementPlusTimeline', inheritAttrs: false })

interface TimelineItem {
  content: string
  timestamp?: string
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  color?: string
  hollow?: boolean
}

const ns = useCxBEM('element-plus-timeline')
const epProps = useEpProps(useAttrs())
const items = computed<TimelineItem[]>(() => {
  const raw = epProps.value.items
  return Array.isArray(raw) ? (raw as TimelineItem[]) : []
})
// ElTimeline 自身无容器 prop，但 class/style（cx-styles 绑定）仍须经 v-bind 贯通到根元素；
// 剥离 items 配置键后余下的 attrs 照绑，与其他 JSON 子组件类物料保持同形
const restProps = computed(() => {
  const { items: _items, ...rest } = epProps.value
  return rest
})
</script>
