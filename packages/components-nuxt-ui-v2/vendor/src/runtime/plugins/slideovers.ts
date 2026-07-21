// @ts-nocheck —— vendored nuxt-ui v2 第三方源码（MIT），按原版携带，不参与类型质量门
import { shallowRef } from 'vue'
import { slidOverInjectionKey } from '../composables/useSlideover'
import type { SlideoverState } from '../types/slideover'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const slideoverState = shallowRef<SlideoverState>({
    component: 'div',
    props: {}
  })

  nuxtApp.vueApp.provide(slidOverInjectionKey, slideoverState)
})
