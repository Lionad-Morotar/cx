import type { StreamTriggerConfig } from '@lionad/cx-stream'

/**
 * standup 物料流式增量判定表：22 件逐件判定，全部不适用，注册数维持零。
 *
 * 判据沿用 comps / element-plus / naive-ui 三包判例（容器不适用、表单控件
 * 整族不适用），并叠加 standup 自身的数据边界：三份流式 schema 是静态骨架
 * （节点几乎无 data），动态内容经各物料 onMounted 从 store 请求——LLM 流式
 * 输出的主体在 standup 页面根本不经 schema data 传输，无流式形态可声明。
 *
 * 逐件归类（按族合并同判据者）：
 *
 * - 布局/区块容器 8 件（cx-page-main、cx-standup-list-layout、
 *   cx-standup-list-main、cx-daily-standard-dashboard-page-layout、
 *   cx-weekly-standup-dashboard-page-layout、cx-daily-main-content、
 *   cx-weekly-main-content、cx-folder-container）：EP space 判例「容器不
 *   适用」——增长的是槽内 components 树（槽承载外部内容插座位）而非物料
 *   自身 data；树级 trigger 对无 config 节点的 prune 语义已覆盖其增量行为。
 * - 数据驱动循环容器 2 件（cx-standup-group-list、cx-standup-card-list）：
 *   渲染数量由运行时 store 的 group/standups 长度驱动（card-tabs 模板槽
 *   模式），非 schema data 数组——数组增长型的 data 载体缺席。
 * - 表单/交互控件 6 件（cx-user-select、cx-select-participants-dialog、
 *   cx-daily-standup-filter、cx-standup-member-draggable、
 *   cx-daily-page-actions、cx-weekly-page-actions）：naive-ui 判例「表单
 *   控件整族不适用」——值来自用户输入与动作，非 LLM 输出。
 * - 运行时数据展示件 6 件（cx-standup-header-bar、cx-standup-group-header、
 *   cx-standup-card、cx-daily-standup-header-info、
 *   cx-weekly-user-info-and-time、cx-weekly-todo-card）：模板主体内容来自
 *   store / 上下文注入（useStandupType、useStandupDetail、StandupContextProvider
 *   注入的 standup），schema data 无主体字段——标量主体形态的声明载体缺席。
 *
 * 完备性校验：0 注册 + 22 不适用 = 22（schema 实际使用物料数），件数由
 * playground 判定测试双向锁定。
 *
 * 演进空间：若将来 standup 页面的内容改由 LLM 流式生成（schema data 承载
 * 长文/列表），按 convert-to-cx-materials 指南的形态判据逐件补声明即可，
 * 页面树级 trigger 已能按物料 key 命中树内 config。
 */
export const STANDUP_STREAM_TRIGGERS: StreamTriggerConfig[] = []
