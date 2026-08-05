import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'

import { describe, expect, it } from 'vitest'

import * as Materials from '../app/standup/components'
import { STANDUP_STREAM_TRIGGERS } from '../app/standup/stream-triggers'
import { dailyStandupDashboardSchema } from '~/standup/schemas/daily-standup-dashboard.schema'
import { standupListSchema } from '~/standup/schemas/standup-list.schema'
import { weeklyStandupDashboardSchema } from '~/standup/schemas/weekly-standup-dashboard.schema'

import type { CxComponentRuntime } from '@lionad/cx-definition'

/**
 * standup 物料 meta 完备性：流式 schema 用到的物料集合，icon 与 slots 声明
 * 必须和 wrapper 模板的 slot 消费双向一致——声明无出口是死声明，消费无声明
 * 则编辑器物料面板无法向该槽填入子节点。
 *
 * 权威集合取三份流式 schema 实际使用的物料 key（而非 components 目录全量），
 * schema 演进时集合自动跟随；计数断言是完备性兜底，件数变化必须显式改数。
 */

// 装饰槽：物料自用的内容覆盖位，schema 不承载子节点，不参与双向 diff。
// -start/-end 是函数式 layout 每内容槽的首尾装饰对；icon 是 folder-container
// 自带预设图标的可覆盖位；preload 是 page-main 经 useSlots 编程消费的预加载槽。
const DECORATIVE_SLOT_NAMES = new Set(['icon', 'preload'])
const isDecorativeSlot = (name: string) =>
  DECORATIVE_SLOT_NAMES.has(name) || name.endsWith('-start') || name.endsWith('-end')

type MaterialEntry = {
  _cx_meta: { key: string; icon?: string; slots?: Record<string, unknown> }
}

const materialByKey = new Map<string, MaterialEntry>()
for (const v of Object.values(Materials)) {
  const m = v as MaterialEntry | undefined
  if (m?._cx_meta?.key) materialByKey.set(m._cx_meta.key, m)
}

// 递归收集 schema 树内全部物料 key；槽内子节点经 components 以槽名为键挂在节点上
function collectKeys(nodes: CxComponentRuntime[], into = new Set<string>()): Set<string> {
  for (const node of nodes) {
    if (node.key) into.add(node.key)
    const children = node.components as Record<string, CxComponentRuntime[]> | undefined
    for (const list of Object.values(children ?? {})) collectKeys(list, into)
  }
  return into
}

const schemaKeys = collectKeys([
  ...standupListSchema,
  ...dailyStandupDashboardSchema,
  ...weeklyStandupDashboardSchema,
])

// wrapper vue 路径：物料 index.ts 以 `import component from '<path>.vue'` 引入
const COMPONENTS_ROOT = join(__dirname, '..', 'app', 'standup', 'components')

function* walkIndexFiles(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walkIndexFiles(p)
    else if (name === 'index.ts') yield p
  }
}

function resolveWrapperVue(indexFile: string): string | null {
  const src = readFileSync(indexFile, 'utf8')
  const keyM = src.match(/key:\s*'(cx-[a-z0-9-]+)'/)
  const compM = src.match(/import\s+component\s+from\s+'([^']+\.vue)'/)
  if (!keyM || !compM || !schemaKeys.has(keyM[1])) return null
  return join(dirname(indexFile), compM[1])
}

// 模板 slot 消费三种形态：SFC 具名/裸 <slot>、函数式 layout 的 definedSlots 数组。
// useSlots 编程消费（如 preload）不在模板层，且均属装饰槽，不在 diff 范围。
function extractSlotsUsed(vueSrc: string): Set<string> {
  const names = new Set<string>()
  for (const m of vueSrc.matchAll(/<slot\b[^>]*>/g)) {
    const nameM = m[0].match(/\sname="([^"]+)"/)
    names.add(nameM ? nameM[1] : 'default')
  }
  const ds = vueSrc.match(/definedSlots\s*=\s*\[([\s\S]*?)\]/)
  if (ds) for (const m of ds[1].matchAll(/'([^']+)'/g)) names.add(m[1])
  return names
}

const slotsUsedByKey = new Map<string, Set<string>>()
for (const indexFile of walkIndexFiles(COMPONENTS_ROOT)) {
  const vuePath = resolveWrapperVue(indexFile)
  if (!vuePath) continue
  const key = readFileSync(indexFile, 'utf8').match(/key:\s*'(cx-[a-z0-9-]+)'/)![1]
  slotsUsedByKey.set(key, extractSlotsUsed(readFileSync(vuePath, 'utf8')))
}

describe('流式 schema 物料权威集合', () => {
  it('三份 schema 实际使用 22 件物料（完备性计数兜底）', () => {
    expect(schemaKeys.size).toBe(22)
  })

  it('22 件物料在 components 桶文件中均有导出', () => {
    for (const key of schemaKeys) {
      expect(materialByKey.has(key), `缺少物料导出: ${key}`).toBe(true)
    }
  })

  it('22 件物料的 wrapper 模板均被解析（vue 路径与 key 关联成功）', () => {
    for (const key of schemaKeys) {
      expect(slotsUsedByKey.has(key), `缺少 wrapper 模板: ${key}`).toBe(true)
    }
  })
})

describe('物料 meta icon 完备性', () => {
  it('22 件物料均声明非空 icon（编辑器物料面板元数据）', () => {
    for (const key of schemaKeys) {
      const icon = materialByKey.get(key)!._cx_meta.icon
      expect(typeof icon === 'string' && icon.length > 0, `${key} 缺 icon`).toBe(true)
    }
  })
})

describe('物料 meta slots 与模板消费双向一致', () => {
  it('meta 声明的槽在模板中均有出口（无死声明）', () => {
    for (const key of schemaKeys) {
      const declared = Object.keys(materialByKey.get(key)!._cx_meta.slots ?? {})
      const used = slotsUsedByKey.get(key)!
      for (const name of declared) {
        expect(used.has(name), `${key} 声明的槽 ${name} 无模板出口`).toBe(true)
      }
    }
  })

  it('模板消费的槽（装饰槽除外）均在 meta 声明中（可填入）', () => {
    for (const key of schemaKeys) {
      const declared = new Set(Object.keys(materialByKey.get(key)!._cx_meta.slots ?? {}))
      const used = slotsUsedByKey.get(key)!
      for (const name of used) {
        if (isDecorativeSlot(name)) continue
        expect(declared.has(name), `${key} 模板槽 ${name} 未在 meta 声明`).toBe(true)
      }
    }
  })
})

describe('流式判定表', () => {
  // 判定理由逐件见 stream-triggers.ts 头注释；此断言是完备性兜底，
  // schema 用集与注册数组任一侧变化都会在此暴露
  it('0 注册 + 22 不适用 = 22（schema 实际使用物料数）', () => {
    expect(STANDUP_STREAM_TRIGGERS).toEqual([])
    expect(STANDUP_STREAM_TRIGGERS.length + schemaKeys.size).toBe(22)
  })

  it('注册项必须指向 schema 用集内物料（防 key 错配静默不命中）', () => {
    for (const config of STANDUP_STREAM_TRIGGERS) {
      expect(schemaKeys.has(config.key)).toBe(true)
    }
  })
})
