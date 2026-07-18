<template>
  <div :class="`cx-${cx.id}-${cmpt.id}-${slot.key}`" style="display: contents">
    <component :is="slotWrapper" v-if="slotWrapper" v-bind="cmptBinds">
      <component
        :is="innerSlots[`${slot.key}-start`]"
        v-if="innerSlots[`${slot.key}-start`]"
        name="slot-start"
        v-bind="{ innerSlotKey: `${slot.key}-start` }"
      />
      <template v-for="(_, csIDX) in cmptChilds[slot.key!]" v-if="cmptChilds[slot.key!]?.length">
        <component
          :is="innerSlots[`${slot.key}-${cmptChilds[slot.key!]![csIDX]!.id}-start`]"
          v-if="innerSlots[`${slot.key}-${cmptChilds[slot.key!]![csIDX]!.id}-start`]"
          name="slot-cmpt-start"
          v-bind="{ innerSlotKey: `${slot.key}-${cmptChilds[slot.key!]![csIDX]!.id}-start` }"
        />
        <component
          :is="innerSlots[`${slot.key}-${cmptChilds[slot.key!]![csIDX]!.id}`]"
          v-if="innerSlots[`${slot.key}-${cmptChilds[slot.key!]![csIDX]!.id}`]"
          name="slot-cmpt"
          v-bind="{ innerSlotKey: `${slot.key}-${cmptChilds[slot.key!]![csIDX]!.id}` }"
        />
        <cx-render-component
          v-else-if="cmptChilds[slot.key!]![csIDX]"
          :component="cmptChilds[slot.key!]![csIDX]!"
        />
        <component
          :is="innerSlots[`${slot.key}-${cmptChilds[slot.key!]![csIDX]!.id}-end`]"
          v-if="innerSlots[`${slot.key}-${cmptChilds[slot.key!]![csIDX]!.id}-end`]"
          name="slot-cmpt-end"
          v-bind="{ innerSlotKey: `${slot.key}-${cmptChilds[slot.key!]![csIDX]!.id}-end` }"
        />
      </template>
      <component
        :is="innerSlots[`${slot.key}-end`]"
        v-if="innerSlots[`${slot.key}-end`]"
        name="slot-end"
        v-bind="{ innerSlotKey: `${slot.key}-end` }"
      />
    </component>
    <span v-else>no cmptWrapper warning</span>
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
    cmptID: CxComponentRuntime['id']
    slotWrapper: any
    slot: CxComponentSlot
  }>(),
  {},
)

const cx = inject<CxLoaderInstance>('cx')!
const cmpt = inject<Ref<CxComponentRuntime>>('cx-cmpt')!

const cmptChilds = computed((): Record<string, CxComponentRuntime[]> => {
  const cmpts = cmpt.value.components
  return cx.utils.isSlottedCxComponentGroup(cmpts) ? cmpts : {}
})
// const test = inject('test')
// watchEffect(() => {
//   console.log('[debug] cmptChilds', cmptChilds.value, unref(test))
// })

/**
 * 外部组件可以修改 innerSlots，以指定组件内部打开某插槽
 * @example 外部组件可做如下修改
 * innerSlots['default-<cmptId>'] = 'div'
 */
const innerSlots = reactive({} as Record<string, any>)

const getSlotNames = () => {
  const slotKey = props.slot.key
  const names = [
    `${slotKey}-start`,
    // `${slotKey}`,
    `${slotKey}-end`,
  ] as string[]
  ;(unref(cmptChilds)[slotKey] || []).map((cmpt) => {
    names.push(`${slotKey}-${cmpt.id}-start`)
    names.push(`${slotKey}-${cmpt.id}`)
    names.push(`${slotKey}-${cmpt.id}-end`)
  })
  return names
}

/* ---------------------------------- slots --------------------------------- */

const cmptBinds = computed(() => {
  const isFragment = props.slotWrapper === CxTransparentRender
  return isFragment
    ? {}
    : {
        name: 'render-components-slot-wrapper',
        parentID: cmpt.value.id,
        'area-key': props.slot.key,
        'area-name': props.slot.name,
        'render-slots': innerSlots,
        'get-slots-names': getSlotNames,
      }
})
</script>
