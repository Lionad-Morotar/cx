import { defineConfig } from 'vite-plus'

/**
 * Vite+ 统一工具链配置：测试、lint、格式化、任务编排单一出口。
 * vendored 第三方源码不参与 lint/fmt。
 */
export default defineConfig({
  test: {
    include: ['packages/*/src/**/*.test.ts', 'packages/*/tests/**/*.test.ts'],
    environment: 'happy-dom',
  },
  lint: {
    ignorePatterns: ['dist/**', 'packages/components-nuxt-ui-v4/vendor/**'],
  },
  fmt: {
    semi: false,
    singleQuote: true,
    ignorePatterns: ['dist/**', 'packages/components-nuxt-ui-v4/vendor/**'],
  },
})
