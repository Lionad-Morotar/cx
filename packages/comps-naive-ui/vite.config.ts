import { defineConfig } from 'vite-plus'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  pack: {
    plugins: [Vue({ isProduction: true })],
    dts: false,
    deps: {
      // naive-ui 与其 css-render / vueuc 等内部链保持外置：消费方自行解析，
      // 避免把 naive 实现打进产物（与 vtu 对 @lionad/vtu-components、EP 对 element-plus 的处理同形）
      neverBundle: [
        'vue',
        '@vue/shared',
        '@vueuse/core',
        '@lionad/cx-definition',
        '@lionad/cx-vue',
        '@lionad/cx-stream',
        'naive-ui',
      ],
    },
  },
})
