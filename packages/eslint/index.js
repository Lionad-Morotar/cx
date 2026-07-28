/**
 * cx 共享 ESLint flat config。
 *
 * 定位：深度规则层，与 Vite+ 内置 Oxlint（`vp check`，求快）并存——
 * 本 config 提供 Vue / TS / Vitest 生态的完整规则集。
 * 格式化归 Oxfmt 管：收尾经 eslint-config-prettier 关闭全部格式类规则，互不打架。
 *
 * Why 纯 JS 无构建：lint 是开发链路第一步，不能要求"先构建出 dist 才能 lint"；
 * 消费方（eslint.config.mjs）直接 import 本文件即可。
 *
 * Why 包内 alias typescript@6：typescript-eslint 8.x 加载时对 TS 7.0 直接抛错
 * （其 TS 7 支持 tracking 于 typescript-eslint#10940，目标 7.1+）。
 * 仓库 typecheck 走 tsgo/vue-tsgo（TS 7 原生实现），lint 仅需 TS 的 JS API——
 * 故把本包内的 typescript 解析重定向到 6.x 副本，影响面封闭在本包，
 * 根与其余子包的 typescript@7 不受影响。上游支持落地后移除此 alias。
 */

import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import vue from 'eslint-plugin-vue'
import vitest from '@vitest/eslint-plugin'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import noHardcodedColor from './rules/no-hardcoded-color.js'
import noTrackingMarker from './rules/no-tracking-marker.js'
import requireComponentName from './rules/require-component-name.js'

/** cx 自研规则插件：下游项目可自行注册后按自身参数开启 */
export const cxPlugin = {
  meta: { name: 'cx', version: '0.1.0' },
  rules: {
    'no-hardcoded-color': noHardcodedColor,
    'no-tracking-marker': noTrackingMarker,
    'require-component-name': requireComponentName,
  },
}

/** 测试文件模式：与根 vite.config.ts 的 test.include 对齐 */
const TEST_FILES = [
  '**/*.test.{ts,mts,js,mjs}',
  '**/tests/**/*.{ts,mts,js,mjs}',
]

/**
 * TS 规则作用的文件集：ts 家族 + .vue SFC（<script setup lang="ts">）。
 * tseslint recommended 默认只匹配 ts 文件，组装时把带 files 的层扩展到此集合。
 */
const TS_FILES = ['**/*.{ts,mts,cts,tsx}', '**/*.vue']

/**
 * 组装 flat config。
 *
 * @param {object} [options]
 * @param {string[]} [options.ignores] 追加的项目级忽略（产物目录、vendor 源码等）
 * @returns {import('eslint').Linter.Config[]}
 */
export function createConfig(options = {}) {
  const { ignores = [] } = options

  return defineConfig(
    {
      ignores: [
        '**/dist/**',
        '**/coverage/**',
        '**/.nuxt/**',
        '**/.output/**',
        ...ignores,
      ],
    },

    js.configs.recommended,

    // TS 推荐规则，files 扩展到 .vue（SFC 中的 TS 代码同样受管）
    ...tseslint.configs.recommended.map((config) =>
      config.files ? { ...config, files: TS_FILES } : config,
    ),

    ...vue.configs['flat/recommended'],

    {
      // <script setup lang="ts"> 的 script 块交给 TS parser（vue parser 管模板，TS parser 管脚本）
      files: ['**/*.vue'],
      languageOptions: {
        parserOptions: { parser: tseslint.parser },
      },
    },

    {
      // TS 编译器自查未定义标识符；Nuxt auto-import 全局（playground）也依赖此关闭
      files: TS_FILES,
      rules: { 'no-undef': 'off' },
    },

    {
      // 纯 JS/MJS 脚本（scripts/*.mjs 等 Node 上下文）
      files: ['**/*.{js,mjs,cjs}'],
      languageOptions: { globals: globals.node },
    },

    {
      rules: {
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
        // 路由页文件名即路由（Nuxt 的 index.vue / [id].vue），多词约束对页面是噪音
        'vue/multi-word-component-names': 'off',
      },
    },

    {
      ...vitest.configs.recommended,
      files: TEST_FILES,
    },

    // 收尾：格式归 Oxfmt，关闭全部格式类规则（含 vue/html-* 系列）
    prettier,
  )
}

/**
 * 存量治理期降级为 warn 的规则。
 *
 * Why 降级而非清零：ESLint 接入时全仓存量命中约千条，逐个人工修复会与并行开发冲突；
 * 降级保持可见（IDE/输出可追），分期治理后恢复 error。
 * Why 放在预设而非工厂：治理状态是 cx monorepo 的本地事实，不应传染下游项目。
 *
 * 治理优先级：vue/return-in-computed-property（真实 bug 候选）> no-mutating-props >
 * no-side-effects-in-computed-properties > no-unused-vars > no-explicit-any。
 */
const LEGACY_WARN_RULES = {
  // schema 驱动的动态边界（props/data 运行时形状）天然大量 any
  '@typescript-eslint/no-explicit-any': 'warn',
  '@typescript-eslint/no-unused-vars': [
    'warn',
    {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-unused-expressions': 'warn',
  '@typescript-eslint/no-empty-object-type': 'warn',
  // vendored 源码的 @ts-nocheck 是合法标记，与待治理存量混在一起
  '@typescript-eslint/ban-ts-comment': 'warn',
  'vue/return-in-computed-property': 'warn',
  'vue/no-mutating-props': 'warn',
  'vue/no-side-effects-in-computed-properties': 'warn',
  'vue/valid-v-for': 'warn',
}

/** cx monorepo 开箱即用预设：追加 vendored 第三方源码忽略 + 存量治理降级 */
export default createConfig({
  ignores: [
    'packages/components-nuxt-ui-v2/vendor/**',
    'packages/components-nuxt-ui-v4/vendor/**',
    'packages/components/src/calendar/vendor/el-calendar/**',
  ],
})
  .concat({
    name: 'cx/custom-rules',
    plugins: { cx: cxPlugin },
    rules: {
      // 暂时关闭：颜色治理依赖物料级设计 Token 源文件（cx 尚无，Token 只在 playground
      // @theme 注册），存量约 35 处无可迁移目标——待设计系统落地后恢复 error 并分期治理
      'cx/no-hardcoded-color': 'off',
      'cx/no-tracking-marker': 'error',
      // 物料包中缀体系：components/v2/renderer 等为 cx-*，v4/vtu 带包中缀
      'cx/require-component-name': [
        'error',
        {
          prefix: 'cx',
          packagePrefixes: {
            'components-nuxt-ui-v4': 'cx-nuxt-ui-v4',
            'components-vtu': 'cx-vtu',
          },
          // v4 物料是 Nuxt UI v4 薄包装：根为 U* 组件，DOM 类体系由被包装组件控制
          skipRootClassPackages: ['components-nuxt-ui-v4'],
        },
      ],
      // 与 require-component-name 的 kebab fixer 循环打架；Cx 命名 PascalCase 由其 case 宽容接管
      'vue/component-definition-name-casing': 'off',
    },
  })
  // 降级层必须位于规则启用层之后——flat config 后者覆盖前者，否则 warn 会被 error 盖回
  .concat({
    name: 'cx/legacy-warns',
    rules: LEGACY_WARN_RULES,
  })
  .concat({
    // 规则定义自举豁免：no-tracking-marker 扫注释，会把规则文件自身的形态样例当违规
    name: 'cx/custom-rules-bootstrap',
    files: ['packages/eslint/rules/**'],
    rules: {
      'cx/no-tracking-marker': 'off',
    },
  })
