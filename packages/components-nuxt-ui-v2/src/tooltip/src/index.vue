<template>
  <button :class="ns.b()" class="flex">
    <template v-if="isReRendering">
      <div :class="ns.e('placeholder-box')" :style="size" />
    </template>
    <div v-else ref="comp" v-bind="mouseHandlers">
      <UTooltip ref="tooltipRef" v-bind="attrs" style="pointer-events: none">
        <template #default="x">
          <slot v-if="showSlot('default')" name="default" v-bind="x" />
          <UButton v-else color="neutral" variant="outline">
            <span>{{ props.label }}</span>
          </UButton>
        </template>

        <template #text>
          <div
            :class="ns.e('text')"
            class="px-2 py-1 pointer-events-auto"
            v-bind="editModeModalHandlers"
          >
            <slot v-if="showSlot('text')" name="text" />
            <CxEmpty v-else show-empty text-only text="弹出层没有内容" />
          </div>
        </template>
      </UTooltip>
    </div>
  </button>
</template>

<script setup lang="ts">
import { CxEmpty } from '@lionad/cx-vue'
import { unrefElement } from '@vueuse/core'

import { useAttrs, useTemplateRef, ref, computed, watch, unref } from 'vue'

import { UButton, UTooltip } from '../../../vendor/bridge'

import { CxEventDisplayCompKey, safeNum, useMacroTask } from '@lionad/cx-definition'
import { useCxSlot, useCxReRender, useCxEditMode, useCxBEM } from '@lionad/cx-vue'
import type { Placement } from '@popperjs/core'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxTooltip' })

type UTooltipProps = ComponentProps<typeof UTooltip>

const ns = useCxBEM('tooltip')

const emits = defineEmits(['update:value'])
const inner = defineProps<{}>()
const props = useAttrs() as UTooltipProps & {
  comp: CxComponentRuntime
  label?: string
  direction?: Placement
}

const { showSlot } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')
const tooltipRef = ref()
const ui = computed(() => {})

const attrs = computed(
  () =>
    ({
      openDelay: safeNum(props.openDelay),
      closeDelay: safeNum(props.closeDelay),
      popper: {
        placement: props.direction || 'bottom-start',
        // arrow: props.arrow || false,
      },
    }) as const,
)

const dblClickMode = ref(false)
const toggleDblClickMode = () => {
  dblClickMode.value = !dblClickMode.value
  dblClickMode.value ? (tooltipRef.value.open = true) : (tooltipRef.value.open = false)
}
// watchEffect(() => {
//   console.log('[info] dblClickMode', dblClickMode.value, tooltipRef.value.open)
// })

const open = () => {
  if (dblClickMode.value) {
    return
  }
  tooltipRef.value.onMouseEnter()
}
const close = () => {
  if (dblClickMode.value) {
    return
  }
  tooltipRef.value.onMouseLeave()
  dblClickMode.value = false
}

const { isEditMode } = useCxEditMode(() => [])
const mouseHandlers = computed(() => {
  const evts = isEditMode.value
    ? {
        onMouseenter: open,
        onMouseleave: close,
        onDblclick: toggleDblClickMode,
      }
    : {
        onMouseenter: open,
        onMouseleave: close,
      }
  return evts
})

const { isReRendering, size } = useCxReRender(compRef, () => {
  return props.direction
})
watch(
  () => props.direction,
  () => {
    dblClickMode.value = false
  },
)

const editModeModalHandlers = computed(() => {
  return !isEditMode.value
    ? {}
    : {
        onClick: (e: MouseEvent) => {
          e.preventDefault()
          e.stopImmediatePropagation()

          const fakeEvt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: e.clientX,
            clientY: e.clientY,
          })
          const elm = unrefElement(compRef)
          if (!elm?.dispatchEvent) return
          elm.dispatchEvent(fakeEvt)
        },
        onContextmenu: (e: MouseEvent) => {
          e.preventDefault()
          e.stopImmediatePropagation()

          const fakeEvt = new MouseEvent('contextmenu', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: e.clientX,
            clientY: e.clientY,
          })
          const elm = unrefElement(compRef)
          if (!elm?.dispatchEvent) return
          elm.dispatchEvent(fakeEvt)
        },
        onMouseleave: (e: MouseEvent) => {
          // wait for u-tooltip catch the event
          useMacroTask(() => {
            unref(tooltipRef.value?.closeTimeout) &&
              clearTimeout(unref(tooltipRef.value.closeTimeout))
          })
        },
      }
})

defineExpose({
  dblClickMode,
  [CxEventDisplayCompKey]: (toDisplayComp: CxComponentRuntime) => {
    if (!toDisplayComp) return
    const compsInModal = props.comp?.components?.text || []
    const isFind = compsInModal.some((comp) => comp.id === toDisplayComp.id)
    if (isFind) {
      open()
    }
  },
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('tooltip') {
    div:has(> .cx-tooltip__text) {
      padding: 0 !important;
      height: auto !important;
    }
  }
}
</style>
