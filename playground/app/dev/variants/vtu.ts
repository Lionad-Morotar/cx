import type { VariantRegistry } from '../variants-utils'

// @lionad/cx-comps-vtu 物料手写 variants：vtu 工具组件数据形态差异大，
// 选 code-block（语言对照）/ stats-display（指标组对照）/ chart 等多形态样板。

export const vtuVariants: VariantRegistry = {
  'cx-vtu-code-block': [
    { label: 'TypeScript', data: { language: 'typescript', code: 'const n: number = 42\nconsole.log(n)', filename: 'num.ts' } },
    { label: 'Python', data: { language: 'python', code: 'def greet(name: str) -> str:\n    return f"Hello, {name}"', filename: 'greet.py' } },
    { label: 'JSON', data: { language: 'json', code: '{\n  "ok": true,\n  "count": 3\n}', filename: 'data.json' } },
  ],
  'cx-vtu-stats-display': [
    {
      label: '双指标',
      data: {
        title: '概览',
        stats: [
          { key: 'users', label: '用户', value: 1200, format: { kind: 'number' } },
          { key: 'sessions', label: '会话', value: 340, format: { kind: 'number' } },
        ],
      },
    },
    {
      label: '带环比',
      data: {
        title: '营收',
        stats: [
          {
            key: 'revenue',
            label: '营收',
            value: 12800,
            format: { kind: 'currency', currency: 'CNY' },
            diff: { value: 12.5 },
          },
        ],
      },
    },
  ],
  'cx-vtu-terminal': [
    { label: '安装成功', data: { command: 'pnpm install', exitCode: 0, stdout: 'added 42 packages in 2s', stderr: '' } },
    { label: '构建失败', data: { command: 'pnpm build', exitCode: 1, stdout: '', stderr: '✗ build failed: missing dep' } },
  ],
}
