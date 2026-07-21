<template>
  <ULink
    ref="cmpt"
    :class="ns.b()"
    v-bind="attrs"
    active-class="text-(--ui-primary)"
    inactive-class="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
  >
    <template #default="x">
      <slot v-if="showSlot('default')" name="default" v-bind="x" />
      <span v-else>{{ props.label || '链接' }}</span>
    </template>
  </ULink>
</template>

<script setup lang="ts">
import { useAttrs, useTemplateRef, computed } from 'vue'

import { ULink } from '../../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxLink' })

type ULinkProps = ComponentProps<typeof ULink>

const ns = useCxBEM('kbd')

const emits = defineEmits(['update:value'])
const inner = defineProps<{}>()
const props = useAttrs() as ULinkProps & {
  cmpt: CxComponentRuntime
  openInNew?: boolean
  label?: string
}

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const attrs = computed(
  () =>
    ({
      to: props.to,
      target: props.openInNew ? '_blank' : undefined,
      rel: props.openInNew ? 'noopener noreferrer' : undefined,
      external: props.openInNew,
    }) as const,
)

defineExpose({})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('kbd') {
  }
}
</style>
