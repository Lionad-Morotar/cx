#!/usr/bin/env node
/**
 * 生成 playground 站会模块的 mock 种子数据（mocks/data/*.json）
 *
 * Why 同日幂等：全部随机源来自 mulberry32(seed)，seed 由运行当日 YYYYMMDD 推导，
 * 同一天两次运行产物 diff 为空；跨天运行则以新锚日期重排会议与议题时间轴。
 * Why 工作日判断：前端列表页用 chinese-workday 推算周会的"每周最后工作日"，
 * 生成器必须使用同一库，否则周会日期与前端填空逻辑错位。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import dayjs from 'dayjs'
import { isWorkday } from 'chinese-workday'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'mocks', 'data')

/* **************************************************************** 确定性随机 */

const anchor = dayjs().startOf('day')
// Why >>> 0：YYYYMMDD 小于 2^31，位移后仍为稳定正整数 seed
const seed = Number(anchor.format('YYYYMMDD')) >>> 0

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rng = mulberry32(seed)
const pick = (arr) => arr[Math.floor(rng() * arr.length)]
const pickN = (arr, n) => {
  const copy = [...arr]
  const out = []
  while (out.length < n && copy.length) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0])
  }
  return out
}
const int = (min, max) => min + Math.floor(rng() * (max - min + 1))
/** 概率命中 */
const hit = (p) => rng() < p

const fmt = (d) => dayjs(d).format('YYYY-MM-DD HH:mm:ss')
const fmtDay = (d) => dayjs(d).format('YYYY-MM-DD')

/* **************************************************************** 虚构词库 */

const USER_POOL = [
  ['沈亦舟', 'shenyz'],
  ['顾清让', 'guqr'],
  ['苏漫宁', 'sumn'],
  ['陆星辞', 'luxc'],
  ['周砚礼', 'zhouyl'],
  ['吴攸宁', 'wuyn'],
  ['郑晚棠', 'zhengwt'],
  ['温叙白', 'wenxb'],
  ['姜屹川', 'jiangyc'],
  ['方觉夏', 'fangjx'],
  ['秦昭野', 'qinzy'],
  ['许南乔', 'xunq'],
  ['何知许', 'hezx'],
  ['吕思衡', 'lvsh'],
  ['袁满枝', 'yuanmz'],
  ['纪云舒', 'jiys'],
  ['穆清和', 'muqh'],
  ['祁照临', 'qizl'],
  ['聂九思', 'niejs'],
  ['尹墨白', 'yinmb'],
  ['季安然', 'jar'],
  ['贺兰舒', 'hels'],
  ['欧阳光', 'ouyg'],
  ['司马歆', 'smx'],
]

const MODULES = [
  '用户中心',
  '权限管理',
  '消息通知',
  '数据看板',
  '工作流引擎',
  '文件服务',
  '搜索服务',
  '审计日志',
  '报表中心',
  '任务调度',
  '通知网关',
  '配置中心',
  '接口网关',
  '缓存管理',
  '表单设计器',
  '评论组件',
  '收藏夹',
  '版本管理',
]
const FEAT_ACTIONS = [
  '新增批量导入',
  '支持自定义视图',
  '接入消息推送',
  '增加导出功能',
  '支持多级筛选',
  '新增回收站',
  '支持拖拽排序',
  '增加操作审计',
  '接入统一登录',
  '支持灰度发布',
]
const FIX_PROBLEMS = [
  '列表分页错位',
  '详情页数据不刷新',
  '导出内容乱码',
  '缓存穿透导致抖动',
  '并发下重复提交',
  '越权访问漏拦截',
  '低版本浏览器样式错乱',
  '空数据时白屏',
]
const REFACTOR_PLANS = ['组合式 API', '领域模型分层', '事件驱动架构', '模块化单体拆分']
const PERF_TARGETS = ['首屏加载耗时', '列表查询响应时间', '大数据量渲染内存占用', '接口聚合层吞吐']
const DOC_TARGETS = ['接口文档', '部署手册', '二次开发指南', '常见问题手册']

/* **************************************************************** 用户 */

// 五角色划分（pm/de/fe/be/te）+ 4 名项目外用户
const ROLE_RANGES = {
  pm: [0, 3],
  de: [3, 7],
  fe: [7, 12],
  be: [12, 17],
  te: [17, 20],
}
const roleUsers = {}
for (const [role, [from, to]] of Object.entries(ROLE_RANGES)) {
  roleUsers[role] = USER_POOL.slice(from, to).map((_, i) => 1001 + from + i)
}

const users = USER_POOL.map(([name, username], i) => {
  const id = String(1001 + i)
  return {
    id,
    name,
    username,
    avatarUrl: `/api/avatar/${username}`,
    created: fmt(anchor.subtract(400 - i * 7, 'day')),
    email: `${username}@mail.example.com`,
    state: 'active',
    webUrl: `https://git.example.com/${username}`,
  }
})
const userById = new Map(users.map((u) => [u.id, u]))

/* **************************************************************** 仓库 */

const GITLAB_PROJECTS = [
  // issueGroup.code 决定仓库归属哪条业务线，前端按它过滤角色议题；
  // pm-hub/frontend-hub/backend-hub 三个枢纽仓是"团队管理员"视角按 URL 片段聚合的依据
  { id: '1101', name: 'pm-hub', code: 'requirement', groupName: '需求' },
  { id: '1102', name: 'orbit-requirements', code: 'requirement', groupName: '需求' },
  { id: '1103', name: 'pulsar-requirements', code: 'requirement', groupName: '需求' },
  { id: '1104', name: 'aurora-design', code: 'design', groupName: '设计' },
  { id: '1105', name: 'comet-design', code: 'design', groupName: '设计' },
  { id: '1106', name: 'zenith-design', code: 'design', groupName: '设计' },
  { id: '1107', name: 'frontend-hub', code: 'development', groupName: '开发' },
  { id: '1108', name: 'quasar-frontend', code: 'development', groupName: '开发' },
  { id: '1109', name: 'backend-hub', code: 'development', groupName: '开发' },
  { id: '1110', name: 'meteor-gateway', code: 'development', groupName: '开发' },
  { id: '1111', name: 'eclipse-console', code: 'development', groupName: '开发' },
  { id: '1112', name: 'lyra-mobile', code: 'development', groupName: '开发' },
]
const gitlabProjects = GITLAB_PROJECTS.map((p, i) => ({
  id: p.id,
  name: p.name,
  webUrl: `https://git.example.com/nebula/${p.name}`,
  issueGroup: { code: p.code, name: p.groupName },
  lastUpdated: fmt(anchor.subtract(30 - i, 'day')),
  lastUpdatedBy: pick(USER_POOL)[1],
}))
const gpById = new Map(gitlabProjects.map((p) => [p.id, p]))

/* **************************************************************** 项目（五角色逗号分隔 ID 串） */

const joinIds = (ids) => ids.join(',')
const project = {
  _meta:
    '本文件由 scripts/generate-mocks.mjs 生成，勿手改；重新生成：pnpm gen:mocks（以运行当日为锚，同日幂等）',
  id: '9001',
  name: '星云集控平台',
  code: 'nebula-cloud',
  groupAddress: 'https://git.example.com/nebula',
  created: fmt(anchor.subtract(500, 'day')),
  createdBy: 'shenyz',
  lastUpdated: fmt(anchor.subtract(3, 'day')),
  lastUpdatedBy: 'shenyz',
  projectType: 'developProjects',
  version: 1,
  pmProject: joinIds(['1101', '1102']),
  pmUsers: joinIds(roleUsers.pm),
  deProject: joinIds(['1104', '1105', '1106']),
  deUsers: joinIds(roleUsers.de),
  feProject: joinIds(['1107', '1108', '1111']),
  feUsers: joinIds(roleUsers.fe),
  beProject: joinIds(['1109', '1110']),
  beUsers: joinIds(roleUsers.be),
  teProject: joinIds(['1112']),
  teUsers: joinIds(roleUsers.te),
}
const projectUserIds = [
  ...roleUsers.pm,
  ...roleUsers.de,
  ...roleUsers.fe,
  ...roleUsers.be,
  ...roleUsers.te,
].map(String)

/* **************************************************************** 标签 */

// 19 个 stage 标签：id/name/stepValue/activeStep 与前端 StageLabels 常量逐一对齐
// （id 1~19 顺序整数），否则阶段进度、耗时统计与状态机消化会整体漂移
const STAGE_LABEL_DEFS = [
  [1, 'accepted', 0, 0],
  [2, 'planed', 0, 1],
  [3, 'func-designing', 1, 1],
  [4, 'func-designed', 1, 2],
  [5, 'ui-designing', 2, 2],
  [6, 'ui-designed', 2, 3],
  [7, 'wip', 3, 3],
  [8, 'in-review', 3, 3],
  [9, 'review-np', 3, 3],
  [10, 'solved', 3, 4],
  [11, 'testing', 4, 4],
  [12, 'np', 3, 3],
  [13, 'passed', 4, 5],
  [14, 'ui-checking', 5, 5],
  [15, 'ui-np', 3, 3],
  [16, 'ui-passed', 5, 6],
  [17, 'pm-checking', 6, 6],
  [18, 'pm-np', 3, 3],
  [19, 'pm-passed', 6, 6],
]
const STAGE_DESCS = {
  accepted: '已受理',
  planed: '已排期',
  'func-designing': '功能设计中',
  'func-designed': '功能设计完成',
  'ui-designing': '界面设计中',
  'ui-designed': '界面设计完成',
  wip: '开发中',
  'in-review': '代码评审中',
  'review-np': '评审未通过',
  solved: '已解决',
  testing: '测试中',
  np: '测试未通过',
  passed: '测试通过',
  'ui-checking': '界面验收中',
  'ui-np': '界面验收未通过',
  'ui-passed': '界面验收通过',
  'pm-checking': '产品验收中',
  'pm-np': '产品验收未通过',
  'pm-passed': '产品验收通过',
}
const STAGE_COLORS = [
  '#8c8c8c',
  '#595959',
  '#13c2c2',
  '#08979c',
  '#2f54eb',
  '#10239e',
  '#fa8c16',
  '#d48806',
  '#cf1322',
  '#389e0d',
  '#722ed1',
  '#f5222d',
  '#237804',
  '#eb2f96',
  '#c41d7f',
  '#531dab',
  '#0958d9',
  '#a8071a',
  '#003eb3',
]
const stageLabels = STAGE_LABEL_DEFS.map(([id, short, stepValue, activeStep], i) => ({
  id: String(id),
  name: `stage: ${short}`,
  description: STAGE_DESCS[short],
  color: STAGE_COLORS[i],
  stepValue,
  activeStep,
  openIssuesCount: 0,
  openMergeRequestsCount: 0,
}))

const NORMAL_LABEL_DEFS = [
  ['100', 'feat', '新功能', '#52c41a'],
  ['101', 'fix', '缺陷修复', '#f5222d'],
  ['102', 'docs', '文档', '#8c8c8c'],
  ['103', 'refactor', '重构', '#faad14'],
  ['104', 'perf', '性能优化', '#722ed1'],
  ['105', 'chore', '杂项', '#bfbfbf'],
  ['106', 'qa-unable', '无法测试', '#fa541c'],
  ['107', 'subtask', '子任务', '#1677ff'],
  ['108', 'state: invalid', '无效议题', '#000000'],
  ['109', 'duplicate', '重复议题', '#8c8c8c'],
  ['110', 'help-wanted', '需要协助', '#13c2c2'],
  ['111', 'priority-high', '高优先级', '#cf1322'],
]
const normalLabels = NORMAL_LABEL_DEFS.map(([id, name, description, color]) => ({
  id,
  name,
  description,
  color,
  openIssuesCount: 0,
  openMergeRequestsCount: 0,
}))
const labels = [...stageLabels, ...normalLabels]
const stageLabelByShort = new Map(STAGE_LABEL_DEFS.map(([id, short]) => [short, String(id)]))

/* **************************************************************** 议题事件链（xstate 可消化） */

// 与前端 issue-stage 状态机逐行对齐的转移表；生成事件时逐步校验，确保每条事件流
// 都能从 wait 状态被消化到目标阶段，而不是被状态机静默忽略
const TRANSITIONS = {
  wait: {
    planed: 'wait',
    accepted: 'wait',
    'func-designing': 'func_design',
    'func-designed': 'wait',
    'ui-designing': 'ui_design',
    'ui-designed': 'wait',
    wip: 'development',
    solve: 'wait',
    'in-review': 'review',
    testing: 'test',
    passed: 'wait',
    'ui-checking': 'ui_check',
    'ui-checked': 'wait',
    'pm-checking': 'pm_check',
    'pm-checked': 'end',
    solved: 'wait',
  },
  func_design: { 'func-designed': 'wait', 'ui-designing': 'ui_design', wip: 'development' },
  ui_design: { 'ui-designed': 'wait', wip: 'development' },
  development: {
    solved: 'wait',
    'in-review': 'review',
    testing: 'test',
    'ui-checking': 'ui_check',
    'pm-checking': 'pm_check',
  },
  review: { np: 'wait', testing: 'test', 'ui-checking': 'ui_check', 'pm-checking': 'pm_check' },
  test: { np: 'wait', passed: 'wait', 'ui-checking': 'ui_check', 'pm-checking': 'pm_check' },
  ui_check: { 'ui-np': 'wait', 'ui-passed': 'wait', 'pm-checking': 'pm_check' },
  pm_check: { 'pm-np': 'wait', 'pm-passed': 'end' },
  end: {},
}

/** 目标阶段 → 全前缀事件链（均为合法转移） */
const CHAIN_PREFIX = [
  'accepted',
  'planed',
  'func-designing',
  'func-designed',
  'ui-designing',
  'ui-designed',
  'wip',
]
// Why solved 前不接 in-review：状态机 review 状态没有 +solved 转移，
// 评审通过在数据上表现为 wip → solved 直接流转；评审不通过经 NP 循环注入表达
const CHAIN_DEV_DONE = [...CHAIN_PREFIX, 'solved']
const CHAIN_TEST_DONE = [...CHAIN_DEV_DONE, 'testing', 'passed']
const CHAIN_UI_DONE = [...CHAIN_TEST_DONE, 'ui-checking', 'ui-passed']
const STAGE_CHAINS = {
  planed: ['accepted', 'planed'],
  'func-designing': ['accepted', 'planed', 'func-designing'],
  'func-designed': ['accepted', 'planed', 'func-designing', 'func-designed'],
  'ui-designing': ['accepted', 'planed', 'func-designing', 'func-designed', 'ui-designing'],
  'ui-designed': [
    'accepted',
    'planed',
    'func-designing',
    'func-designed',
    'ui-designing',
    'ui-designed',
  ],
  wip: CHAIN_PREFIX,
  'in-review': [...CHAIN_PREFIX, 'in-review'],
  solved: CHAIN_DEV_DONE,
  testing: [...CHAIN_DEV_DONE, 'testing'],
  np: [...CHAIN_DEV_DONE, 'testing', 'np'],
  passed: CHAIN_TEST_DONE,
  'ui-checking': [...CHAIN_TEST_DONE, 'ui-checking'],
  'ui-np': [...CHAIN_TEST_DONE, 'ui-checking', 'ui-np'],
  'ui-passed': CHAIN_UI_DONE,
  'pm-checking': [...CHAIN_UI_DONE, 'pm-checking'],
  'pm-np': [...CHAIN_UI_DONE, 'pm-checking', 'pm-np'],
  'pm-passed': [...CHAIN_UI_DONE, 'pm-checking', 'pm-passed'],
}

// NP 循环注入：不改变最终阶段，只增加耗时与重测计数
const NP_LOOPS = [
  // [替换链中锚点标签, 替换片段, 概率]
  ['wip', ['in-review', 'np', 'wip'], 0.3],
  ['testing', ['testing', 'np', 'testing'], 0.3],
  ['ui-checking', ['ui-checking', 'ui-np', 'ui-checking'], 0.2],
  ['pm-checking', ['pm-checking', 'pm-np', 'pm-checking'], 0.2],
]

/** 阶段时间戳字段名（与前端 Issue 契约的 18 个 *At 字段对应） */
const STAGE_TS_FIELD = {
  accepted: 'acceptedAt',
  planed: 'planedAt',
  'func-designing': 'funcDesigningAt',
  'func-designed': 'funcDesignedAt',
  'ui-designing': 'uiDesigningAt',
  'ui-designed': 'uiDesignedAt',
  wip: 'wipAt',
  'in-review': 'inReviewAt',
  solved: 'solvedAt',
  testing: 'testingAt',
  passed: 'passedAt',
  'ui-checking': 'uiCheckingAt',
  'ui-passed': 'uiPassedAt',
  'pm-checking': 'pmCheckingAt',
  'pm-passed': 'pmPassedAt',
  np: 'npAt',
  'ui-np': 'uiNpAt',
  'pm-np': 'pmNpAt',
}
// ing 类标签在进入下一事件时伴随 remove（真实 gitlab 标签流转语义）
const ING_LABELS = new Set([
  'func-designing',
  'ui-designing',
  'wip',
  'in-review',
  'testing',
  'ui-checking',
  'pm-checking',
])

// 目标阶段权重（合计 100）
const STAGE_WEIGHTS = [
  ['planed', 12],
  ['func-designing', 6],
  ['func-designed', 4],
  ['ui-designing', 5],
  ['ui-designed', 4],
  ['wip', 16],
  ['in-review', 7],
  ['solved', 4],
  ['testing', 10],
  ['np', 3],
  ['passed', 3],
  ['ui-checking', 5],
  ['ui-np', 2],
  ['ui-passed', 2],
  ['pm-checking', 4],
  ['pm-np', 1],
  ['pm-passed', 12],
]
function pickStage() {
  let roll = rng() * 100
  for (const [stage, w] of STAGE_WEIGHTS) {
    roll -= w
    if (roll < 0) return stage
  }
  return 'wip'
}

/** 操作人分配：受理/排期归 pm，开发归负责人，测试归 tester，验收归对应角色 */
function operatorOf(short, assigneeUser, testerUser, pmUser, deUser) {
  if (['accepted', 'planed', 'pm-checking', 'pm-passed', 'pm-np'].includes(short))
    return pmUser.username
  if (['ui-designing', 'ui-designed', 'ui-checking', 'ui-passed', 'ui-np'].includes(short))
    return deUser.username
  if (['testing', 'passed', 'np'].includes(short)) return testerUser.username
  return assigneeUser.username
}

function titleOf(issueType) {
  const mod = pick(MODULES)
  if (issueType === 'feat') return `「${mod}」${pick(FEAT_ACTIONS)}`
  if (issueType === 'fix') return `修复「${mod}」${pick(FIX_PROBLEMS)}`
  if (issueType === 'refactor') return `重构「${mod}」为${pick(REFACTOR_PLANS)}`
  if (issueType === 'perf') return `优化「${mod}」${pick(PERF_TARGETS)}`
  return `补充「${mod}」${pick(DOC_TARGETS)}`
}

/* **************************************************************** 生成议题 */

const ISSUE_COUNT = 120
const issueLinePools = {
  requirement: { repos: ['1101', '1102'], assignees: roleUsers.pm },
  design: { repos: ['1104', '1105', '1106'], assignees: roleUsers.de },
  development: {
    repos: ['1107', '1108', '1111', '1109', '1110', '1112'],
    assignees: [...roleUsers.fe, ...roleUsers.be],
  },
}
const ISSUE_TYPE_WEIGHTS = [
  ['feat', 55],
  ['fix', 30],
  ['refactor', 8],
  ['perf', 4],
  ['docs', 3],
]
function pickIssueType() {
  let roll = rng() * 100
  for (const [t, w] of ISSUE_TYPE_WEIGHTS) {
    roll -= w
    if (roll < 0) return t
  }
  return 'feat'
}

const issues = []
for (let i = 0; i < ISSUE_COUNT; i++) {
  const id = String(70001 + i)
  const gitlabIssueID = String(1001 + i)
  const targetStage = pickStage()
  const issueType = pickIssueType()
  // 业务线：开发为主，设计与需求为辅
  const lineRoll = rng()
  const issueLine = lineRoll < 0.65 ? 'development' : lineRoll < 0.85 ? 'design' : 'requirement'
  const pool = issueLinePools[issueLine]
  const repoId = pick(pool.repos)
  const repo = gpById.get(repoId)
  const assigneeId = String(pick(pool.assignees))
  const assignee = userById.get(assigneeId)
  const tester = userById.get(String(pick(roleUsers.te)))
  const pmUser = userById.get(String(pick(roleUsers.pm)))
  const deUser = userById.get(String(pick(roleUsers.de)))
  const participantIds = [
    ...new Set([
      assigneeId,
      ...pickN(
        pool.assignees.filter((x) => String(x) !== assigneeId),
        int(0, 3),
      ).map(String),
    ]),
  ]
  const participantUserNames = participantIds.map((x) => userById.get(x).username)

  // 事件链 + NP 循环注入
  let chain = [...STAGE_CHAINS[targetStage]]
  for (const [after, fragment, p] of NP_LOOPS) {
    const idx = chain.lastIndexOf(after)
    if (idx !== -1 && hit(p)) {
      chain = [...chain.slice(0, idx), ...fragment, ...chain.slice(idx + 1)]
    }
  }

  // 时间轴：创建时间回推 10~90 天，事件间隔 4~48 小时
  let cursor = anchor.subtract(int(10, 90), 'day').add(int(8, 19), 'hour')
  const createdAt = fmt(cursor)
  const tsFields = Object.fromEntries(Object.values(STAGE_TS_FIELD).map((f) => [f, null]))
  const eventList = []
  let npCount = 0
  let prevShort = null
  let machineState = 'wait'
  for (const short of chain) {
    cursor = cursor.add(int(4, 48), 'hour').add(int(0, 59), 'minute')
    // 不变式校验：事件必须被状态机接受，否则说明转移表与前端漂移，直接抛错终止生成
    const next = TRANSITIONS[machineState]?.[short]
    if (!next) throw new Error(`非法事件链：${machineState} + ${short}（议题 ${id}）`)
    machineState = next
    if (prevShort && ING_LABELS.has(prevShort)) {
      eventList.push({
        action: 'remove',
        label: stageLabelByShort.get(prevShort),
        user: operatorOf(prevShort, assignee, tester, pmUser, deUser),
        resourceType: 'ISSUE',
        createdAt: fmt(cursor.subtract(1, 'minute')),
      })
    }
    eventList.push({
      action: 'add',
      label: stageLabelByShort.get(short),
      user: operatorOf(short, assignee, tester, pmUser, deUser),
      resourceType: 'ISSUE',
      createdAt: fmt(cursor),
    })
    const field = STAGE_TS_FIELD[short]
    // inReviewAt 取首次进入评审的时间；np 类取最后一次（重测耗时按末次算）
    if (field === 'inReviewAt') tsFields[field] = tsFields[field] || fmt(cursor)
    else tsFields[field] = fmt(cursor)
    if (['np', 'review-np'].includes(short)) npCount++
    prevShort = short
  }

  // labels：当前阶段标签 + 类型标签 + 少量副标签（qa-unable/subtask/state: invalid）
  const currentStageLabelId = stageLabelByShort.get(chain[chain.length - 1])
  const typeLabelId = { feat: '100', fix: '101', refactor: '103', perf: '104', docs: '102' }[
    issueType
  ]
  const extraLabels = []
  if (hit(0.04)) extraLabels.push('106')
  if (hit(0.05)) extraLabels.push('107')
  if (hit(0.03)) extraLabels.push('108')
  const labelIds = [currentStageLabelId, typeLabelId, ...extraLabels]

  const webUrl = `${repo.webUrl}/-/issues/${gitlabIssueID}`
  const title = titleOf(issueType)
  const closed = targetStage === 'pm-passed'
  issues.push({
    id,
    state: closed ? 'closed' : 'opened',
    name: title,
    title,
    assignee: assignee.username,
    assigneeUserName: assignee.username,
    participants: participantUserNames.join(','),
    participantUserNames,
    createdAt,
    created: createdAt,
    updated: fmt(cursor),
    description: null,
    expectedSubmitTestAt: null,
    gitlabProject: repoId,
    gitlabProjectId: repoId,
    gitlabUrl: webUrl,
    webUrl,
    gitlabIssueID,
    issueGroup: repo.issueGroup.name,
    issueLine,
    relatedUsers: null,
    tester: tester.username,
    issueType: typeLabelId,
    issueStage: currentStageLabelId,
    labels: labelIds.join(','),
    labelIds,
    retestTimes: npCount,
    testBeginAt: tsFields.testingAt,
    testFinishAt: tsFields.passedAt,
    testingCount: npCount,
    testState: '',
    uiCheckingCount: 0,
    pmCheckingCount: 0,
    dueDate: hit(0.3) ? fmtDay(anchor.add(int(-5, 10), 'day')) : null,
    eventList,
    ...tsFields,
    syncTime: `${fmtDay(anchor)} 08:00:00`,
  })
}

// 回填标签 openIssuesCount
for (const label of labels) {
  label.openIssuesCount = issues.filter(
    (x) => x.state === 'opened' && x.labelIds.includes(label.id),
  ).length
}

/* **************************************************************** 会议 */

/** 从某日向前找最近工作日（含当日） */
function lastWorkdayOnOrBefore(d) {
  let cur = dayjs(d)
  while (!isWorkday(cur.toDate())) cur = cur.subtract(1, 'day')
  return cur
}

const standups = []
let standupSeq = 8001
const standupHost = userById.get(String(roleUsers.pm[0]))

function makeStandup({ type, date, startClock, endClock, state, participantCount }) {
  const participantIds = pickN(projectUserIds, participantCount)
  const id = String(standupSeq++)
  return {
    id,
    // Why type 字段：原始契约没有它，但 mock 需要按会议类型过滤，作为附加字段透出
    type,
    name: fmtDay(date),
    created: fmt(dayjs(date).subtract(1, 'day').hour(18)),
    createdBy: standupHost.username,
    meetingDate: fmtDay(date),
    startTime: startClock,
    endTime: endClock,
    state,
    // Why JSON 字符串：前端 detail 消费方对 participants 做 JSON.parse，契约必须保真
    participants: JSON.stringify(participantIds),
    lastUpdated: fmt(dayjs(date).hour(18)),
    lastUpdatedBy: standupHost.username,
  }
}

// 日会：最近 42 个工作日，最近一场进行中
{
  const days = []
  let cur = lastWorkdayOnOrBefore(anchor)
  while (days.length < 42) {
    if (isWorkday(cur.toDate())) days.unshift(dayjs(cur))
    cur = cur.subtract(1, 'day')
  }
  days.forEach((d, i) => {
    const isLatest = i === days.length - 1
    standups.push(
      makeStandup({
        type: 'day',
        date: d,
        startClock: '09:30:00',
        endClock: isLatest ? '' : `09:${int(42, 58)}:00`,
        state: isLatest ? 'IN_PROGRESS' : 'ENDED',
        participantCount: int(7, 9),
      }),
    )
  })
}

// 周会：最近 13 个已过去的"每周最后工作日"，最近一场进行中
{
  const weekEnds = []
  let cur = dayjs(anchor)
  while (weekEnds.length < 13) {
    // 本周最后工作日：从当周周末向前找到的第一个工作日
    const weekEnd = dayjs(cur).startOf('week').add(6, 'day')
    let last = lastWorkdayOnOrBefore(weekEnd)
    // 本周最后工作日尚未到来（如周一~周四视角）时整周跳过，不产生未来日期的会议
    if (!last.isAfter(anchor, 'day')) {
      weekEnds.unshift(last)
    }
    cur = dayjs(cur).subtract(7, 'day')
  }
  weekEnds.forEach((d, i) => {
    const isLatest = i === weekEnds.length - 1
    standups.push(
      makeStandup({
        type: 'week',
        date: d,
        startClock: '16:00:00',
        endClock: isLatest ? '' : `17:0${int(0, 9)}:00`,
        state: isLatest ? 'IN_PROGRESS' : 'ENDED',
        participantCount: int(9, 12),
      }),
    )
  })
}

/* **************************************************************** 站会备忘 */

const MEMO_TEMPLATES = [
  (m, ref) => `昨天完成了${m}的联调，今天继续跟进 #${ref}`,
  (m, ref) => `昨天主要处理${m}的缺陷，今天提交测试 #${ref}`,
  (m) => `今天计划开始${m}的开发`,
  (m) => `今天继续推进${m}，预计明天提测`,
  (m) => `问题：${m}依赖的接口还没准备好，需要协调`,
  (m, ref) => `问题：测试环境数据缺失，已找测试同学跟进 #${ref}`,
  (m) => `问题：${m}需求有变更，等产品确认`,
  (m) => `昨天参加了${m}的评审会，今天按评审意见修改`,
  (m) => `昨天梳理了${m}的技术方案，今天输出文档`,
  (m, ref) => `今天收尾${m}的验收问题，关联 #${ref}`,
]
const issuesByAssignee = new Map()
for (const issue of issues) {
  if (!issuesByAssignee.has(issue.assignee)) issuesByAssignee.set(issue.assignee, [])
  issuesByAssignee.get(issue.assignee).push(issue)
}

const memos = []
let memoSeq = 600001
let memoContentSeq = 7000001
for (const standup of standups) {
  const participantIds = JSON.parse(standup.participants)
  for (const uid of participantIds) {
    const user = userById.get(String(uid))
    const own = issuesByAssignee.get(user.username) || issues
    const refIssue = own[Math.floor(rng() * own.length)]
    const contentCount = int(1, 3)
    const contents = Array.from({ length: contentCount }, () => {
      const template = pick(MEMO_TEMPLATES)
      return {
        id: String(memoContentSeq++),
        content: template(pick(MODULES), refIssue.gitlabIssueID),
      }
    })
    memos.push({
      id: String(memoSeq++),
      assignee: String(uid),
      meetingId: standup.id,
      // Why problem 为 JSON 字符串：后端把备忘行序列化存在单个文本字段，
      // 前端 memo/get 拿到后 JSON.parse(problem) 还原 contents，契约必须同形态
      problem: JSON.stringify(contents),
    })
  }
}

/* **************************************************************** 写出 */

mkdirSync(OUT_DIR, { recursive: true })
const write = (name, data) => {
  writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify(data, null, 2) + '\n', 'utf-8')
  const size = Array.isArray(data) ? `${data.length} 条` : '1 个对象'
  console.log(`[gen:mocks] ${name}.json ← ${size}`)
}

write('users', users)
write('project', project)
write('gitlab-projects', gitlabProjects)
write('labels', labels)
write('issues', issues)
write('standups', standups)
write('memos', memos)
write('sync-time', {
  _meta: project._meta,
  syncTime: `${fmtDay(anchor)}T08:00:00+08:00`,
})
console.log('[gen:mocks] 完成，锚日期', fmtDay(anchor))
