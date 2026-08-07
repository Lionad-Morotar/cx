/**
 * @lionad/cx-stream — 流式结构化渲染管线
 *
 * 从 LLM 流式输出的不完整 JSON 中增量提取可渲染的组件树。
 * 双向解耦：不绑定 LLM Provider（只消费"不断生长的字符串"），
 * 不绑定组件库（组件知识经 trigger registry 外置注入）。
 *
 * - core/  纯 TS 管线（零框架依赖）
 * - vue/   Vue 3 composables 绑定层
 * - cx.ts  cx 协议预设（检测配置 / 文本提取配置 / 协议匹配器）
 */

// --- core：纯 TS 管线 ---
export * from './core/types'
export * from './core/bracket-scanner'
export * from './core/stream-events'
export * from './core/parse'
export * from './core/fence'
export * from './core/spec-detector'
export * from './core/incremental'
export * from './core/human-text'

// --- vue：composables 绑定层 ---
export * from './vue/useStreamChunks'
export * from './vue/useIncrementalTree'
export * from './vue/usePendingTypewriter'
export * from './vue/useCxPendingExit'

// --- cx 协议预设 ---
export * from './cx'
export * from './cx-array-trigger'
export * from './cx-trigger-config'
export * from './cx-tree-trigger'
