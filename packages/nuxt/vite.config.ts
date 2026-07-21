import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: ['./src/module.ts'],
    dts: true,
    deps: {
      neverBundle: [
        '@nuxt/kit',
        'vue',
        '@vue/shared',
        '@vueuse/core',
        '@lionad/cx-definition',
        '@lionad/cx-vue',
        '@lionad/cx-render',
        '@lionad/cx-components',
        '@lionad/cx-components-nuxt-ui-v2',
      ],
    },
  },
})
