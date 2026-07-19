/**
 * Mock 数据存储：种子 JSON 加载 + 内存态写层
 *
 * Why 模块级单例：nitro dev 热重载（server 文件变动）会重建模块，写操作随之内存态丢失、
 * 回退种子数据——这是演示环境的预期行为，见 mocks/README.md。
 * Why 路径回退链：nitro dev 的 cwd 是 playground 根；vitest 从 monorepo 根跑时 cwd 不在
 * playground，故以 import.meta.url 相对位置兜底。
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const cache = new Map<string, unknown>()

function resolveDataFile(name: string): string {
  // nitro dev 的 cwd 是 playground 根；vitest 从 monorepo 根跑时 cwd 含 playground 子目录
  const candidates = [
    join(process.cwd(), 'mocks', 'data', `${name}.json`),
    join(process.cwd(), 'playground', 'mocks', 'data', `${name}.json`),
  ]
  for (const file of candidates) {
    try {
      readFileSync(file)
      return file
    } catch {
      continue
    }
  }
  // server/utils → ../../mocks/data（nitro 构建后 cwd 漂移的兜底）
  return fileURLToPath(new URL(`../../mocks/data/${name}.json`, import.meta.url))
}

export function getCollection<T = unknown>(name: string): T {
  if (!cache.has(name)) {
    cache.set(name, JSON.parse(readFileSync(resolveDataFile(name), 'utf-8')))
  }
  return cache.get(name) as T
}

export function setCollection(name: string, rows: unknown): void {
  cache.set(name, rows)
}

/** 统一响应包络：业务码 "0" 表示成功，前端拦截器只对非 "0" 弹错 */
export function ok<T>(data: T) {
  return { code: '0', message: 'ok', success: true, data }
}

export function fail(message: string) {
  return { code: '1', message, success: false, data: null }
}
