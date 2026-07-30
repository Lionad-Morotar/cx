<!-- CxNaiveUiCollapse: 包装 naive-ui NCollapse；items JSON 经 v-for 展开为 NCollapseItem。
     低代码侧无法书写 NCollapseItem 子模板（与 descriptions 同困境），故 content 为文本、
     经 items 驱动而非插槽容器形态。默认展开全部面板使低代码预览可见正文（用户运行时仍可收起）。 -->
<template>
  <NCollapse
    v-bind="restProps"
    :default-expanded-names="expandedNames"
    :class="ns.b()"
    data-testid="cx-naive-ui-collapse"
  >
    <NCollapseItem v-for="(item, index) in items" :key="index" :title="item.title" :name="`item-${index}`">
      {{ item.content }}
    </NCollapseItem>
  </NCollapse>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { NCollapse, NCollapseItem } from 'naive-ui'
import { useCxBEM } from '@lionad/cx-vue'

import { useNaiveUiProps } from '../../shared/use-naive-ui-props'

defineOptions({ name: 'CxNaiveUiCollapse', inheritAttrs: false })

/** 低代码侧配置的面板形态 */
interface CollapseItem {
  title: string
  content: string
}

const ns = useCxBEM('naive-ui-collapse')
const naiveProps = useNaiveUiProps(useAttrs())
const items = computed<CollapseItem[]>(() => {
  const raw = naiveProps.value.items
  return Array.isArray(raw) ? (raw as CollapseItem[]) : []
})
const expandedNames = computed(() => items.value.map((_, index) => `item-${index}`))
const restProps = computed(() => {
  const { items: _items, ...rest } = naiveProps.value
  return rest
})
</script>
