import { defineConfig } from 'vite-plus'

/**
 * stream 构建配置：主入口之外增补 `core/*` 通配入口，把 core/ 纯 TS 管线
 * 构建为独立产物。包主入口打包含 vue composables 绑定层（顶层 import 'vue'），
 * 服务端宿主（如 Nuxt nitro）经 exports 的 `./core/*` 子路径只消费纯管线，
 * 不连带框架绑定层。
 */
export default defineConfig({
  pack: {
    dts: true,
    entry: {
      index: 'src/index.ts',
      'core/*': 'src/core/*.ts',
    },
  },
})
