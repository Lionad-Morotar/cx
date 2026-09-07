import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * core 层自包含守护
 *
 * core/ 是 `./core/*` 子路径导出的独立构建产物（服务端宿主只消费纯管线，
 * 不连带框架绑定层）：一旦 core 源码相对上级导入（如 fallback 上探 cx.ts
 * 协议预设）或引入框架依赖，子路径消费面即被上层/框架连坐。静态 import
 * 图断言比构建产物断言轻量，且在源码位置直接拦截。
 */

// vitest 可能自仓根或包目录启动，且 happy-dom 环境下 import.meta.url 非 file
// 协议，故按双 cwd 候选解析
const CORE_DIR = [
  join(process.cwd(), 'packages/stream/src/core'),
  join(process.cwd(), 'src/core'),
].find((d) => existsSync(d))!

describe('core 层自包含守护', () => {
  it('core/*.ts 禁止相对上级导入', () => {
    const offenders = readdirSync(CORE_DIR)
      .filter((f) => f.endsWith('.ts'))
      .filter((f) => /(?:from|import\()\s*['"]\.\.\//.test(readFileSync(join(CORE_DIR, f), 'utf8')))
    expect(offenders).toEqual([])
  })

  it('core/*.ts 禁止框架依赖（vue）', () => {
    const offenders = readdirSync(CORE_DIR)
      .filter((f) => f.endsWith('.ts'))
      .filter((f) => /(?:from|import\()\s*['"](?:vue|@vue\/)[^'"]*['"]/.test(readFileSync(join(CORE_DIR, f), 'utf8')))
    expect(offenders).toEqual([])
  })
})