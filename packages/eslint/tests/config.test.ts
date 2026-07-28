import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import cx, { createConfig } from '../index.js'

/**
 * 共享 flat config 的契约测试。
 * 行为契约：config 可加载（typescript-eslint 与包内 TS6 alias 工作）、
 * TS/Vue/Vitest 规则生效、格式类规则全关（归 Oxfmt）、项目级 ignores 命中。
 */

// 注意级数：resolve 的首个 '..' 弹的是文件名本身，tests/ → eslint/ → packages/ → cx 需四级
const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../..')

function makeEslint(config = cx) {
  return new ESLint({
    cwd: repoRoot,
    overrideConfigFile: true,
    overrideConfig: config,
  })
}

async function lint(filePath: string, code: string, config = cx) {
  const [result] = await makeEslint(config).lintText(code, {
    filePath: resolve(repoRoot, filePath),
  })
  return result?.messages ?? []
}

describe('cx eslint config', () => {
  it('对 TS 未使用变量报错，_ 前缀豁免', async () => {
    const hits = await lint('fixture.ts', 'const unused = 1\nconst _kept = 2\nexport {}\n')
    const unusedRule = hits.filter((m) => m.ruleId === '@typescript-eslint/no-unused-vars')
    expect(unusedRule).toHaveLength(1)
    expect(unusedRule[0]?.message).toContain("'unused'")
  })

  it('TS 文件可解析类型标注，且 no-undef 关闭（Node 全局可用）', async () => {
    const hits = await lint('fixture.ts', 'const x: number = 1\nprocess.exitCode = x\nexport {}\n')
    expect(hits.filter((m) => m.fatal)).toHaveLength(0)
    expect(hits.filter((m) => m.ruleId === 'no-undef')).toHaveLength(0)
  })

  it('.vue SFC 模板规则生效（v-for 缺 key），script setup TS 可解析', async () => {
    const sfc = [
      '<template>',
      '  <ul>',
      '    <li v-for="item in items">{{ item }}</li>',
      '  </ul>',
      '</template>',
      '<script setup lang="ts">',
      "defineProps<{ items: string[] }>()",
      '</script>',
      '',
    ].join('\n')
    const hits = await lint('fixture.vue', sfc)
    expect(hits.filter((m) => m.fatal)).toHaveLength(0)
    expect(hits.map((m) => m.ruleId)).toContain('vue/require-v-for-key')
  })

  it('格式类规则全部关闭（分号、双引号、模板缩进不报）', async () => {
    const FORMAT_RULES = new Set([
      'semi',
      'quotes',
      'indent',
      '@typescript-eslint/indent',
      'vue/html-indent',
      'vue/max-attributes-per-line',
      'vue/first-attribute-linebreak',
      'vue/html-closing-bracket-newline',
    ])
    const tsHits = await lint('fixture.ts', 'export const answer = "42";\n')
    expect(tsHits.filter((m) => FORMAT_RULES.has(m.ruleId ?? ''))).toHaveLength(0)

    const sfc = ['<template>', '<div>', '<span>hi</span>', '</div>', '</template>', ''].join('\n')
    const vueHits = await lint('fixture.vue', sfc)
    expect(vueHits.filter((m) => FORMAT_RULES.has(m.ruleId ?? ''))).toHaveLength(0)
  })

  it('mjs 脚本拥有 Node 全局（process 不报 no-undef）', async () => {
    const hits = await lint('fixture.mjs', 'process.exitCode = 0\n')
    expect(hits.filter((m) => m.ruleId === 'no-undef')).toHaveLength(0)
  })

  it('测试文件启用 vitest 规则（无 expect 的用例被报出）', async () => {
    const code = [
      "import { it } from 'vitest'",
      "it('works', () => {",
      '  const a = 1',
      '  void a',
      '})',
      '',
    ].join('\n')
    const hits = await lint('fixture.test.ts', code)
    expect(hits.map((m) => m.ruleId)).toContain('vitest/expect-expect')
  })

  it('默认预设忽略 vendored 源码，不忽略正常源码', async () => {
    const eslint = makeEslint()
    await expect(
      eslint.isPathIgnored(resolve(repoRoot, 'packages/components-nuxt-ui-v2/vendor/shims/imports.ts')),
    ).resolves.toBe(true)
    await expect(
      eslint.isPathIgnored(resolve(repoRoot, 'packages/components/src/index.ts')),
    ).resolves.toBe(false)
  })

  it('工厂追加 ignores 生效', async () => {
    const eslint = makeEslint(createConfig({ ignores: ['custom-dir/**'] }))
    await expect(eslint.isPathIgnored(resolve(repoRoot, 'custom-dir/a.ts'))).resolves.toBe(true)
    await expect(
      eslint.isPathIgnored(resolve(repoRoot, 'packages/components/src/index.ts')),
    ).resolves.toBe(false)
  })
})
