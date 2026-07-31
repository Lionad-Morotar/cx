<template>
  <UVerticalNavigation ref="comp" :orientation="orientation" :class="ns.b()" :links="items">
    <template v-if="showSlot('icon')" #icon="x">
      <slot name="icon" v-bind="x" />
    </template>
    <template v-if="showSlot('default')" #default="x">
      <slot name="default" :link="x.link" v-bind="x" />
    </template>
    <template v-if="showSlot('badge')" #badge="x">
      <slot name="badge" v-bind="x" />
    </template>
  </UVerticalNavigation>
</template>

<script setup lang="ts">
import { useMountedWatch } from '@lionad/cx-vue'
import { has, not } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed } from 'vue'

import { UVerticalNavigation } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import type { Item } from '../types'

defineOptions({ name: 'CxNavigation' })

type UNavigationMenuProps = ComponentProps<typeof UVerticalNavigation>

const ns = useCxBEM('navigation')
const emits = defineEmits(['tab-change'])
const inner = defineProps<{}>()
const props = useAttrs() as (UNavigationMenuProps | UNavigationMenuProps) & {
  comp: CxComponentRuntime
  items?: Item[]
  divideFrom?: Item['value']
  divideFromMultiple?: Item['value'][]
  orientation?: 'horizontal' | 'vertical'
}

const { showSlot } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')
const orientation = computed(() => props.orientation || 'horizontal')

useMountedWatch(
  () => props.items!,
  () => {
    const idx1 = props.items!.findIndex((x) => props.divideFrom === x.value)
    if (idx1 === -1) {
      props.comp.data.divideFrom = ''
    }
    const idx2 =
      props.divideFromMultiple?.findIndex((x) => not(props.items!.find((y) => y.value === x))) || -1
    if (idx2 !== -1) {
      // comp.data 为 Record<string, unknown>；此分支进入时 prop 侧数组已定位到
      // 失效项，data 侧字段同为数组（同一 divideFromMultiple 契约），断言显式化
      ;(props.comp.data.divideFromMultiple as unknown[]).splice(idx2, 1)
    }
  },
  { deep: true },
)

const items = computed(() => {
  const list = (props.items! || []).filter(has)
  return orientation.value === 'horizontal' && props.divideFrom
    ? [
        list.slice(
          0,
          list.findIndex((x) => x.value === props.divideFrom),
        ),
        list.slice(list.findIndex((x) => x.value === props.divideFrom)),
      ]
    : orientation.value === 'vertical' && props.divideFromMultiple?.length
      ? list.reduce(
          (acc, x) => {
            const last = acc[acc.length - 1]!
            if (props.divideFromMultiple!.includes(x.value)) {
              acc.push([x])
            } else {
              last!.push(x)
            }
            return acc
          },
          [[]] as Item[][],
        )
      : list
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('navigation') {
    // ...
  }
}
</style>
