<template>
  <UAccordion
    ref="comp"
    :class="ns.b()"
    :ui="ui"
    :variant="props.variant"
    :size="props.size"
    :color="props.color"
    :open-icon="openIcon"
    :close-icon="closeIcon"
    :multiple="Boolean(props.multiple)"
    :default-open="defaultOpen"
    :items="items"
    @open="($event) => $emit('open', $event)"
    @close="($event) => $emit('close', $event)"
  >
    <template v-for="(_, name) in $slots" #[name]="x">
      <template v-if="showSlot(name)">
        <div :class="name.startsWith('item-') ? ns.e('item') : ns.e('trigger')">
          <slot :name="name as unknown as string" v-bind="x" />
        </div>
      </template>
    </template>
  </UAccordion>
</template>

<script setup lang="ts">
import { unrefElement } from '@vueuse/core'

import { useAttrs, useTemplateRef, computed } from 'vue'

import { UAccordion, UButton } from '../../../vendor/bridge'

import { CxEventDisplayCompKey, useSleep } from '@lionad/cx-definition'
import { useCx, useCxSlot, useCxBEM, safeIcon } from '@lionad/cx-vue'
import type { ComponentProps, CxComponentRuntime } from '@lionad/cx-definition'
import type { Item } from '../types'

defineOptions({ name: 'CxAccordion' })

type UAccordionProps = ComponentProps<typeof UAccordion>
type UButtonProps = ComponentProps<typeof UButton>

const cx = useCx()
const ns = useCxBEM('accordion')
const inner = defineProps<{
  items: Item[]
}>()
const props = useAttrs() as UAccordionProps &
  UButtonProps & {
    defaultClose?: boolean
    openIcon?: string
    closeIcon?: string
    items?: Item[]
    comp: CxComponentRuntime
  }
const { showSlot } = useCxSlot(props.comp)

const compRef: any = useTemplateRef('comp')
const ui = {}

const items = computed(() =>
  (inner.items || []).map((item) => ({
    ...item,
    slot: 'item-' + (item as any).id,
  })),
)

const openIcon = computed(() => safeIcon(props.openIcon))
const closeIcon = computed(() => safeIcon(props.closeIcon))

const defaultOpen = computed(() => !props.defaultClose)

const open = async (index: number, reverse = false) => {
  const elm = unrefElement(compRef.value)
  const triggerElm = [...elm.querySelectorAll(`& > div > .${ns.e('trigger')}`)][index]
  return triggerElm.getAttribute('aria-expanded') === (reverse ? 'false' : 'true')
    ? false
    : // wait for animation end
      (triggerElm.click(), await useSleep(1000))
}
const close = (index: number) => open(index, true)

defineExpose({
  open,
  close,
  [CxEventDisplayCompKey]: async (toDisplayComp: CxComponentRuntime) => {
    if (!toDisplayComp) return
    // todo perf
    const slotKey = Object.keys(props.comp?.components || {}).find((k) => {
      let find = null
      cx.utils.touch(props.comp.components![k]!, (comp) => {
        if (comp.id === toDisplayComp.id) {
          find = k
        }
      })
      return find
    })
    // 如果组件在触发区域，无需展开触发区域
    if (slotKey === 'default') {
      return true
    }
    const slotIndex = items.value.findIndex((x) => x.slot === slotKey)
    if (slotIndex !== -1) {
      await open(slotIndex)
    }
  },
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('accordion') {
    @include e('trigger') {
      user-select: none;
    }
  }
}
</style>
