<template>
  <template v-if="isReRendering">
    <div :class="ns.e('placeholder-box')" :style="size" />
  </template>
  <button v-else ref="cmpt" :class="ns.b()" v-bind="mouseHandlers">
    <UPopover v-bind="attrs" :open="isOpen" style="pointer-events: none">
      <template #default="x">
        <slot v-if="showSlot('trigger')" name="trigger" v-bind="x" />
        <UButton v-else color="neutral" variant="outline">
          <span>{{ props.label }}</span>
        </UButton>
      </template>

      <template #panel="x">
        <div :class="ns.e('panel')" class="p-2" v-bind="editModeModalHandlers">
          <slot v-if="showSlot('panel')" name="panel" v-bind="x" />
          <CxEmpty v-else :text="'弹出层没有内容'" class="w-48" />
        </div>
      </template>
    </UPopover>
  </button>
</template>

<script setup lang="ts">
import { CxEmpty } from '@lionad/cx-vue'
import { unrefElement } from '@vueuse/core'

import { useAttrs, useTemplateRef, computed, ref } from 'vue'

import { UButton, UPopover } from '../../../../vendor/bridge'

import { CxEventDisplayCmptKey, has } from '@lionad/cx-definition'
import { useCxSlot, useCxReRender, useCxEditMode, useCxBEM } from '@lionad/cx-vue'
import type { Placement } from '@popperjs/core'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxPopover' })

type UPopoverProps = ComponentProps<typeof UPopover>

const ns = useCxBEM('popover')

const emits = defineEmits(['update:value'])
const inner = defineProps<{}>()
const props = useAttrs() as UPopoverProps & {
  cmpt: CxComponentRuntime
  label?: string
  hoverMode?: boolean
  direction?: Placement
  dftOpen?: boolean
  // arrow?: boolean
}
// console.log('[info] cmpt popover -> ', props, inner)

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const attrs = computed(
  () =>
    ({
      mode: has(props.hoverMode) ? 'hover' : 'click',
      popper: {
        placement: props.direction || 'bottom-start',
        // arrow: props.arrow || false,
      },
    }) as const,
)

const isOpen = ref(has(props.dftOpen))
const open = () => (isOpen.value = true)
const close = () => (isOpen.value = false)

const { isEditMode } = useCxEditMode(() => [])
const mouseHandlers = computed(() => {
  const evts =
    attrs.value.mode === 'hover'
      ? {
          onMouseenter: open,
          onMouseleave: close,
        }
      : {
          onClick: open,
        }
  return evts
})

const editModeModalHandlers = computed(() => {
  return !isEditMode
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
          const elm = unrefElement(cmptRef)
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
          const elm = unrefElement(cmptRef)
          if (!elm?.dispatchEvent) return
          elm.dispatchEvent(fakeEvt)
        },
      }
})

const { isReRendering, size } = useCxReRender(cmptRef, () => [
  props.direction,
  props.dftOpen,
  props.hoverMode,
])

defineExpose({
  isOpen,
  [CxEventDisplayCmptKey]: (toDisplayCmpt: CxComponentRuntime) => {
    if (!toDisplayCmpt) return
    const cmptsInModal = props.cmpt?.components?.panel || []
    const isFind = cmptsInModal.some((cmpt) => cmpt.id === toDisplayCmpt.id)
    if (isFind) {
      open()
    }
  },
})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('popover') {
    .cx-popover__panel {
      @apply px-2 py-1 pointer-events-auto;
    }
  }
}
</style>
