<template>
  <div v-bind="mouseEventHandlers">
    <slot name="trigger-area" />

    <teleport to="body">
      <UContextMenu
        ref="cmpt"
        v-model:open="isOpen"
        :class="ns.b()"
        :virtual-element="virtualElement"
        :popper="{ placement: 'right-start' }"
      >
        <slot>
          <CxActions
            size="sm"
            :actions="getActions(bindItemToAction)"
            @after-click="resetTask.exec"
            @hover="recordHoverItem"
          />
        </slot>
      </UContextMenu>

      <!-- 前只支持单层嵌套（也就是父子两级） -->
      <UContextMenu
        v-if="showSubActionMenu"
        v-model:open="isSubOpen"
        :class="[ns.b()]"
        :virtual-element="hoverItemElement as Record<string, any>"
        :popper="{
          placement: 'right-start',
          // overflowPadding: 20
        }"
        @close="onClose"
      >
        <CxActions size="sm" :actions="hoverSubActions" @after-click="resetTask.exec" />
      </UContextMenu>
    </teleport>
  </div>
</template>

/** * * * mobile capable * * dark mode * * i18n * * basic docs */

<script lang="ts" setup>
import { CxActions } from '@lionad/cx-vue'
import { onKeyStroke } from '@vueuse/core'
import { isFunction } from '@vue/shared'

import { useTemplateRef, ref, computed, unref } from 'vue'

import { UContextMenu } from '../../../vendor/bridge'
import {
  useCxEditMode,
  useBEM,
  useSharedMouse,
  useSharedWindowScroll,
  useAsync,
} from '@lionad/cx-vue'
import { useLastPosition } from '../hooks/use-position'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import type { Action } from '../types'

/* -------------------------------------------------------------------------- */
/*                                 types & env                                */
/* -------------------------------------------------------------------------- */

const ns = useBEM('context-actions')
const emits = defineEmits(['close'])
const onClose = () => (emits as any)('close')
const props = withDefaults(
  defineProps<{
    disabled?: boolean
    actions?: ((row: any) => Action[] | Action[][]) | (Action[] | Action[][])
    path?: string[]
  }>(),
  {
    disabled: false,
    actions: () => [],
    path: () => [],
  },
)

/* -------------------------------------------------------------------------- */
/*                                   states                                   */
/* -------------------------------------------------------------------------- */

const cmptRef = useTemplateRef('cmpt')

const { x, y } = useSharedMouse()
const { y: windowY } = useSharedWindowScroll()

const _isOpen = ref(false)
const isOpen = computed({
  get: () => _isOpen.value,
  set: (val) => {
    if (props.disabled) {
      return
    }
    _isOpen.value = val
  },
})

const isSubOpen = ref(true)
const virtualElement = ref({
  getBoundingClientRect: () => ({}),
})
// watchEffect(() => {
//   console.log('x, y', x.value, y.value, windowY.value)
// })

const bindItemToAction = ref(null as any)
const lastPosition = useLastPosition()

const getActions = (item: any) => {
  return isFunction(props.actions)
    ? props.actions(item)
    : Array.isArray(props.actions)
      ? props.actions
      : []
}

const hoverItem = ref(null as any)
const hoverItemElement = computed(() => {
  const label = hoverItem.value?.label
  // console.log('cmptElm.value?.', cmptElm.value)
  if (label) {
    isSubOpen.value = true
    return [...document.body.querySelectorAll('.p-actions')]
      .map(($action) => [...$action.children] as HTMLElement[])
      .flat(5)
      .filter(($x) => $x.tagName.toLowerCase() === 'button')
      .find(($x) => $x.innerText === label)
  }
  // console.log('[info] hoverItemElement', hoverItemElement.value)
})

const recordHoverItem = (item: any) => {
  hoverItem.value = item
}

const hoverSubActions = computed(() => {
  return hoverItem.value?.actions ? hoverItem.value.actions(bindItemToAction.value) : []
})
const showSubActionMenu = computed(() => {
  // console.log('hoverSubActions.value.length', hoverSubActions.value.length, Boolean(hoverItemElement.value))
  return hoverSubActions.value.length > 0 && (hoverItemElement.value as Record<string, any>)
})

/* -------------------------------------------------------------------------- */
/*                                 interaction                                */
/* -------------------------------------------------------------------------- */

const { isEditMode } = useCxEditMode(() => {})

const mouseEventHandlers = computed(() => {
  // @dblclick.stop.catch="open($event)"
  return isEditMode.value
    ? { onDblclick: (e: MouseEvent) => open(e) }
    : { onContextmenu: (e: MouseEvent) => open(e) }
})

const open = (
  $event: MouseEvent,
  _item?: any,
  customPosition?: {
    x: number
    y: number
    isUseLastPosition: false
  },
) => {
  // console.log('[info] $event', $event)

  if ($event) {
    $event.stopPropagation()
    $event.preventDefault()
  }

  bindItemToAction.value = _item || null

  const useOldPosition = Boolean(customPosition?.isUseLastPosition)
  let top, left
  if (useOldPosition) {
    top = lastPosition.value.top
    left = lastPosition.value.left
  } else {
    top = customPosition?.y || unref(y) - unref(windowY)
    left = customPosition?.x || unref(x)
    lastPosition.value.top = top
    lastPosition.value.left = left
  }
  // console.log('[info] useOldPosition', useOldPosition, top, left)

  const pos = {
    width: 0,
    height: 0,
    top,
    left,
  }
  virtualElement.value.getBoundingClientRect = () => pos

  isOpen.value = true

  return {
    position: pos,
  }
}
const close = async () => {
  if (props.disabled) {
    return
  }
  isOpen.value = false
  bindItemToAction.value = null
  hoverItem.value = null
}
onKeyStroke('Escape', close)

/* -------------------------------------------------------------------------- */
/*                          cmpt lifecycle & exposed                          */
/* -------------------------------------------------------------------------- */

const resetTask = useAsync(async () => {
  close()
})
const reloadTask = useAsync(async () => {
  await resetTask.exec()
})

defineExpose({
  reload: reloadTask.exec,
  isOpen,
  open,
  close,
  hoverItem,
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('command-palette') {
    // ...
  }
}
</style>
