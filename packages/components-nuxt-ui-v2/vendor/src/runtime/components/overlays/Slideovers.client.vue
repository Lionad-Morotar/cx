<template>
  <component
    :is="slideoverState.component"
    v-if="slideoverState"
    v-bind="slideoverState.props"
    v-model="isOpen"
    @after-leave="reset"
  />
</template>

<script lang="ts" setup>
// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import { inject } from 'vue'
import { useSlideover, slidOverInjectionKey } from '../../composables/useSlideover'

const slideoverState = inject(slidOverInjectionKey)

const { isOpen, reset } = useSlideover()
</script>
