<template>
  <div :class="ns.b()">
    <div :class="ns.e('tabs')">
      <template v-for="tab in props.tabs" :key="tab.name">
        <div
          :class="[
            ns.e('item'),
            ns.is('active', isSelected(tab)),
            ns.is('disabled', isDisabled(tab)),
          ]"
          @click="select(tab)"
        >
          <slot name="tab-item-icon" :data="{ tab }">
            <CxSvgIcon class="icon" :icon-class="tab.value" />
          </slot>
          <slot name="tab-item-title" :data="{ tab }">
            <span class="text" v-text="tab.name" />
          </slot>
        </div>
      </template>
    </div>
    <div :class="ns.e('content')">
      <template v-for="tab in props.tabs">
        <slot :name="tab.key" />
      </template>
      <!-- 
        所有标签页都通用的内容可以放到默认插槽，在一些特殊场景，
        比如标签页中只有一个表格，而切换标签页只是改变表格内容，
        就符合这种情况，页面不需要创建两个表格，
        所以直接把放到默认插槽中，数据由表格或页面自行维护
      -->
      <slot />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useCxNamespace } from '../../../utils/namespace'
import { useCardTabs } from '../states'

import type { Tab } from '../types'

defineOptions({
  name: 'CxCardTabs',
})

const ns = useCxNamespace('card-tabs')
// 类型内联声明：跨文件 import type 会触发 SFC 编译器的 fs 类型解析（rolldown 环境不可用）
const emits = defineEmits<{ 'update:modelValue': [x: string] }>()
const props = withDefaults(
  defineProps<{
    use?: any
    modelValue?: string
    tabs?: Tab[]
    isAutoSelect?: boolean
  }>(),
  {
    tabs: () => [],
    // states 消费的是 isAutoSelect；原代码误给 autoSelect（幻影 prop，从未被读取）
    isAutoSelect: true,
  },
)

const { isSelected, isDisabled, select } = useCardTabs(props, emits)
</script>

<style>
.cx-card-tabs {
  display: grid;
  grid-template: 54px minmax(0, 1fr) / minmax(0, 1fr);

  &__tabs {
    display: flex;
    gap: 0;
    z-index: 1;
  }
}

/* item 原本嵌在 e('tabs') 内，SCSS 经 @at-root 提升为扁平选择器，此处等价独立 */
.cx-card-tabs__item {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  width: 138px;
  height: 54px;
  border-radius: 8px 8px 0 0;
  background: transparent;
  transition: 0.2s;
  cursor: pointer;
  flex-shrink: 0;

  &:hover {
    background: #f9f9f9;
  }

  &.is-active {
    background: #f0f2fb;
    color: #337cfb;
  }

  .text {
    font-size: 17px;
  }

  .icon {
    width: 22px;
    height: 22px;
  }
}
</style>
