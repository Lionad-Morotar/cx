<template>
  <div ref="cmpt" :class="[ns.b(), props.padded ? 'p-4' : '']" class="flex items-center gap-4">
    <USkeleton
      v-if="type === 1"
      class="h-12 w-12 flex-shrink-0"
      :ui="{ rounded: 'rounded-full' }"
      v-bind="binds"
    />
    <div class="flex flex-col justify-center items-start gap-2 w-full">
      <USkeleton class="h-4 w-4/5" v-bind="binds" />
      <USkeleton class="h-4 w-2/5" v-bind="binds" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { safeNum, has } from '@lionad/cx-definition'

import { useAttrs, useTemplateRef, computed } from 'vue'

import { USkeleton } from '../../../vendor/bridge'

import { useCxSlot, useCxBEM } from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'

defineOptions({ name: 'CxSkeleton' })

type USkeletonProps = ComponentProps<typeof USkeleton>

const ns = useCxBEM('skeleton')
const inner = defineProps<{}>()
const props = useAttrs() as USkeletonProps & {
  cmpt: CxComponentRuntime
  noAnimation?: boolean
  type?: number
  padded?: boolean
}
const { showSlot, showDefault } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const type = computed(() => safeNum(props.type, 1))

const binds = computed(() => ({
  animation: has(props.noAnimation) ? '' : 'animate-pulse',
}))
</script>

<style lang="scss">
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('skeleton') {
    // ...
  }
}
</style>
