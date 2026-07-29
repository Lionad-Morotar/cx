import { defineConfig } from 'vite-plus'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  pack: {
    plugins: [Vue({ isProduction: true })],
    dts: false,
    deps: {
      // element-plus 与其 @element-plus/* 内部包保持外置：消费方自行解析，
      // 避免把 EP 实现打进产物（与 vtu 对 @lionad/vtu-components 的处理同形）
      neverBundle: [
        'vue',
        '@vue/shared',
        '@vueuse/core',
        '@lionad/cx-definition',
        '@lionad/cx-vue',
        '@lionad/cx-stream',
        'element-plus',
      ],
    },
  },
})
