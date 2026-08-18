import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * charts-theme 主题桥契约测试。
 *
 * 桥（.cx-charts 作用域）把宿主 accent 色板映射为 TanStack 消费的 --ts-chart-N，
 * 并为 shadcn 系 spec 提供 --chart-N 兼容别名——两类变量都必须 1..8 全量在场：
 * 缺一个，对应系列在 genui 渲染链路的 var(--chart-N, var(--ts-chart-N)) 双 fallback
 * 同时落空 → fill 属性失效（黑色/透明），即"颜色丢失"症状。文本级断言防拼写漂移与漏项。
 *
 * 注意：不走 vite ?raw（css 管线吞查询后缀返回空串）；vitest 管线下 import.meta.url
 * 非 file scheme，文件定位经 import.meta.dirname（Node 20.11+，vitest 转译后仍可用）。
 */
const themeCss = readFileSync(
  join(import.meta.dirname, '../src/charts/charts-theme.css'),
  'utf8',
)

describe('charts-theme 主题桥契约', () => {
  it('.cx-charts 作用域内 --ts-chart-1..8 全量映射宿主 accent 色板', () => {
    for (let n = 1; n <= 8; n += 1) {
      expect(themeCss).toMatch(new RegExp(`--ts-chart-${n}: var\\(--color-accent-[a-z-]+\\)`))
    }
  })

  it('--chart-1..8 shadcn 兼容别名全量指向对应 --ts-chart-N（shadcn 系 spec 变量名）', () => {
    for (let n = 1; n <= 8; n += 1) {
      expect(themeCss).toMatch(new RegExp(`--chart-${n}: var\\(--ts-chart-${n}\\)`))
    }
  })
})
