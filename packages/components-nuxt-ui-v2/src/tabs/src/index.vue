<template>
  <UTabs
    ref="comp"
    :class="ns.b()"
    :items="tabs"
    :default-index="defaultIndex"
    v-bind="attrs"
    @change="onChange"
  >
    <template v-if="showSlot('icon')" #icon="x">
      <slot name="icon" v-bind="x" />
    </template>
    <template v-if="showSlot('default')" #default="x">
      <slot name="default" v-bind="x" />
    </template>
    <template v-for="tab in tabs" :key="tab.value" #[tab.value]="x">
      <slot name="default-start" />

      <slot v-if="showSlot(tab.value)" :name="tab.value" v-bind="x" />
      <div
        v-else
        class="flex flex-col items-center justify-center py-6 text-sm text-neutral-500 dark:text-neutral-400"
      >
        <UIcon name="i-lucide-inbox" class="mb-2 size-6 opacity-60" />
        <span>{{ `${tab.label || ''}` }}内没有内容</span>
      </div>

      <slot name="default-end" v-bind="x" />
    </template>
  </UTabs>
</template>

<script setup lang="ts">
import { inject, useAttrs, useTemplateRef, computed, ref } from 'vue'

import { UTabs, UIcon } from '../../../vendor/bridge'

import { CxEventDisplayCompKey } from '@lionad/cx-definition'
import { useCxSlot, useCxBEM, useMountedWatchImmediate } from '@lionad/cx-vue'
import type { CxLoaderInstance, CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import type { Tab } from '../types'

defineOptions({ name: 'CxTabs' })

type UTabsProps = ComponentProps<typeof UTabs>

const cx = inject<CxLoaderInstance | undefined>('cx')!
const ns = useCxBEM('tabs')
const emits = defineEmits(['change'])
const inner = defineProps<{}>()
const props = useAttrs() as UTabsProps & {
  comp: CxComponentRuntime
  tabs?: Tab[]
}

const { showSlot } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')

const attrs = computed(() => {
  return {
    orientation: props.orientation || 'horizontal',
  }
})

const tabs = computed(() => {
  return (props.tabs || []).map((x) => {
    return {
      label: x.name,
      slot: x.value,
      value: x.value,
    }
  })
})

const value = ref('')

const resetValue = () => {
  value.value = tabs.value.length ? (tabs.value[0]?.value ?? '') : ''
}
resetValue()

const defaultIndex = computed(() => {
  const index = tabs.value.findIndex((x) => x.value === value.value)
  return index === -1 ? -1 : index
})
useMountedWatchImmediate(defaultIndex, resetValue)

const onChange = (idx: number) => {
  const option = tabs.value[idx]
  value.value = option?.value || ''
  emits('change', idx)
}

defineExpose({
  change: onChange,
  [CxEventDisplayCompKey]: (toDisplayComp: CxComponentRuntime) => {
    if (!toDisplayComp) return
    const slots = cx.utils.calcSlots(props.comp)
    const slotToDisplay = slots.find((slot) => {
      const isFind = (props.comp.components![slot.key] || []).some((c) => c.id === toDisplayComp.id)
      return isFind ? slot : null
    })
    if (!slotToDisplay) {
      return
    }

    // 如果组件在所有插槽都显示，无需切换 tab
    if (['default-start', 'default-end'].includes(slotToDisplay.key)) {
      return // do nothing
    }
    const tabIDX = tabs.value.findIndex((tab) => tab.value === slotToDisplay.key)
    if (tabIDX === -1) {
      return
    } else {
      value.value = tabs.value[tabIDX]!.value
    }
  },
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('tabs') {
    // ...
  }
}
</style>
