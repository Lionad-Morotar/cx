<template>
  <UDivider
    ref="cmpt"
    :class="ns.b()"
    v-bind="attrs"
  >
    <template
      v-if="showSlot('default') || safeIcon(inner.icon)"
      #default="x"
    >
      <CxIcon
        v-if="safeIcon(inner.icon)"
        :name="safeIcon(inner.icon)"
      />
      <slot
        v-else
        name="default"
        v-bind="x"
      />
    </template>
  </UDivider>
</template>

<script setup lang="ts">
import { CxIcon } from '@lionad/cx-vue'
import { safeIcon } from '@lionad/cx-vue'
import { useAttrs , useTemplateRef, computed} from 'vue'

import { UDivider } from '../../../../vendor/bridge'

import { useCxSlot , useCxBEM} from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxDivider' })

type USeparatorProps = ComponentProps<typeof UDivider>

const ns = useCxBEM('divider')
const inner = defineProps<{
  icon?: string
}>()
const props = useAttrs() as USeparatorProps & {
  cmpt: CxComponentRuntime
}

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const attrs = computed(() => ({
  label: props.label || '',
  orientation: props.orientation || 'horizontal',
  type: props.type || 'solid',
  size: props.size
} as const))
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('divider') {
    // ...
  }
}
</style>
