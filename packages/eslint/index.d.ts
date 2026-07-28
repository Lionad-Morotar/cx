import type { Linter } from 'eslint'

export interface CreateConfigOptions {
  /** 追加的项目级忽略（产物目录、vendor 源码等） */
  ignores?: string[]
}

/** 组装 flat config：js/ts/vue 规则层 + 格式规则关闭收尾 */
export declare function createConfig(options?: CreateConfigOptions): Linter.Config[]

/** cx 自研规则插件：no-hardcoded-color / no-tracking-marker / require-component-name */
export declare const cxPlugin: {
  meta: { name: string; version: string }
  rules: Record<string, Linter.RuleModule>
}

/** cx monorepo 开箱即用预设（扫描范围收敛为六个核心包，黑名单见 index.js） */
declare const cxConfig: Linter.Config[]
export default cxConfig
