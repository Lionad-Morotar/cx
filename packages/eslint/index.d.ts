import type { Linter } from 'eslint'

export interface CreateConfigOptions {
  /** 追加的项目级忽略（产物目录、vendor 源码等） */
  ignores?: string[]
}

/** 组装 flat config：js/ts/vue/vitest 规则层 + 格式规则关闭收尾 */
export declare function createConfig(options?: CreateConfigOptions): Linter.Config[]

/** cx monorepo 开箱即用预设（已含 vendored 源码忽略） */
declare const cxConfig: Linter.Config[]
export default cxConfig
