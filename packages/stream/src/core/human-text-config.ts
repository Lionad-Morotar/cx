/**
 * cx 预设的人类文本提取配置
 *
 * 以 `"key":` 标记识别 cx Spec 流。实现住在 core 而非上层 cx.ts：fallback
 * 的缺省配置必须运行时可用，core 层自包含纪律禁止相对上级导入（`./core/*`
 * 子路径导出是服务端宿主的独立消费面）；cx.ts 从此处同源再导出，对外 API
 * 不变。宿主可经 humanText 注入自有预设覆盖。
 */

import type { HumanTextConfig } from './human-text'

export const cxHumanTextConfig: HumanTextConfig = {
  looksLikeStructured: (text) => /["']key["']\s*:/.test(text),
}