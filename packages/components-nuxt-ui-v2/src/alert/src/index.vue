<template>
  <UAlert
    v-if="isOpen"
    ref="comp"
    :class="ns.b()"
    :variant="props.variant"
    :size="props.size"
    :color="props.color"
    :close-button="
      props.closeable
        ? { icon: 'i-heroicons-x-mark-20-solid', color: 'gray', variant: 'link', padded: false }
        : undefined
    "
    @close="close"
  >
    <template #title>
      <slot v-if="showSlot('title')" name="title" />
      <span v-else>{{ props.title }}</span>
    </template>
    <template #description>
      <slot v-if="showSlot('description')" name="description" />
      <span v-else>{{ props.description }}</span>
    </template>
    <template #icon>
      <slot v-if="showSlot('icon')" name="icon" />
      <CxIcon v-else :name="safeIcon(props.icon)" size="24" />
    </template>
    <template #actions>
      <slot v-if="showSlot('actions')" name="actions" />
    </template>
  </UAlert>
</template>

<script setup lang="ts">
import { CxIcon } from '@lionad/cx-vue'
import { safeIcon } from '@lionad/cx-vue'
import { useAttrs, useTemplateRef, ref } from 'vue'

import { UAlert, UButton } from '../../../vendor/bridge'

import { CxEvents } from '@lionad/cx-definition'
import { useCx, useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxAlert' })

type UAlertProps = ComponentProps<typeof UAlert>
type UButtonProps = ComponentProps<typeof UButton>

const cx = useCx()
const ns = useCxBEM('alert')
const emits = defineEmits(['open', 'close'])
const inner = defineProps<{}>()
const props = useAttrs() as UAlertProps &
  UButtonProps & {
    comp: CxComponentRuntime
    closeable?: boolean
  }
const { showSlot } = useCxSlot(props.comp)

const compRef = useTemplateRef('comp')

const isOpen = ref(true)
const open = () => {
  if (isOpen.value) return
  isOpen.value = true
  emits('open')
}
const close = () => {
  if (!isOpen.value) return
  isOpen.value = false
  emits('close')
}

const init = () => {
  open()
}

defineExpose({
  open,
  close,
  isOpen,
  [CxEvents.init.key]: init,
  [CxEvents.displaySubComp.key]: (toDisplayComp: CxComponentRuntime) => {
    if (!toDisplayComp) return
    if (isOpen.value) return
    let find = null
    cx.utils.touch(props.comp.components!, (comp) => {
      if (comp.id === toDisplayComp.id) {
        find = comp
      }
    })
    if (find) {
      open()
    }
  },
})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('alert') {
    // ...
  }
}
</style>
