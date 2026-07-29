<template>
  <button ref="comp" :class="ns.b()" v-bind="attrs">
    <slot v-if="showSlot('trigger')" name="trigger" />
    <UButton v-else color="neutral" variant="outline" :label="props.label" />

    <USlideover
      v-if="isOpen"
      ref="slideoverRef"
      v-model:open="isOpen"
      v-bind="slideoverAttrs"
      @close="$emit('close')"
      @close-prevented="$emit('close-prevented')"
      @after-leave="$emit('after-leave')"
    >
      <slot v-if="showSlot('slideover')" name="slideover" />
      <CxEmpty v-else :text="'当前弹窗内容为空'" />
    </USlideover>
  </button>
</template>

<script setup lang="ts">
import { CxEmpty } from '@lionad/cx-vue'
import { v4 as uuidv4 } from 'uuid'

import { useStyleTag, unrefElement } from '@vueuse/core'

import { useAttrs, useTemplateRef, ref, computed, watchEffect } from 'vue'

import { UButton, USlideover } from '../../../vendor/bridge'

import { CxEventDisplayCompKey, not, useHooks, useMacroTask } from '@lionad/cx-definition'
import {
  useCxSlot,
  useCxEditMode,
  useCxBEM,
  useTempPortalRoot,
  resetTempPortalRoot,
  useKeyStrokeWhen,
} from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxSlideover' })

type USlideoverProps = ComponentProps<typeof USlideover>

const ns = useCxBEM('slideover')
const inner = defineProps<{}>()
const props = useAttrs() as USlideoverProps & {
  comp: CxComponentRuntime
  label?: string
  notPreventClose?: boolean
  escClose?: boolean
}

const { showSlot } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')
const slideoverRef = ref<any>()
const ui = computed(() => {})

const attrs = computed(() => ({
  onClick: openModal,
}))

const isOpen = ref(false)
const openModal = useHooks(() => {
  isOpen.value = true
})
const closeModal = useHooks(() => {
  isOpen.value = false
})

const { isEditMode } = useCxEditMode(() => {
  /* 单独呈现在编辑器中时，将 DOM 节点移动到编辑器内（而不是 teleport 到 body），其次 hack 样式中的 fixed 背景位置防止错位 */
  openModal.pre(() => {
    // useTempPortalRoot('body')
    useTempPortalRoot('#p-page-edit-canvas > .p-page__content-x > .bg')
  })
  openModal.post(() =>
    useMacroTask(async () => {
      resetTempPortalRoot()
    }),
  )
  closeModal.post(() =>
    useMacroTask(async () => {
      resetTempPortalRoot()
    }),
  )

  useStyleTag(
    `
    #p-page-edit-canvas > .p-page__content-x > .bg > [data-headlessui-portal],
    #p-page-edit-canvas > .p-page__content-x > .bg [role="dialog"],
    #p-page-edit-canvas > .p-page__content-x > .bg > [data-headlessui-portal] > div {
      position: absolute !important;
      width: 100%;
      height: 100%;
    }
    #p-page-edit-canvas > .p-page__content-x > .bg > [data-headlessui-portal] > div .fixed {
      position: absolute !important;
    }
  `,
    {
      id: `cx-slideover_in_edit_mode-${uuidv4()}`,
    },
  )

  // nuxt-ui-2 的 slideover 会在打开时将 body 和 app 设置为 inert，
  // 但是在编辑器中，我们需要保持 app 可操作，所以需要手动移除 inert 属性
  watchEffect(() => {
    if (isOpen.value) {
      setTimeout(() => {
        const $body = document.body
        const $apps = [...document.querySelectorAll('[data-v-app]')]
        ;[$body, ...$apps].forEach(($el) => {
          if ($el.hasAttribute('inert')) {
            $el.removeAttribute('inert')
            $el.removeAttribute('aria-hidden')
          }
        })
      }, 500)
    }
  })
})

const editModeModalHandlers = {
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
  onDblclick: (e: MouseEvent) => {
    const targetElm = e.target as HTMLElement
    if (
      (targetElm?.nextElementSibling as HTMLElement)
        ?.getAttribute('id')!
        .startsWith('headlessui-dialog-panel-v-')
    ) {
      closeModal()
      // todo select(props.comp)
    }
  },
}

useKeyStrokeWhen(
  () => props.escClose && isOpen.value,
  'Escape',
  () => closeModal(),
)

const slideoverAttrs = computed(() => {
  const normalAttrs = {
    preventClose: not(props.notPreventClose),
  }
  return isEditMode.value
    ? {
        ...normalAttrs,
        ...editModeModalHandlers,
      }
    : normalAttrs
})

defineExpose({
  isOpen,
  [CxEventDisplayCompKey]: (toDisplayComp: CxComponentRuntime) => {
    if (!toDisplayComp) return
    const compsInModal = props.comp?.components?.slideover || []
    const isFind = compsInModal.some((comp) => comp.id === toDisplayComp.id)
    if (isFind) {
      openModal()
    }
  },
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('slideover') {
    // ...
  }
}
</style>
