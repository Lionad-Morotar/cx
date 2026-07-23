import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { createIncrementalExtractor } from '../core/incremental'
import type { IncrementalExtractorConfig } from '../core/incremental'

/**
 * 增量渲染 composable：把 core 的增量提取器包装为响应式。
 *
 * @param sourceText - 流式原始文本（pending 代码块内容，可含围栏）
 * @param config     - 提取器配置（trigger 注册表 + 协议匹配器）
 * @returns partialSpec - 当前可渲染的部分 Spec（null = 暂无增量数据）
 */
export function useIncrementalTree<TSpec = unknown>(
  sourceText: ComputedRef<string>,
  config: IncrementalExtractorConfig<TSpec>,
) {
  const extractor = createIncrementalExtractor(config)

  // computed 有意依赖 extractor 内部 lastValid 缓存（对 Vue 不纯但对管线必要）：
  // 解析失败的 delta 保持上次有效结果，避免渲染组件闪没。
  const partialSpec = computed<TSpec | null>(() => extractor.next(sourceText.value))

  return { partialSpec, reset: extractor.reset }
}
