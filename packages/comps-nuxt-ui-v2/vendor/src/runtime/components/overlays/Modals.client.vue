<template>
  <component
    :is="modalState.component"
    v-if="modalState"
    v-bind="modalState.props"
    v-model="isOpen"
    @after-leave="reset"
  />
</template>

<script lang="ts" setup>
// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import { inject } from 'vue'
import { useModal, modalInjectionKey } from '../../composables/useModal'

const modalState = inject(modalInjectionKey)

const { isOpen, reset } = useModal()
</script>
