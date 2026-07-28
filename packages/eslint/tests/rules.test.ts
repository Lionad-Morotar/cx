import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'

import cx from '../index.js'
import { deriveComponentName, toPascal } from '../rules/require-component-name.js'

/**
 * cx 自研三规则的行为契约测试。
 * 经 ESLint API + 真实 filePath 直测（lint-infra 手册：RuleTester 的别名注册
 * 会让 eslint-disable 抑制语义失真，且路径推导依赖物理路径形态）。
 */

// 注意级数：resolve 的首个 '..' 弹的是文件名本身，tests/ → eslint/ → packages/ → cx 需四级
const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../..')

function makeEslint(fix = false) {
  return new ESLint({
    cwd: repoRoot,
    overrideConfigFile: true,
    overrideConfig: cx,
    fix,
  })
}

async function lint(filePath: string, code: string, fix = false) {
  const [result] = await makeEslint(fix).lintText(code, {
    filePath: resolve(repoRoot, filePath),
  })
  return result
}

const cxHits = (result: Awaited<ReturnType<typeof lint>>, rule: string) =>
  (result?.messages ?? []).filter((m) => m.ruleId === rule)

// 颜色规则在预设中暂时关闭（等设计系统），测试显式重开以守护规则本体行为
const cxWithColor = cx.concat({ rules: { 'cx/no-hardcoded-color': 'error' } })

async function lintColor(filePath: string, code: string) {
  const eslint = new ESLint({
    cwd: repoRoot,
    overrideConfigFile: true,
    overrideConfig: cxWithColor,
  })
  const [result] = await eslint.lintText(code, { filePath: resolve(repoRoot, filePath) })
  return result
}

function sfc(script: string, template = '<div>content</div>') {
  return ['<template>', `  ${template}`, '</template>', script, ''].join('\n')
}

describe('require-component-name：路径推导', () => {
  it('物料包 index 回退父目录，src 容器段再上溯', () => {
    expect(deriveComponentName('packages/components/src/accordion/src/index.vue', { prefix: 'cx' })).toBe(
      'cx-accordion',
    )
    expect(deriveComponentName('packages/components/src/grid/panel/grids-form.vue', { prefix: 'cx' })).toBe(
      'cx-grids-form',
    )
  })

  it('packagePrefixes 按包覆盖前缀（v4/vtu 中缀体系）', () => {
    const options = {
      prefix: 'cx',
      packagePrefixes: { 'components-nuxt-ui-v4': 'cx-nuxt-ui-v4', 'components-vtu': 'cx-vtu' },
    }
    expect(deriveComponentName('packages/components-nuxt-ui-v4/src/accordion/index.vue', options)).toBe(
      'cx-nuxt-ui-v4-accordion',
    )
    expect(deriveComponentName('packages/components-vtu/src/linked-in-post/index.vue', options)).toBe(
      'cx-vtu-linked-in-post',
    )
  })

  it('缺 prefix 抛错（fail-loud 防漏配）', () => {
    expect(() => deriveComponentName('packages/components/src/alert/index.vue')).toThrow(/prefix/)
  })

  it('非目标路径返回 null', () => {
    expect(deriveComponentName('packages/components/src/utils/helper.ts', { prefix: 'cx' })).toBeNull()
    expect(deriveComponentName('scripts/build.mjs', { prefix: 'cx' })).toBeNull()
  })

  it('toPascal：fixer 产物风格', () => {
    expect(toPascal('cx-alert')).toBe('CxAlert')
    expect(toPascal('cx-nuxt-ui-v4-accordion')).toBe('CxNuxtUiV4Accordion')
  })
})

describe('require-component-name：SFC 行为', () => {
  const alertPath = 'packages/components/src/alert/index.vue'

  it('script setup 缺 name：fixer 在最后一个 import 后插入 PascalCase defineOptions', async () => {
    const code = sfc(
      ['<script setup lang="ts">', "import { ref } from 'vue'", '', 'const count = ref(0)', '</script>'].join(
        '\n',
      ),
    )
    // fix 模式下 messages 是修复后的剩余问题——修复成功即消失，命中与否看 output 产物
    const result = await lint(alertPath, code, true)
    expect(result?.output).toContain("defineOptions({ name: 'CxAlert' })")
    // 插入点在 import 之后、业务语句之前
    expect(result?.output?.indexOf('defineOptions')).toBeGreaterThan(
      result?.output?.indexOf("from 'vue'") ?? -1,
    )
    expect(result?.output?.indexOf('defineOptions')).toBeLessThan(
      result?.output?.indexOf('const count') ?? Number.MAX_SAFE_INTEGER,
    )
  })

  it('name 与路径不匹配：fixer 改写为 PascalCase 推导名', async () => {
    const code = sfc(
      ['<script setup lang="ts">', "defineOptions({ name: 'CxButton' })", '</script>'].join('\n'),
    )
    const result = await lint(alertPath, code, true)
    expect(result?.output).toContain("name: 'CxAlert'")
    expect(result?.output).not.toContain('CxButton')
  })

  it('case 宽容：期望 cx-alert 时 CxAlert / cx_alert 均不报', async () => {
    for (const name of ['CxAlert', 'cx_alert', 'cx-alert']) {
      const code = sfc(
        ['<script setup lang="ts">', `defineOptions({ name: '${name}' })`, '</script>'].join('\n'),
        '<div class="cx-alert">content</div>',
      )
      const result = await lint(alertPath, code)
      expect(cxHits(result, 'cx/require-component-name')).toHaveLength(0)
    }
  })

  it('分段歧义宽容：CxNuxtUIV4Accordion 于 v4 包 accordion 路径不报', async () => {
    const code = sfc(
      ['<script setup lang="ts">', "defineOptions({ name: 'CxNuxtUIV4Accordion' })", '</script>'].join('\n'),
    )
    const result = await lint('packages/components-nuxt-ui-v4/src/accordion/index.vue', code)
    expect(cxHits(result, 'cx/require-component-name')).toHaveLength(0)
  })

  it('根元素缺标记类：fixer 在开标签末尾插入 kebab class', async () => {
    const code = sfc(
      ['<script setup lang="ts">', "defineOptions({ name: 'CxAlert' })", '</script>'].join('\n'),
    )
    const result = await lint(alertPath, code, true)
    expect(result?.output).toContain('class="cx-alert"')
  })

  it('BEM 豁免：:class="ns.b()" 视为标记类存在', async () => {
    const code = sfc(
      [
        '<script setup lang="ts">',
        "import { useCxBEM } from '@lionad/cx-vue'",
        "defineOptions({ name: 'CxAlert' })",
        "const ns = useCxBEM('alert')",
        '</script>',
      ].join('\n'),
      '<div :class="ns.b()">content</div>',
    )
    const result = await lint(alertPath, code)
    expect(cxHits(result, 'cx/require-component-name')).toHaveLength(0)
  })

  it('普通 script + defineComponent：name 插进 defineComponent 对象而非误插 defineOptions', async () => {
    const code = sfc(
      [
        '<script lang="ts">',
        "import { defineComponent } from 'vue'",
        '',
        'export default defineComponent({',
        '  setup() { return () => null },',
        '})',
        '</script>',
      ].join('\n'),
    )
    const result = await lint(alertPath, code, true)
    expect(result?.output).not.toContain('defineOptions')
    expect(result?.output).toContain("defineComponent({\n  name: 'CxAlert',")
  })

  it('普通 script 无可修对象：只报告不修复（defineOptions 是 setup 专属宏）', async () => {
    const code = sfc(
      ['<script lang="ts">', "import { h } from 'vue'", '', 'export const render = () => h("div")', '</script>'].join(
        '\n',
      ),
    )
    const result = await lint(alertPath, code, true)
    expect(cxHits(result, 'cx/require-component-name').length).toBeGreaterThan(0)
    expect(result?.output).not.toContain('defineOptions')
  })

  it('skipRootClassPackages：v4 薄包装缺根 class 不报', async () => {
    const code = sfc(
      ['<script setup lang="ts">', "defineOptions({ name: 'CxNuxtUIV4Accordion' })", '</script>'].join('\n'),
      '<UAccordion :items="items" />',
    )
    const result = await lint('packages/components-nuxt-ui-v4/src/accordion/index.vue', code)
    expect(cxHits(result, 'cx/require-component-name')).toHaveLength(0)
  })
})

describe('no-hardcoded-color', () => {
  const widgetPath = 'packages/components/src/widget/index.vue'

  it('hex/rgb 硬编码命中，suggestions 经 option 文案兜底', async () => {
    const hits = cxHits(
      await lintColor(widgetPath, sfc('', '<div style="color: #ff8400">x</div>')),
      'cx/no-hardcoded-color',
    )
    expect(hits).toHaveLength(1)
    expect(hits[0]?.message).toContain('#ff8400')
  })

  it('rgb(var(--x)) 变量通道包装豁免（区间重叠而非被包含）', async () => {
    const code = sfc('', '<div style="color: rgb(var(--color-primary-500))">x</div>')
    expect(cxHits(await lintColor(widgetPath, code), 'cx/no-hardcoded-color')).toHaveLength(0)
  })

  it('var(--x, #fff) 回退色豁免，独立硬编码仍报', async () => {
    const code = sfc(
      '',
      '<div style="color: var(--fg, #fff); background: #000; box-shadow: var(--s) 0 0 4px rgba(0,0,0,0.5)">x</div>',
    )
    const hits = cxHits(await lintColor(widgetPath, code), 'cx/no-hardcoded-color')
    const colors = hits.map((m) => m.message.match(/"([^"]+)"/)?.[1])
    expect(colors).toEqual(['#000', 'rgba(0,0,0,0.5)'])
  })

  it('白名单值不报', async () => {
    const code = sfc('', '<div style="color: transparent; fill: currentColor">x</div>')
    expect(cxHits(await lintColor(widgetPath, code), 'cx/no-hardcoded-color')).toHaveLength(0)
  })

  it('预设中颜色规则暂时关闭（等设计系统落地后恢复）', async () => {
    const code = sfc('', '<div style="color: #ff8400">x</div>')
    expect(cxHits(await lint(widgetPath, code), 'cx/no-hardcoded-color')).toHaveLength(0)
  })
})

describe('no-tracking-marker', () => {
  const helperPath = 'packages/components/src/widget/helpers.ts'

  it('阶段编号注释命中', async () => {
    const code = '// Phase 1: 初始化\nexport const a = 1\n'
    const hits = cxHits(await lint(helperPath, code), 'cx/no-tracking-marker')
    expect(hits).toHaveLength(1)
    expect(hits[0]?.message).toContain('Phase 1')
  })

  it('eslint 指令注释豁免（否则抑制本规则的注释会自我举报）', async () => {
    const code = '// eslint-disable-next-line cx/no-tracking-marker\n// Phase 1: 初始化\nexport const a = 1\n'
    expect(cxHits(await lint(helperPath, code), 'cx/no-tracking-marker')).toHaveLength(0)
  })

  it('只扫注释：字符串与代码中的编号形态不报', async () => {
    const code = 'export const label = "Phase 1 完成"\nexport const step = 1\n'
    expect(cxHits(await lint(helperPath, code), 'cx/no-tracking-marker')).toHaveLength(0)
  })

  it('内部系统路由代号命中（Route Z 类无法溯源的线上路由编号）', async () => {
    const code = '// 源自线上聊天场景的渲染管线（Route Z）\nexport const a = 1\n'
    const hits = cxHits(await lint(helperPath, code), 'cx/no-tracking-marker')
    expect(hits).toHaveLength(1)
    expect(hits[0]?.message).toContain('Route Z')
    // 小写 route 是普通技术词，不报
    const lower = '// 对比 route A 与 route B 的匹配优先级\nexport const a = 1\n'
    expect(cxHits(await lint(helperPath, lower), 'cx/no-tracking-marker')).toHaveLength(0)
  })
})
