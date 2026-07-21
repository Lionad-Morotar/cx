<template>
  <button ref="cmpt" :class="ns.b()" v-bind="attrs" @click="openToast">
    <slot v-if="showSlot('trigger')" name="trigger" />
    <UButton v-else color="neutral" variant="outline">
      <span>{{ props.label }}</span>
    </UButton>

    <teleport v-if="showRegion" to=".cx-notifications-placeholder">
      <div
        v-show="unref(toast.notifications).length"
        class="cx-toast-region fixed flex flex-col justify-end end-0 z-[55] w-full sm:w-96"
        role="region"
        :style="cxToastRegionStyle"
      >
        <div class="cx-toasts px-4 sm:px-6 py-6 space-y-3 overflow-y-auto" />
      </div>
    </teleport>

    <teleport v-if="useCxToastRegion" to=".cx-toasts">
      <UNotification
        v-for="item in notifications"
        v-bind="{ ...item, ...notificationHandlers }"
        @close="removeToast(item.id)"
      >
        <template #title="x">
          <slot v-if="showSlot('title')" name="title" v-bind="x" />
          <span v-else>{{ props.title }}</span>
        </template>
        <template #description="x">
          <slot v-if="showSlot('description')" name="description" v-bind="x" />
          <span v-else>{{
            props.description
          }}</span>
        </template>
      </UNotification>
    </teleport>
  </button>
</template>

<script setup lang="ts">
import { isNumber } from 'lodash-es'
import { unref } from 'vue'
import { watchImmediate, useElementSize, unrefElement } from '@vueuse/core'

import { useAttrs, useTemplateRef, computed, ref, watch, watchEffect } from 'vue'

import { UButton, UNotification } from '../../../../vendor/bridge'

import { CxEventDisplayCmptKey, has, useCleanups, safeNum } from '@lionad/cx-definition'
import { useCxSlot, useCxEditMode, useCxBEM, safeIcon, useQueryCached } from '@lionad/cx-vue'
import { useToast } from '../hooks/use-toast'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxNotification' })

type UToastProps = ComponentProps<typeof UNotification>

const ns = useCxBEM('meter')

const emits = defineEmits(['update:value'])
const inner = defineProps<{}>()
const props = useAttrs() as UToastProps & {
  cmpt: CxComponentRuntime
  label?: string
}
// console.log('[info] cmpt meter -> ', props, inner)

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const attrs = computed(() => ({}) as const)

const toast = useToast()
const findExistRegion = document.querySelector('.cx-toast-region')
const useCxToastRegion = useQueryCached('.cx-toasts')
const findRegionPlaceholder = useQueryCached('.cx-notifications-placeholder')

const showRegion = computed(() => !findExistRegion && has(findRegionPlaceholder.value))

const notifications = computed(() => {
  return toast.notifications.value.filter((x) => x.id.startsWith(props.cmpt.id))
})

const cxToastRegionStyle = ref({
  bottom: '0',
})
// 寻找 p-ray 的通知区域，并通过移动 cx-toast-region 的 bottom 将其放在上方
if (!findExistRegion) {
  const clean = useCleanups()

  const elem = useQueryCached('.p-ray-notifications-region > div', {
    autoStop: false,
    retry: Infinity,
    getRetryTimeout: () => 17 * 5,
  })
  clean.add(elem.stop)

  watchImmediate(
    () => has(toast.notifications.value.length),
    (len) => {
      clean.cleanup()
      if (!len) return
      clean.add(elem.stop)
      elem.start()
      const clean2 = useCleanups(clean)
      clean.add(
        watch(elem, (elem) => {
          if (!elem) {
            clean2.cleanup()
            cxToastRegionStyle.value = {
              bottom: '0',
            }
            return
          }
          const { height } = useElementSize(elem)
          clean2.add(
            watchEffect(() => {
              cxToastRegionStyle.value = {
                bottom: height.value ? `calc(0.75rem + ${height.value}px)` : '0',
              }
            }),
          )
        }),
      )
    },
  )
}

const openToast = () =>
  toast.add({
    id: props.cmpt.id + '-' + String(props.id || new Date().getTime().toString()),
    title: props.title || '通知',
    description: props.description || '',
    icon: safeIcon(props.icon),
    timeout: isNumber(safeNum(props.timeout)) ? safeNum(props.timeout) * 1000 : 3000,
  })
const removeToast = (_id: string) => {
  toast.remove(_id)
}
const isOpen = computed(() => {
  return has(toast.notifications.value.find((x) => x.id.startsWith(props.cmpt.id)))
})

// 当 props 变化时，重新打开通知
const stopReOpen = watch(
  () => [props.title, props.description, props.icon, props.timeout],
  () => {
    const find = toast.notifications.value.find((x) => x.id.startsWith(props.cmpt.id))
    if (find) {
      removeToast(find.id)
      openToast()
    }
  },
  {
    deep: true,
  },
)

const { isEditMode } = useCxEditMode(() => {})
const notificationHandlers = computed(() => {
  return isEditMode.value
    ? {
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
    : {}
})

defineExpose({
  isOpen,
  [CxEventDisplayCmptKey]: (toDisplayCmpt: CxComponentRuntime) => {
    if (!toDisplayCmpt) return
    const cmptsInModal = [
      ...(props.cmpt?.components?.title || []),
      ...(props.cmpt?.components?.description || []),
    ]
    const isFind = cmptsInModal.some((cmpt) => cmpt.id === toDisplayCmpt.id)
    if (isFind) {
      openToast()
    }
  },
})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('meter') {
  }
}
</style>
