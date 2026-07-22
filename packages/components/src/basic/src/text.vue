<template>
  <component :is="props.type" :class="[ns.b(), ns.e('content'), ns.is('truncate', props.truncate)]">
    {{ displayText }}
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useCxBEM } from '@lionad/cx-vue'

defineOptions({ name: 'CxText' })

const ns = useCxBEM('text')
const props = withDefaults(
  defineProps<{
    type: keyof HTMLElementTagNameMap
    content?: string
    truncate?: boolean
  }>(),
  {
    type: 'p',
    content: '',
    truncate: false,
  },
)

const displayText = computed(() => {
  // empty space for better mouse interaction
  return props.content || ' '
})
</script>

<style lang="scss">
@use '../../styles/index.scss' as *;

$ns: 'cx';

@layer cx {
  @include b('text') {
    @apply relative min-h-6;
    @apply text-sm text-neutral-700 dark:text-neutral-300;
    @apply max-w-full;
    line-height: inherit;

    @include when('truncate') {
      @apply truncate;
    }

    @include e('content') {
      @apply min-h-6 leading-6;
    }

    &:is(h1) {
      @apply text-2xl font-bold;
    }
    &:is(h2) {
      @apply text-xl font-bold;
    }
    &:is(h3) {
      @apply text-lg  font-bold;
    }
    &:is(h4) {
      @apply text-base font-bold;
    }
    &:is(h5) {
      @apply text-sm  font-bold;
    }
    &:is(h6) {
      @apply text-xs  font-bold;
    }
  }
}
</style>
