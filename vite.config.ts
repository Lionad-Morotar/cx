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
      // 测试环境单 vue 实例：pnpm 的 typescript peer 风味会产生两个物理 vue 副本，
      // 导致 EMPTY_OBJ 单例身份分裂（useTemplateRef 崩溃），此处强制归一
      vue: '/Users/lionad/Github/Lionad-Morotar/cx/node_modules/.pnpm/vue@3.5.26_typescript@7.0.2/node_modules/vue',
      // Nuxt 虚拟模块离线化（与 components-nuxt-ui-v2 的 pack alias 一致）
      '#app':
        '/Users/lionad/Github/Lionad-Morotar/cx/packages/components-nuxt-ui-v2/vendor/shims/imports.ts',
      '#imports':
        '/Users/lionad/Github/Lionad-Morotar/cx/packages/components-nuxt-ui-v2/vendor/shims/imports.ts',
      '#build/app.config':
        '/Users/lionad/Github/Lionad-Morotar/cx/packages/components-nuxt-ui-v2/vendor/shims/app.config.ts',
      '#ui-colors':
        '/Users/lionad/Github/Lionad-Morotar/cx/packages/components-nuxt-ui-v2/vendor/shims/ui-colors.d.ts',
      'nuxt/schema':
        '/Users/lionad/Github/Lionad-Morotar/cx/packages/components-nuxt-ui-v2/vendor/shims/nuxt-schema.d.ts',
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
  },
  lint: {
    ignorePatterns: [
      'dist/**',
      'packages/components-nuxt-ui-v2/vendor/**',
      'packages/components/src/calendar/vendor/el-calendar/**',
      'playground/.output/**',
      'playground/.nuxt/**',
    ],
  },
  fmt: {
    semi: false,
    singleQuote: true,
    ignorePatterns: [
      'dist/**',
      'packages/components-nuxt-ui-v2/vendor/**',
      'packages/components/src/calendar/vendor/el-calendar/**',
      'playground/.output/**',
      'playground/.nuxt/**',
      'playground/mocks/data/**',
    ],
  },
})
