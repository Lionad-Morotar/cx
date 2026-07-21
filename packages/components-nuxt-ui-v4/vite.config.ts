import { defineConfig } from 'vite-plus'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  pack: {
    plugins: [Vue({ isProduction: true })],
    dts: false,
    // v4 物料裸用 U* 组件（宿主 @nuxt/ui module 的 auto-import 解析）；
    // Nuxt 虚拟模块与 vue 外置，dist 不内联 v4 源码
    deps: {
      neverBundle: [
        '#imports',
        '#app',
        '#build/app.config',
        '#components',
        'vue',
        '@vue/shared',
        '@vueuse/core',
        '@lionad/cx-definition',
        '@lionad/cx-vue',
      ],
    },
  },
})
