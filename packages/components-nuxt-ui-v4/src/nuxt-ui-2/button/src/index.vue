<template>
  <UButton
    ref="cmpt"
    :class="ns.b()"
    :variant="props.variant"
    :size="props.size"
    :ui="ui"
    :icon="''"
    :color="props.color"
  >
    <template #leading="x">
      <CxIcon
        v-if="isShowIconLeading"
        :name="icon"
        size="16"
        :class="isLoading ? 'animate-spin' : ''"
      />
      <slot
        v-else
        name="leading"
        v-bind="x"
      />
    </template>
    <span
      v-if="(props.label)"
      v-cx="{ text: 'label' }"
    >{{ props.label }}</span>
    <template #trailing="x">
      <CxIcon
        v-if="isShowIconTrailing"
        :name="icon"
        size="16"
        :class="isLoading ? 'animate-spin' : ''"
      />
      <slot
        v-else
        name="trailing"
        v-bind="x"
      />
    </template>
  </UButton>
</template>

<script setup lang="ts">
import { CxIcon } from '@lionad/cx-vue'
import { has } from '@lionad/cx-definition'

import { useAttrs , useTemplateRef, computed} from 'vue'

import { useCxBEM } from '@lionad/cx-vue'


import { UButton } from '../../../../vendor/bridge'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxButton' })

type UButtonProps = ComponentProps<typeof UButton>

const ns = useCxBEM('button')
const inner = defineProps<{}>()
const props = useAttrs() as UButtonProps & {
  cmpt: CxComponentRuntime
  round?: boolean
  iconPos?: 'leading' | 'trailing'
  // 'icon' is conflicting with 'UButton' props
  _icon?: string
}

const cmptRef = useTemplateRef('cmpt')

const ui = computed(() => props.round ? { rounded: 'rounded-full' } : {})

const isLoading = computed(() => props.loading)

const icon = computed(() => props._icon)
const isShowIcon = computed(() => has(icon.value) && !isLoading.value)
const isShowIconLeading = computed(() => isShowIcon.value && iconPos.value === 'leading')
const isShowIconTrailing = computed(() => isShowIcon.value && iconPos.value === 'trailing')

const iconPos = computed(() => props.iconPos || 'leading')
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('button') {
    // ...
  }
}
@include b("button") {
  &:has(> span:empty + .iconify),
  &:has(> span:empty + .p-icon),
  &:has(> .iconify + span:empty),
  &:has(> .p-icon + span:empty) {
    gap: 0;
  }
}
</style>
