#!/usr/bin/env node
/**
 * 把 vendored Coze SSE 录制（app/dev/mocks/*.json）转译为 cx 协议的流式剧本数据模块
 *
 * 流程：拼接 conversation.message.delta 的 content → 转译 root/elements 方言 →
 * 重组剧本 → 按原 delta 边界（比例映射）切片 → 产物 app/dev/stream-mock.generated.ts
 *
 * Why 产物入库：mock 要求可复现，生成结果随素材一起提交，重跑仅在素材更新或
 * 校验转译规则变更时。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { transpileStream } from './stream-mock-transpile.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MOCKS_DIR = join(__dirname, '..', 'app', 'dev', 'mocks')
const OUT_FILE = join(__dirname, '..', 'app', 'dev', 'stream-mock.generated.ts')

const SCENARIOS = [
  { name: 'composite', file: 'vtu-composite.json' },
  { name: 'doubleCmpts', file: 'vtu-double-cmpts.json' },
]

/** SSE data 字段可能是字符串化 JSON，也可能是已解析对象 */
function parseEventData(event) {
  if (typeof event.data !== 'string') return event.data
  try {
    return JSON.parse(event.data)
  } catch {
    return null
  }
}

/** 拼接全部 delta content，并收集每个 delta 结束位置的累积偏移（末尾除外） */
function loadScenario(file) {
  const events = JSON.parse(readFileSync(join(MOCKS_DIR, file), 'utf8'))
  const parts = []
  const boundaries = []
  let offset = 0
  for (const event of events) {
    if (event.event !== 'conversation.message.delta') continue
    const data = parseEventData(event)
    if (typeof data?.content !== 'string' || data.content.length === 0) continue
    parts.push(data.content)
    offset += data.content.length
    boundaries.push(offset)
  }
  boundaries.pop()
  return { content: parts.join(''), boundaries }
}

const banner = `// 本文件由 \`pnpm gen:stream-mock\` 生成，勿手改。
// 素材：app/dev/mocks/ 下的 Coze SSE 录制；转译规则见 scripts/stream-mock-transpile.ts。
`

const sections = SCENARIOS.map(({ name, file }) => {
  const { content, boundaries } = loadScenario(file)
  const { chunks, componentKeys, fenceCount, fenceEndOffsets } = transpileStream(
    content,
    boundaries,
  )
  const chunkLines = chunks.map((c) => `  ${JSON.stringify(c)},`).join('\n')
  return [
    `/** ${file}：${fenceCount} 个组件围栏，${chunks.length} 个 chunk（原 delta 边界比例映射） */`,
    `export const ${name}Chunks: string[] = [\n${chunkLines}\n]`,
    '',
    `export const ${name}Meta = {`,
    `  source: '${file}',`,
    `  fenceCount: ${fenceCount},`,
    `  componentKeys: ${JSON.stringify(componentKeys)},`,
    `  /** 各围栏闭合标记在剧本中的结束偏移；把剧本裁到前 N 个围栏时取 [N-1] */`,
    `  fenceEndOffsets: ${JSON.stringify(fenceEndOffsets)},`,
    `  chunkCount: ${chunks.length},`,
    `} as const`,
  ].join('\n')
})

writeFileSync(OUT_FILE, banner + '\n' + sections.join('\n\n') + '\n')

console.log(`generated ${OUT_FILE}`)
for (const { name, file } of SCENARIOS) {
  const { content, boundaries } = loadScenario(file)
  console.log(
    `  - ${name} <- ${file}（${boundaries.length + 1} deltas, ${Buffer.byteLength(content)} bytes）`,
  )
}
