/**
 * 阴性探针：translate 层拒绝非法 spec 的证据链（对齐官方 AI-EVALUATION 思想——
 * 「能编译 ≠ 会拒绝非法输入」，本文件锁「会拒绝」一侧）。
 *
 * 三层结构：
 * 1. 已校验路径：非法形态必抛错且消息锚定（防校验被后续重构静默移除）
 * 2. 缺口探针：行为待实证的边界，红即暴露缺陷（转修复）或证实容错（转第 3 层）
 * 3. 刻意容错：契约明确选择的宽容形态，锁「不抛错」防过度校验化
 *
 * 全部用例只到 translateChartSpec 层（拒绝发生在翻译期，无需渲染）。
 */
import { describe, expect, it } from 'vitest'

import { translateChartSpec } from '../src/shared/translate'
import type { CxChartSpec } from '../src/shared/translate/types'

const rows = [
  { x: 1, y: 2 },
  { x: 2, y: 4 },
]

describe('已校验路径：非法形态必抛错（消息锚定）', () => {
  it('未知 mark type', () => {
    expect(() =>
      translateChartSpec({
        // @ts-expect-error 运行时防御
        marks: [{ type: 'no-such-mark', data: rows, x: 'x', y: 'y' }],
      }),
    ).toThrow(/未知 mark type/)
  })

  it('channel 类型非法（布尔值）', () => {
    expect(() =>
      translateChartSpec({
        // @ts-expect-error 运行时防御
        marks: [{ type: 'dot', data: rows, x: true, y: 'y' }],
      }),
    ).toThrow(/channel "x" 只支持字段名字符串/)
  })

  it('弹性 channel 类型非法（对象）', () => {
    expect(() =>
      translateChartSpec({
        // @ts-expect-error 运行时防御
        marks: [{ type: 'dot', data: rows, x: 'x', y: 'y', r: { value: 3 } }],
      }),
    ).toThrow(/channel "r" 只支持字段名或数值/)
  })

  it('未知 layout kind', () => {
    expect(() =>
      translateChartSpec({
        marks: [
          // @ts-expect-error 运行时防御
          { type: 'barY', data: rows, x: 'x', y: 'y', layout: { kind: 'cascade' } },
        ],
      }),
    ).toThrow(/未知 layout kind/)
  })

  it('未知 scale kind', () => {
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'dot', data: rows, x: 'x', y: 'y' }],
        // @ts-expect-error 运行时防御
        x: { scale: { kind: 'logarithmic' } },
      }),
    ).toThrow(/未知 scale kind/)
  })

  it('未知 reduce 枚举', () => {
    expect(() =>
      translateChartSpec({
        transforms: [
          {
            name: 't',
            kind: 'binX',
            data: 'rows',
            value: 'x',
            // @ts-expect-error 运行时防御
            outputs: { n: { reduce: 'median_absolute_deviation' } },
          },
        ],
        marks: [{ type: 'dot', data: 't', x: 'x', y: 'n' }],
      }),
    ).toThrow(/未知 reduce/)
  })

  it('未知 transform kind', () => {
    expect(() =>
      translateChartSpec({
        // @ts-expect-error 运行时防御
        transforms: [{ name: 't', kind: 'pivotWider', data: 'rows' }],
        marks: [{ type: 'dot', data: 't', x: 'x', y: 'y' }],
      }),
    ).toThrow(/未知 transform kind/)
  })

  it('sankey 缺必填字段', () => {
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'sankey', data: rows, nodeKey: 'x' }],
      }),
    ).toThrow(/sankey 必须声明/)
  })

  it('facet 缺 by 分组字段', () => {
    expect(() =>
      translateChartSpec({
        marks: [
          { type: 'facet', data: rows, chart: { marks: [{ type: 'dot', x: 'x', y: 'y' }] } },
        ],
      }),
    ).toThrow(/facet 必须声明 by/)
  })

  it('facet 缺 chart 子 spec 模板', () => {
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'facet', data: rows, by: 'x' }],
      }),
    ).toThrow(/facet 必须声明 chart/)
  })

  it('未知 curve 枚举', () => {
    expect(() =>
      translateChartSpec({
        // @ts-expect-error 运行时防御
        marks: [{ type: 'lineY', data: rows, x: 'x', y: 'y', curve: 'wobbly' }],
      }),
    ).toThrow(/未知 curve 枚举/)
  })

  it('未知 polar radial mark type', () => {
    expect(() =>
      translateChartSpec({
        marks: [
          {
            type: 'polar',
            // @ts-expect-error 运行时防御
            marks: [{ type: 'radialSpiral', data: rows, angle: 'x', radius: 'y' }],
          },
        ],
      }),
    ).toThrow(/未知 radial mark type/)
  })

  it('未知 geoShape 投影名称', () => {
    expect(() =>
      translateChartSpec({
        marks: [
          // @ts-expect-error 运行时防御
          { type: 'geoShape', data: rows, projection: 'flatEarther' },
        ],
      }),
    ).toThrow(/未知投影/)
  })
})

describe('缺口探针：边界行为实证', () => {
  it('marks 非数组：裸 TypeError 拒绝（非 CX 消息但仍是显式拒绝）', () => {
    expect(() =>
      // @ts-expect-error 运行时防御
      translateChartSpec({ marks: { type: 'dot' } }),
    ).toThrow()
  })

  it('linear scale domain 注入字符串：库层显式拒绝（非缺口）', () => {
    // 实证结论：库构建期即抛 TypeError「requires exactly two finite numbers」，
    // d3 静默 NaN 的担忧不成立——domain 类型错配有库层兜底，CX 无需重复校验。
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'dot', data: rows, x: 'x', y: 'y' }],
        // @ts-expect-error 类型层 domain 收数值对，运行时防御由库兜底
        x: { scale: { kind: 'linear', domain: ['a', 'b'] } },
      }),
    ).toThrow(/requires exactly two finite numbers/)
  })

  it('band scale domain 注入数值：d3 内部转 key，静默接受', () => {
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'barY', data: rows, x: 'x', y: 'y' }],
        // @ts-expect-error 类型层 point domain 收字符串数组，实证 d3 运行时行为
        x: { scale: { kind: 'point', domain: [1, 2, 3] } },
      }),
    ).not.toThrow()
  })
})

describe('刻意容错：契约选择的宽容（锁不抛错，防过度校验化）', () => {
  it('mark data 引用不存在的数据集 → 回退空数组（流式中间态与笔误运行时不可区分）', () => {
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'dot', data: 'no-such-dataset', x: 'x', y: 'y' }],
      }),
    ).not.toThrow()
  })

  it('domain 倒置 [100, 0] → d3 反向轴为合法语义', () => {
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'dot', data: rows, x: 'x', y: 'y' }],
        y: { scale: { kind: 'linear', domain: [100, 0] } },
      }),
    ).not.toThrow()
  })

  it('tooltip 显式 false → 关闭逃生（库层 undefined 即关闭的对照）', () => {
    const definition = translateChartSpec({
      marks: [{ type: 'dot', data: rows, x: 'x', y: 'y' }],
      tooltip: false,
    })
    expect(definition.tooltip).toBe(false)
  })

  it('spec 多余字段静默忽略（平铺契约：按名读取，多余键无害）', () => {
    expect(() =>
      translateChartSpec({
        marks: [{ type: 'dot', data: rows, x: 'x', y: 'y', nonExistentProp: 1 } as never],
        totallyMadeUpTopLevel: true,
      } as CxChartSpec),
    ).not.toThrow()
  })
})
