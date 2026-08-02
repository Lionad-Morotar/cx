import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vite-plus'
import Vue from 'unplugin-vue/vite'

/**
 * Vite+ 统一工具链配置：测试、lint、格式化、任务编排单一出口。
 * vendored 第三方源码不参与 lint/fmt。
 */
export default defineConfig({
  plugins: [Vue()],
  resolve: {
    alias: {
      // Nuxt srcDir 别名离线化：playground app 内 SFC 以 `~/dev/*` 引用共享模块，
      // vitest 管线无 Nuxt 解析器，此处等价指回 srcDir（相对 import.meta.url 可移植）
      '~': fileURLToPath(new URL('./playground/app', import.meta.url)),
      // 测试环境单 vue 实例：pnpm 的 typescript peer 风味会产生两个物理 vue 副本，
      // 导致 EMPTY_OBJ 单例身份分裂（useTemplateRef 崩溃），此处强制归一。
      // 必须相对 import.meta.url 取本检出内的副本：worktree 检出下指向主仓绝对路径会让
      // 别名模块落在检出边界外（/@fs/ 外部 id），模块身份与外部化决策分裂出双实例。
      vue: fileURLToPath(
        new URL(
          './node_modules/.pnpm/vue@3.5.26_typescript@7.0.2/node_modules/vue',
          import.meta.url,
        ),
      ),
      // Nuxt 虚拟模块离线化（与 comps-nuxt-ui-v2 的 pack alias 一致）
      '#app': fileURLToPath(
        new URL('./packages/comps-nuxt-ui-v2/vendor/shims/imports.ts', import.meta.url),
      ),
      '#imports': fileURLToPath(
        new URL('./packages/comps-nuxt-ui-v2/vendor/shims/imports.ts', import.meta.url),
      ),
      // v4 物料的 U* 组件离线 stub（宿主环境由 @nuxt/ui 提供真实实现）
      '#components': fileURLToPath(
        new URL('./packages/comps-nuxt-ui-v4/src/shims/components.ts', import.meta.url),
      ),
      // cx-nuxt 装配清单虚拟模块（playground nuxi prepare 生成物）
      '#build/cx-bundles.mjs': fileURLToPath(
        new URL('./playground/.nuxt/cx-bundles.mjs', import.meta.url),
      ),
      '#build/app.config': fileURLToPath(
        new URL('./packages/comps-nuxt-ui-v2/vendor/shims/app.config.ts', import.meta.url),
      ),
      '#ui-colors': fileURLToPath(
        new URL('./packages/comps-nuxt-ui-v2/vendor/shims/ui-colors.d.ts', import.meta.url),
      ),
      'nuxt/schema': fileURLToPath(
        new URL('./packages/comps-nuxt-ui-v2/vendor/shims/nuxt-schema.d.ts', import.meta.url),
      ),
    },
  },
  test: {
    include: [
      'packages/*/src/**/*.test.ts',
      'packages/*/tests/**/*.test.ts',
      'playground/tests/**/*.test.ts',
    ],
    exclude: ['playground/tests/setup.ts'],
    setupFiles: ['playground/tests/setup.ts'],
    environment: 'happy-dom',
    server: {
      deps: {
        // element-plus / naive-ui 默认 externalize 会经原生 import 解析出第二份 vue（与 hard
        // alias 归一的 SFC/测试侧副本分属双实例），跨实例依赖收集静默失效——ElInput / NInput
        // 等含内部 watch 的控件对测试侧响应式源永不触发。内联使其与 SFC 同走 vite 管线共享单实例。
        // naive-ui 额外带 css-render import-time 副作用，externalize 路径下副作用也与测试侧分轨。
        // 匹配限定包路径段（node_modules/<pkg>/）：裸子串会命中含同名片段的检出目录名
        // （如 worktree slug），把整个检出内的全部模块误伤为 inline——uuid 等 CJS 包
        // 经 vite 管线混排后 default 互操作丢失（wrapper.mjs 顶层读 v1 即崩）
        inline: [/node_modules\/element-plus\//, /node_modules\/naive-ui\//],
      },
    },
  },
  lint: {
    ignorePatterns: [
      'dist/**',
      'packages/comps-nuxt-ui-v2/vendor/**',
      'packages/comps/src/calendar/vendor/el-calendar/**',
      'playground/.output/**',
      'playground/.nuxt/**',
    ],
  },
  fmt: {
    semi: false,
    singleQuote: true,
    ignorePatterns: [
      'dist/**',
      'packages/comps-nuxt-ui-v2/vendor/**',
      'packages/comps/src/calendar/vendor/el-calendar/**',
      'playground/.output/**',
      'playground/.nuxt/**',
      'playground/mocks/data/**',
    ],
  },
})
