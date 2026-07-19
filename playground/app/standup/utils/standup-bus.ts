/**
 * 站会域事件总线：跨组件实例传递与事件联动的唯一通道
 *
 * 为何自建 mitt 而非复用 CxLoader.hooks：新包 loader 的 hooks 是 readonly 的
 * 生命周期总线（cmpt:async-cmpt:loaded 等固定事件），业务事件混入会污染语义。
 *
 * 事件清单：
 * - pass:instance:CxUserSelectRef —— user-select 挂载后传出组件实例
 * - pass:instance:CxViewIssuesTable —— issues 表格挂载后传出组件实例
 * - highlight-issue-by-gitlab-id —— todo 文本 #数字 tag 点击联动 issue 卡片闪烁
 */
import mitt from 'mitt'

type StandupBusEvents = {
  'pass:instance:CxUserSelectRef': unknown
  'pass:instance:CxViewIssuesTable': unknown
  'highlight-issue-by-gitlab-id': string | number
}

export const standupBus = mitt<StandupBusEvents>()
