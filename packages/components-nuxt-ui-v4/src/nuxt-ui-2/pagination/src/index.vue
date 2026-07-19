<template>
  <UPagination
    ref="cmpt"
    v-model="currentPage"
    :class="ns.b()"
    v-bind="attrs"
  >
    <template
      v-if="showSlot('prev')"
      #prev="x"
    >
      <slot
        name="prev"
        v-bind="x"
      />
    </template>
    <template
      v-if="showSlot('first')"
      #first="x"
    >
      <slot
        name="first"
        v-bind="x"
      />
    </template>
    <template
      v-if="showSlot('last')"
      #last="x"
    >
      <slot
        name="last"
        v-bind="x"
      />
    </template>
    <template
      v-if="showSlot('next')"
      #next="x"
    >
      <slot
        name="next"
        v-bind="x"
      />
    </template>
  </UPagination>
</template>

<script setup lang="ts">
import { safeNum } from '@lionad/cx-definition'

import { useAttrs , useTemplateRef, computed, ref} from 'vue'

import { UPagination } from '../../../../vendor/bridge'

import { useCxSlot , useCxBEM} from '@lionad/cx-vue'
import type { CxComponentRuntime, ComponentProps } from '@lionad/cx-definition'
import { isBoolean } from 'lodash-es'

defineOptions({ name: 'CxPagination' })

type UPaginationProps = ComponentProps<typeof UPagination>

const ns = useCxBEM('meter')

const emits = defineEmits(['update:value'])
const inner = defineProps<{}>()
const props = useAttrs() as UPaginationProps & {
  cmpt: CxComponentRuntime
}

const { showSlot } = useCxSlot(props.cmpt)

const cmptRef = useTemplateRef('cmpt')
const ui = computed(() => {})

const currentPage = ref(1)

const attrs = computed(() => ({
  total: safeNum(props.total, 100),
  pageCount: safeNum(props.pageCount, 10),
  max: safeNum(props.max, 10),
  size: props.size,
  disabled: isBoolean(props.disabled) ? props.disabled : false
} as const))

defineExpose({})
</script>

<style lang="scss">
@use '../../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('meter') {
  }
}
</style>
