<template>
  <div :class="`cx-${cx.id}-${comp.id}-${slot.key}`" style="display: contents" class="cx-render-components">
    <component :is="slotWrapper" v-if="slotWrapper" v-bind="compBinds">
      <component
        :is="innerSlots[`${slot.key}-start`]"
        v-if="innerSlots[`${slot.key}-start`]"
        name="slot-start"
        v-bind="{ innerSlotKey: `${slot.key}-start` }"
      />
      <template v-for="(_, csIDX) in compChilds[slot.key!] ?? []">
        <component
          :is="innerSlots[`${slot.key}-${compChilds[slot.key!]![csIDX]!.id}-start`]"
          v-if="innerSlots[`${slot.key}-${compChilds[slot.key!]![csIDX]!.id}-start`]"
          name="slot-comp-start"
          v-bind="{ innerSlotKey: `${slot.key}-${compChilds[slot.key!]![csIDX]!.id}-start` }"
        />
        <component
          :is="innerSlots[`${slot.key}-${compChilds[slot.key!]![csIDX]!.id}`]"
          v-if="innerSlots[`${slot.key}-${compChilds[slot.key!]![csIDX]!.id}`]"
          name="slot-comp"
          v-bind="{ innerSlotKey: `${slot.key}-${compChilds[slot.key!]![csIDX]!.id}` }"
        />
        <cx-render-component
          v-else-if="compChilds[slot.key!]![csIDX]"
          :component="compChilds[slot.key!]![csIDX]!"
        />
        <component
          :is="innerSlots[`${slot.key}-${compChilds[slot.key!]![csIDX]!.id}-end`]"
          v-if="innerSlots[`${slot.key}-${compChilds[slot.key!]![csIDX]!.id}-end`]"
          name="slot-comp-end"
          v-bind="{ innerSlotKey: `${slot.key}-${compChilds[slot.key!]![csIDX]!.id}-end` }"
        />
      </template>
      <component
        :is="innerSlots[`${slot.key}-end`]"
        v-if="innerSlots[`${slot.key}-end`]"
        name="slot-end"
        v-bind="{ innerSlotKey: `${slot.key}-end` }"
      />
    </component>
    <span v-else>no compWrapper warning</span>
  </div>
</template>

<script setup lang="ts">
import { inject, type Ref, computed, reactive, unref } from 'vue'
import CxRenderComponent from './render-component.vue'
import CxTransparentRender from './transparent-render.vue'
import type { CxComponentRuntime, CxComponentSlot, CxLoaderInstance } from '@lionad/cx-definition'

defineOptions({ name: 'CxRenderComponents' })

const props = withDefaults(
  defineProps<{
    compID: CxComponentRuntime['id']
    slotWrapper: any
    slot: CxComponentSlot
  }>(),
  {},
)

const cx = inject<CxLoaderInstance>('cx')!
const comp = inject<Ref<CxComponentRuntime>>('cx-comp')!

const compChilds = computed((): Record<string, CxComponentRuntime[]> => {
  const comps = comp.value.components
  return cx.utils.isSlottedCxComponentGroup(comps) ? comps : {}
})
// const test = inject('test')
// watchEffect(() => {
//   console.log('[debug] compChilds', compChilds.value, unref(test))
// })

/**
 * 外部组件可以修改 innerSlots，以指定组件内部打开某插槽
 * @example 外部组件可做如下修改
 * innerSlots['default-<compId>'] = 'div'
 */
const innerSlots = reactive({} as Record<string, any>)

const getSlotNames = () => {
  const slotKey = props.slot.key
  const names = [
    `${slotKey}-start`,
    // `${slotKey}`,
    `${slotKey}-end`,
  ] as string[]
  ;(unref(compChilds)[slotKey] || []).map((comp) => {
    names.push(`${slotKey}-${comp.id}-start`)
    names.push(`${slotKey}-${comp.id}`)
    names.push(`${slotKey}-${comp.id}-end`)
  })
  return names
}

/* ---------------------------------- slots --------------------------------- */

const compBinds = computed(() => {
  const isFragment = props.slotWrapper === CxTransparentRender
  return isFragment
    ? {}
    : {
        name: 'render-components-slot-wrapper',
        parentID: comp.value.id,
        'area-key': props.slot.key,
        'area-name': props.slot.name,
        'render-slots': innerSlots,
        'get-slots-names': getSlotNames,
      }
})
</script>
