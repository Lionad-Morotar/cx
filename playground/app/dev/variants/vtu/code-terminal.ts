import type { VariantRegistry } from '../../variants-utils'

// Code & Terminal 分类 variants：code-block / code-diff / terminal。
// 三件均以代码字符串为长主体：属性全集对照覆盖语言、行号、高亮、
// 折叠（maxCollapsedLines）与 code-diff 双模式（patch / oldCode+newCode）。

export const codeTerminalVariants: VariantRegistry = {
  'cx-vtu-code-block': [
    { label: 'TypeScript', data: { language: 'typescript', code: 'const n: number = 42\nconsole.log(n)', filename: 'num.ts' } },
    { label: 'Python', data: { language: 'python', code: 'def greet(name: str) -> str:\n    return f"Hello, {name}"', filename: 'greet.py' } },
    { label: 'JSON', data: { language: 'json', code: '{\n  "ok": true,\n  "count": 3\n}', filename: 'data.json' } },
    {
      // 高亮行 + 行号隐藏对照
      label: '高亮行 · 隐藏行号',
      data: {
        language: 'typescript',
        code: 'import { ref } from \'vue\'\n\nconst count = ref(0)\nconst double = computed(() => count.value * 2)\n\nwatch(count, (n) => {\n  console.log(n)\n})',
        filename: 'counter.ts',
        highlightLines: [3, 4],
        lineNumbers: 'hidden',
      },
    },
    {
      // 长代码触发 maxCollapsedLines 折叠交互（展开/收起按钮）
      label: '长代码折叠',
      data: {
        language: 'bash',
        code: [
          'pnpm install',
          'pnpm --filter @lionad/cx-stream build',
          'pnpm --filter @lionad/cx-vue build',
          'pnpm --filter @lionad/cx-renderer build',
          'pnpm --filter @lionad/cx-comps build',
          'pnpm --filter @lionad/cx-comps-vtu build',
          'pnpm --filter @lionad/cx-nuxt build',
          'pnpm exec vp test packages/stream',
          'pnpm exec vp test packages/comps-vtu',
          'pnpm exec vp test playground/tests',
        ].join('\n'),
        filename: 'release.sh',
        maxCollapsedLines: 4,
      },
    },
  ],
  'cx-vtu-code-diff': [
    {
      // patch 模式： unified diff 字符串直接驱动（与 oldCode/newCode 互斥）
      label: 'patch · 统一视图',
      data: {
        language: 'typescript',
        filename: 'stream-trigger.ts',
        patch: '@@ -10,6 +10,7 @@\n const config: StreamTriggerConfig = {\n   key: def._cx_meta.key,\n-  frameStride: 5,\n+  frameStride: 10,\n+  // 短属性扎堆闭合按窗口合并出帧\n   sections: [\n     { kind: \'scalar\' },\n   ],',
        diffStyle: 'unified',
      },
    },
    {
      // oldCode/newCode 模式：分屏视图对照（行号默认 visible）
      label: '双代码 · 分屏视图',
      data: {
        language: 'typescript',
        filename: 'use-vtu-props.ts',
        oldCode: 'export function useVtuProps(attrs) {\n  return { ...attrs }\n}',
        newCode: 'export function useVtuProps(attrs, key) {\n  const rest = { ...attrs }\n  rest.id = rest.id || key\n  return rest\n}',
        diffStyle: 'split',
      },
    },
    {
      // 行号隐藏 + 折叠：长 diff 触发 maxCollapsedLines
      label: '隐藏行号 · 长差异折叠',
      data: {
        language: 'json',
        filename: 'package.json',
        oldCode: '{\n  "name": "a",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  }\n}',
        newCode: '{\n  "name": "a",\n  "version": "0.2.0",\n  "private": true,\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsdown",\n    "test": "vitest"\n  }\n}',
        lineNumbers: 'hidden',
        maxCollapsedLines: 5,
      },
    },
  ],
  'cx-vtu-terminal': [
    { label: '安装成功', data: { command: 'pnpm install', exitCode: 0, stdout: 'added 42 packages in 2s', stderr: '' } },
    { label: '构建失败', data: { command: 'pnpm build', exitCode: 1, stdout: '', stderr: '✗ build failed: missing dep' } },
    {
      // cwd + durationMs + truncated 三短属性铺满（成功长输出）
      label: '工作目录 · 耗时 · 截断标记',
      data: {
        command: 'pnpm exec vp test packages/comps-vtu',
        exitCode: 0,
        stdout: ' ✓ tests/article-streaming.test.ts (7)\n ✓ tests/scalar-long-content-triggers.test.ts (31)\n ✓ tests/scalar-short-field-triggers.test.ts (28)\n Test Files 4 passed (4)\n      Tests 103 passed (103)',
        cwd: '~/Github/Lionad-Morotar/cx',
        durationMs: 991,
        truncated: true,
      },
    },
    {
      // 长输出折叠：maxCollapsedLines 触发滚动区折叠交互
      label: '长输出折叠',
      data: {
        command: 'pnpm -r build',
        exitCode: 0,
        stdout: Array.from({ length: 12 }, (_, i) => `packages/pkg-${i + 1} build: Done in ${800 + i * 37}ms`).join('\n'),
        cwd: '~/Github/Lionad-Morotar/cx',
        durationMs: 4200,
        maxCollapsedLines: 5,
      },
    },
  ],
}
