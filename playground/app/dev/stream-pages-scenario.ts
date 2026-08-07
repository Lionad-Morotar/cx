import { NUXT_UI_V4_STREAM_TRIGGERS } from '@lionad/cx-comps-nuxt-ui-v4'
import { VTU_STREAM_TRIGGERS } from '@lionad/cx-comps-vtu'
import {
  buildPageScenario,
  compileTreeTrigger,
  createTriggerRegistry,
  type CxSpec,
  type PageScenario,
  type TriggerRegistry,
} from '@lionad/cx-stream'

import { dailyStandupDashboardSchema } from '~/standup/schemas/daily-standup-dashboard.schema'
import { standupListSchema } from '~/standup/schemas/standup-list.schema'
import { weeklyStandupDashboardSchema } from '~/standup/schemas/weekly-standup-dashboard.schema'

// /dev/stream/pages 验收页的剧本模块：页面级 schema（站会列表/日会/周会看板）
// 的剧本组装与增量注册表。精简转换与切片机制已上提 @lionad/cx-stream
// （cx-scenario），本模块只保留业务组装；抽成独立纯数据模块的理由同
// stream-scenario.ts：无头测试直接驱动，页面只挂回放。

/** 页面级验收的三个目标 schema：站会列表 / 日会看板 / 周会看板 */
export const PAGE_SCENARIOS: PageScenario[] = [
  buildPageScenario('standup-list', '站会列表', standupListSchema),
  buildPageScenario('daily-dashboard', '日会看板', dailyStandupDashboardSchema),
  buildPageScenario('weekly-dashboard', '周会看板', weeklyStandupDashboardSchema),
]

/**
 * 页面级增量注册表：树级 trigger 消费 vtu + nuxt-ui-v4 全量物料声明，
 * 注册到各页面剧本根 key。树内组件按自身 key 命中组件级语义
 * （array 逐行 / region 分区揭示 / scalar 骨架）；standup 物料无 trigger
 * 声明，对 standup 树退化为纯 prune——与纯修剪时代的页面级行为等价。
 * 嵌套演示剧本（stream-nested-scenario）根 key 与站会列表同为
 * cx-page-main，已被同一注册覆盖，消费侧无需分支。
 */
export function createPageTriggerRegistry(): TriggerRegistry<CxSpec> {
  const treeTrigger = compileTreeTrigger([...VTU_STREAM_TRIGGERS, ...NUXT_UI_V4_STREAM_TRIGGERS])
  const registry = createTriggerRegistry<CxSpec>()
  for (const s of PAGE_SCENARIOS) {
    registry.register(s.rootKey, treeTrigger)
  }
  return registry
}
