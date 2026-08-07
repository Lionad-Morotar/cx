import { computed, ref } from 'vue'
import { createSharedComposable } from '@vueuse/core'

/**
 * useCxAppends — CX 表单类物料的上下文暂存单例(createSharedComposable)
 *
 * 多步表单(preferences-panel/question-flow 等)的字段变更不直接发消息,而是
 * 暂存为 appends 条目,由宿主输入区标签卡片可视化;confirm 时拼接发送。
 * 跨组件共享(卡片写入 / 标签条渲染 / 发送后清空),包内直接以共享单例导出——
 * 宿主 import 即用,无需自行包裹;@vueuse/core 为 peer,单例身份随宿主实例唯一。
 */

export interface CxAppendItem {
  /** 全局唯一,建议 `<widgetId>:<fieldId>` */
  id: string
  /** 标签卡片显示文本 */
  label: string
  /** 回写进消息的文本(confirm 连发时拼接) */
  text: string
  /** 标签卡片图标(lucide 名) */
  icon?: string
  /** 来源卡片 id(卡片前缀物料 id) */
  widgetId?: string
  /** 字段级标识(分字段物料精确清理) */
  fieldId?: string
}

interface DeselectSignal {
  widgetId: string
  fieldId?: string
  timestamp: number
}

export const useCxAppends = createSharedComposable(() => {
  const entries = ref<Map<string, CxAppendItem>>(new Map())
  const deselectSignal = ref<DeselectSignal | null>(null)

  const items = computed<CxAppendItem[]>(() => Array.from(entries.value.values()))
  const isEmpty = computed(() => entries.value.size === 0)

  /** id 已存在则覆盖(幂等更新,同字段反复变更只留最新) */
  function append(item: CxAppendItem): void {
    entries.value.set(item.id, item)
  }

  function emitDeselect(widgetId: string, fieldId?: string): void {
    deselectSignal.value = { widgetId, fieldId, timestamp: Date.now() }
  }

  /**
   * 按 id 移除;emitSignal=false 用于物料内部主动取消(此时物料态已清,
   * 无需再发信号回环)
   */
  function clear(id: string, emitSignal = true): void {
    const item = entries.value.get(id)
    entries.value.delete(id)
    if (emitSignal && item?.widgetId) {
      emitDeselect(item.widgetId, item.fieldId)
    }
  }

  /** 按 widgetId 清该卡片全部条目(confirm 连发后清理) */
  function clearByWidget(widgetId: string, emitSignal = true): void {
    let hadItems = false
    for (const [id, item] of entries.value) {
      if (item.widgetId === widgetId) {
        entries.value.delete(id)
        hadItems = true
      }
    }
    if (emitSignal && hadItems) {
      emitDeselect(widgetId)
    }
  }

  /** 清空全部(发送消息后/切换会话);deselect 信号经 cx 事件通道分发,此侧只清数据 */
  function clearAll(): void {
    entries.value.clear()
  }

  /** 测试与重置用:直接清空信号(业务路径不消费;信号以「新值」驱动 watch,残留不丢后继) */
  function resetDeselectSignal(): void {
    deselectSignal.value = null
  }

  return {
    items,
    isEmpty,
    append,
    clear,
    clearByWidget,
    clearAll,
    deselectSignal,
    resetDeselectSignal,
  }
})
