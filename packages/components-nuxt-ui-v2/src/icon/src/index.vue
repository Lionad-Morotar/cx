<template>
  <div
    :class="[
      ns.b(),
      ns.is('quick-center', props.center),
      ns.is('touchable', props.touchable),
      ns.is('active', props.active),
    ]"
  >
    <UIcon
      v-if="showIcon"
      :name="iconName"
      :tabindex="props.touchable ? undefined : -1"
      :size="safeNum(inner.size)"
    />
  </div>
</template>

<script setup lang="ts">
import { safeNum } from '@lionad/cx-definition'
import { useAttrs, useTemplateRef, computed, inject } from 'vue'

import { UIcon } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM, safeIcon } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxIcon' })

type UIconProps = ComponentProps<typeof UIcon>

const ns = useCxBEM('icon')
const inner = defineProps<{
  name?: string
  size?: string | number
}>()
const props = useAttrs() as UIconProps & {
  cmpt: CxComponentRuntime
  // if using a flex align-items-center container,
  // do not use this prop
  center?: boolean
  touchable?: boolean
  active?: boolean
}

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const isEdit = inject('is-cx-edit', false)
const showIcon = computed(() => isEdit || (inner.name?.length ?? 0) > 2)

const iconName = computed(() => safeIcon(inner.name))

const attrs = computed(() => ({}) as const)

defineExpose({})
</script>

<style lang="scss">
@use '@lionad/cx-vue/styles' as *;

@layer cx {
  @include b('icon') {
    @apply inline-flex justify-center items-center;
    @apply min-w-1 min-h-1 leading-none align-top text-inherit overflow-hidden select-none;

    /** quick align with text when not in a flex container */
    @include when('quick-center') {
      position: relative;
      top: 0.13rem;
    }

    @include when('touchable') {
      cursor: pointer;
    }

    @include when('active') {
      @apply text-sky-500 dark:text-sky-400;
    }
  }
}
</style>
