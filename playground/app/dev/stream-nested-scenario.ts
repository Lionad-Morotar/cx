import { cxNode, type CxComponentRuntime } from '@lionad/cx-definition'
import { buildPageScenario, type PageScenario } from '@lionad/cx-stream'

// /dev/stream/pages 的嵌套演示剧本模块。standup 三个页面 schema 是静态骨架
// （节点几乎无 data），树内组件的 array 逐行 / region 分区揭示 / scalar 骨架
// 语义在其上不可观察；本模块用带 trigger 声明的 vtu / nuxt-ui-v4 物料与
// mock 数据手工组装嵌套树，作为树级 trigger（compileTreeTrigger）的验收载体。
// mock 数据的 item 形态与物料 initial 样本及 trigger 声明逐项对齐。

/**
 * 嵌套演示树：page-main（无 config，走 prune）下挂一只 card 与一只 plan。
 * card 的 header/default slot 分别承载 scalar（article 骨架）与 array
 * （data-table 逐行）物料，覆盖三种形态互嵌；footer slot 刻意缺席——
 * region 语义「未传输的 slot 不出现在输出」需要一个常驻的缺席样本。
 * plan 作为 card 的外层 sibling 验证「array 剔除不波及兄弟」。
 */
export const NESTED_TREE: CxComponentRuntime[] = [
  cxNode('nested-root', 'cx-page-main', {
    default: [
      cxNode('summary-card', 'cx-nuxt-ui-v4-card', {
        header: [
          cxNode(
            'summary-article',
            'cx-vtu-article',
            {},
            {
              type: 'md',
              // content 必须是真实长文规模：骨架标记窗口 = content 字段占剧本
              // 总长的比例，短文在前段就闭合，中途帧采样不到未闭合状态
              content:
                '## 本周摘要\n\n树级 trigger 让嵌套页面流按组件语义生长：表格逐行铺出、卡片分区揭示、文章骨架先行。\n\n### 已完成\n\n- 树级编译器：消费既有物料声明，深递归按节点 key 应用闭合适配语义\n- 契约校验：scalar 独占、单 array、stateBranch 组合与组件级对齐\n- 端到端断言：逐比例前缀出帧，行数单调、骨架中途有终态无\n\n### 下周计划\n\n- 页面集成：页面级验收页统一切换到树级注册表\n- 浏览器验收：嵌套剧本的可观察增量渲染\n\n长文场景下正文往往最后到达，骨架标记让卡片在正文传输期间就有可读占位，而不是整卡缺席等待。',
            },
          ),
        ],
        default: [
          cxNode(
            'member-table',
            'cx-vtu-data-table',
            {},
            {
              columns: [
                { key: 'name', label: '名称', sortable: true },
                { key: 'role', label: '角色' },
                { key: 'active', label: '启用', format: { kind: 'boolean' } },
              ],
              data: [
                { name: 'Alice', role: '管理员', active: true },
                { name: 'Bob', role: '成员', active: false },
                { name: 'Carol', role: '成员', active: true },
              ],
            },
          ),
        ],
      }),
      cxNode(
        'launch-plan',
        'cx-vtu-plan',
        {},
        {
          title: '上线计划',
          description: '三步完成嵌套树验收。',
          todos: [
            { id: 't1', label: '树级编译器', status: 'completed' },
            { id: 't2', label: '嵌套剧本', status: 'in_progress' },
            { id: 't3', label: '页面集成', status: 'pending' },
          ],
        },
      ),
    ],
  }),
]

/** 嵌套演示剧本（单本）：复用页面剧本管线，行边界切片逐字段生长 */
export const NESTED_SCENARIOS: PageScenario[] = [
  buildPageScenario('nested-tree', '嵌套树（组件级语义）', NESTED_TREE),
]

// 增量注册表由 stream-pages-scenario 的 createPageTriggerRegistry 统一提供：
// 树级 trigger 按 key 注册，本剧本根 key 与站会列表同为 cx-page-main 已被覆盖。
