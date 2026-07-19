import { defineConfig } from 'vite-plus'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  pack: {
    plugins: [Vue({ isProduction: true })],
    dts: false,
    // Nuxt 虚拟模块外置：宿主为 Nuxt 时解析真实实现（SSR 语义正确），
    // 非 Nuxt 消费需自行提供 alias（见 README）
    alias: {
      '#ui-colors': './vendor/shims/ui-colors.d.ts',
      'nuxt/schema': './vendor/shims/nuxt-schema.d.ts',
    },
    define: {
      'import.meta.dev': 'false',
    },
    deps: {
      neverBundle: [
        '#imports',
        '#app',
        '#build/app.config',
        'vue',
        '@vue/shared',
        '@vueuse/core',
        '@lionad/cx-definition',
        '@lionad/cx-vue',
        '@lionad/cx-render',
      ],
    },
  },
})
