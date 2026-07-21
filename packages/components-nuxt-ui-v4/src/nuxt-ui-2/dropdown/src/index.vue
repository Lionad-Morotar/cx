<template>
  <template v-if="isReRendering">
    <div :class="ns.e('placeholder-box')" :style="size" />
  </template>
  <UDropdown v-else :class="ns.b()" v-bind="{ ...attrs }">
    <template #default="x">
      <div ref="cmpt" :class="ns.e('content')">
        <slot v-if="showSlot('default')" name="default" v-bind="x" />
        <UButton
          v-else
          color="neutral"
          variant="outline"
          :label="props.label"
          trailing-icon="i-heroicons-chevron-down-20-solid"
        />
      </div>
    </template>
  </UDropdown>
</template>

<script setup lang="ts">
import { has } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed } from 'vue'

import { UButton, UDropdown } from '../../../../vendor/bridge'

import { useCxSlot, useCxReRender, useCxBEM } from '@lionad/cx-vue'
import type { Placement } from '@popperjs/core'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxDropdown' })

type UDropdownMenuProps = ComponentProps<typeof UDropdown>

const ns = useCxBEM('dropdown')
const inner = defineProps<{}>()
const props = useAttrs() as UDropdownMenuProps & {
  cmpt: CxComponentRuntime
  label?: string
  hoverMode?: boolean
  direction?: Placement
}

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const attrs = computed(
  () =>
    ({
      mode: has(props.hoverMode) ? 'hover' : 'click',
      items: props.items || [],
      popper: { placement: props.direction || 'bottom-start' },
    }) as const,
)

const { isReRendering, size } = useCxReRender(cmptRef, () => props.direction)

defineExpose({})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('dropdown') {
    // ...
  }
}
</style>
