import { defineConfig } from 'vite-plus'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  pack: {
    plugins: [Vue({ isProduction: true })],
    dts: false,
    deps: {
      // TanStack Charts 与 d3-shape 保持外置：消费方自行解析（与 element-plus 同形），
      // 避免把库实现打进产物；d3-shape 由物料包 dependencies 声明、经 pnpm 软链解析
      neverBundle: [
        'vue',
        '@vue/shared',
        '@vueuse/core',
        '@lionad/cx-definition',
        '@lionad/cx-vue',
        '@lionad/cx-stream',
        '@tanstack/charts',
        // vue 适配器 0.14 起收进主包子路径（@tanstack/charts/vue），外置匹配主包即可覆盖
        'd3-shape',
      ],
    },
  },
})
