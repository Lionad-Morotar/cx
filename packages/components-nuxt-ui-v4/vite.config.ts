import { defineConfig } from 'vite-plus'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  pack: {
    plugins: [Vue({ isProduction: true })],
    dts: false,
    // Nuxt 虚拟模块离线化：vendored nuxt-ui-v2 经 shim 脱离 Nuxt 运行时
    alias: {
      '#app': './vendor/shims/imports.ts',
      '#imports': './vendor/shims/imports.ts',
      '#build/app.config': './vendor/shims/app.config.ts',
      '#ui-colors': './vendor/shims/ui-colors.d.ts',
      'nuxt/schema': './vendor/shims/nuxt-schema.d.ts',
    },
    define: {
      'import.meta.dev': 'false',
    },
    deps: {
      neverBundle: [
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
