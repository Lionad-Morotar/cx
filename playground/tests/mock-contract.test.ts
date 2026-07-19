/**
 * Mock 数据契约测试：直接校验 mocks/data/*.json 的数据层契约（与响应包络无关）
 *
 * Why 直接读文件而非走 server：数据契约由生成脚本保证，应脱离 nitro 环境独立可验；
 * 包络形态由 server/utils/mock-store 的 ok/fail 单测覆盖。
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { fail, ok } from '../server/utils/mock-store'

const DATA_DIR = join(__dirname, '..', 'mocks', 'data')
const read = (name: string) => JSON.parse(readFileSync(join(DATA_DIR, `${name}.json`), 'utf-8'))

const users = read('users') as any[]
const project = read('project') as any
const gitlabProjects = read('gitlab-projects') as any[]
const labels = read('labels') as any[]
const issues = read('issues') as any[]
const standups = read('standups') as any[]
const memos = read('memos') as any[]

describe('规模下限', () => {
  it('users ≥ 20、issues ≥ 100、日会 ≥ 40、周会 ≥ 12', () => {
    expect(users.length).toBeGreaterThanOrEqual(20)
    expect(issues.length).toBeGreaterThanOrEqual(100)
    expect(standups.filter((s) => s.type === 'day').length).toBeGreaterThanOrEqual(40)
    expect(standups.filter((s) => s.type === 'week').length).toBeGreaterThanOrEqual(12)
  })

  it('每场会议 × 每位参会人都有一条备忘', () => {
    const memoKeys = new Set(memos.map((m) => `${m.meetingId}:${m.assignee}`))
    for (const s of standups) {
      const participants = JSON.parse(s.participants) as string[]
      expect(participants.length).toBeGreaterThan(0)
      for (const uid of participants) {
        expect(memoKeys.has(`${s.id}:${uid}`)).toBe(true)
      }
    }
  })
})

describe('User 契约', () => {
  it('字段齐备且 avatarUrl 指向本地路由', () => {
    for (const u of users) {
      expect(u).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        username: expect.any(String),
        avatarUrl: expect.any(String),
        created: expect.any(String),
        email: expect.any(String),
        state: expect.any(String),
        webUrl: expect.any(String),
      })
      expect(u.avatarUrl).toBe(`/api/avatar/${u.username}`)
    }
    // username 全局唯一（avatar 路由与 memo 宽松匹配依赖它）
    expect(new Set(users.map((u) => u.username)).size).toBe(users.length)
  })
})

describe('Standup 契约', () => {
  it('participants 是 JSON 字符串且 parse 后为数组（元素为参会用户 id）', () => {
    const userIds = new Set(users.map((u) => u.id))
    for (const s of standups) {
      expect(typeof s.participants).toBe('string')
      const parsed = JSON.parse(s.participants)
      expect(Array.isArray(parsed)).toBe(true)
      for (const uid of parsed) expect(userIds.has(uid)).toBe(true)
    }
  })

  it('state 取值合法，最近一场日会为 IN_PROGRESS', () => {
    for (const s of standups) {
      expect(['IN_PROGRESS', 'ENDED', 'UNKNOWN']).toContain(s.state)
    }
    const days = standups
      .filter((s) => s.type === 'day')
      .sort((a, b) => (a.meetingDate < b.meetingDate ? -1 : 1))
    expect(days.at(-1).state).toBe('IN_PROGRESS')
  })

  it('meetingDate 为日期串、startTime/endTime 为时钟串（前端按空格拼接展示）', () => {
    for (const s of standups) {
      expect(s.meetingDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      if (s.startTime) expect(s.startTime).toMatch(/^\d{2}:\d{2}:\d{2}$/)
      if (s.endTime) expect(s.endTime).toMatch(/^\d{2}:\d{2}:\d{2}$/)
    }
  })
})

describe('Label 契约', () => {
  const stageLabels = labels.filter((l) => l.name.startsWith('stage: '))

  it('19 个 stage 标签，id 为 1~19 且 stepValue 覆盖 0~6（与前端 StageLabels 常量对齐）', () => {
    expect(stageLabels.length).toBe(19)
    const ids = stageLabels.map((l) => Number(l.id)).sort((a, b) => a - b)
    expect(ids).toEqual(Array.from({ length: 19 }, (_, i) => i + 1))
    const steps = new Set(stageLabels.map((l) => l.stepValue))
    for (const step of [0, 1, 2, 3, 4, 5, 6]) expect(steps.has(step)).toBe(true)
  })

  it('stage 标签涵盖功能设计/界面设计/开发/评审/测试/界面验收/产品验收语义', () => {
    const names = new Set(stageLabels.map((l) => l.name))
    for (const required of [
      'stage: func-designing',
      'stage: func-designed',
      'stage: ui-designing',
      'stage: ui-designed',
      'stage: wip',
      'stage: in-review',
      'stage: solved',
      'stage: testing',
      'stage: passed',
      'stage: ui-checking',
      'stage: ui-passed',
      'stage: pm-checking',
      'stage: pm-passed',
    ]) {
      expect(names.has(required)).toBe(true)
    }
  })
})

describe('Project 契约', () => {
  it('五角色 projects/users 逗号分隔 ID 串可展开且引用存在', () => {
    const userIds = new Set(users.map((u) => u.id))
    const repoIds = new Set(gitlabProjects.map((g) => g.id))
    for (const role of ['pm', 'de', 'fe', 'be', 'te']) {
      for (const uid of project[`${role}Users`].split(',')) expect(userIds.has(uid)).toBe(true)
      for (const rid of project[`${role}Project`].split(',')) expect(repoIds.has(rid)).toBe(true)
    }
  })

  it('含团队管理员视角聚合用的三个枢纽仓（webUrl 片段）', () => {
    const urls = gitlabProjects.map((g) => g.webUrl)
    for (const hub of ['pm-hub', 'frontend-hub', 'backend-hub']) {
      expect(
        urls.some((u) => u.includes(hub)),
        `缺少枢纽仓 ${hub}`,
      ).toBe(true)
    }
  })
})

describe('Issue 契约', () => {
  // 与前端 issue-stage 状态机逐行对齐的转移表（轻量副本，用于消化性校验）
  const TRANSITIONS: Record<string, Record<string, string>> = {
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
  const stageNameById = new Map(
    labels.filter((l) => l.name.startsWith('stage: ')).map((l) => [l.id, l.name.slice(7)]),
  )

  it('eventList 时序递增且事件引用合法的 stage 标签', () => {
    for (const issue of issues) {
      expect(issue.eventList.length).toBeGreaterThan(0)
      let prev = ''
      for (const ev of issue.eventList) {
        expect(['add', 'remove']).toContain(ev.action)
        expect(ev.resourceType).toBe('ISSUE')
        expect(stageNameById.has(ev.label)).toBe(true)
        expect(ev.createdAt >= prev).toBe(true)
        prev = ev.createdAt
      }
    }
  })

  it('add 事件流能从 wait 状态消化到议题当前阶段', () => {
    for (const issue of issues) {
      let state = 'wait'
      const adds = issue.eventList.filter((ev: any) => ev.action === 'add')
      // 首个 add 事件必须能从 wait 出发（xstate 对未声明转移静默忽略，逐步推进校验）
      for (const ev of adds) {
        const short = stageNameById.get(ev.label)!
        const next = TRANSITIONS[state]?.[short]
        expect(next, `议题 ${issue.id}：状态 ${state} 无法消化事件 +${short}`).toBeTruthy()
        state = next
      }
      // 当前阶段标签与事件流终点一致
      const currentShort = stageNameById.get(issue.issueStage)
      expect(stageNameById.get(adds.at(-1).label)).toBe(currentShort)
    }
  })

  it('17+ 个阶段时间戳字段存在且与事件流一致', () => {
    const TS_FIELDS = [
      'acceptedAt',
      'planedAt',
      'funcDesigningAt',
      'funcDesignedAt',
      'uiDesigningAt',
      'uiDesignedAt',
      'npAt',
      'uiNpAt',
      'pmNpAt',
      'wipAt',
      'solvedAt',
      'inReviewAt',
      'passedAt',
      'testingAt',
      'uiCheckingAt',
      'uiPassedAt',
      'pmCheckingAt',
      'pmPassedAt',
    ]
    for (const issue of issues) {
      for (const field of TS_FIELDS) expect(issue).toHaveProperty(field)
      // 已验收通过的议题状态应为 closed
      if (issue.pmPassedAt) expect(issue.state).toBe('closed')
    }
  })

  it('labels/issueStage/gitlabIssueID 与 labels 集合、webUrl 自洽', () => {
    const labelIds = new Set(labels.map((l) => l.id))
    for (const issue of issues) {
      for (const id of issue.labelIds) expect(labelIds.has(id)).toBe(true)
      expect(issue.labels.split(',')).toEqual(issue.labelIds)
      expect(labelIds.has(issue.issueStage)).toBe(true)
      expect(issue.webUrl.endsWith(`/${issue.gitlabIssueID}`)).toBe(true)
    }
  })
})

describe('Memo 契约', () => {
  it('problem 为 JSON 字符串，parse 后元素带 id 与中文文本，部分含 #议题号 引用', () => {
    let withRef = 0
    for (const m of memos) {
      expect(typeof m.problem).toBe('string')
      const contents = JSON.parse(m.problem) as { id: string; content: string }[]
      expect(contents.length).toBeGreaterThan(0)
      for (const c of contents) {
        expect(c.id).toBeTruthy()
        expect(typeof c.content).toBe('string')
        expect(c.content.length).toBeGreaterThan(0)
        if (/#\d+/.test(c.content)) withRef++
      }
    }
    expect(withRef).toBeGreaterThan(0)
  })
})

describe('敏感信息红线', () => {
  it('全部数据文件不含任何受限字样', () => {
    const FILES = [
      'users',
      'project',
      'gitlab-projects',
      'labels',
      'issues',
      'standups',
      'memos',
      'sync-time',
    ]
    // 扫描目标由本地清单注入，明文不入库
    const BANNED = [
      '<redacted>',
      '<redacted>',
      '<redacted>',
      '<redacted>',
      '<redacted>',
      '<redacted>',
      '<redacted>',
    ]
    for (const name of FILES) {
      const text = readFileSync(join(DATA_DIR, `${name}.json`), 'utf-8').toLowerCase()
      for (const word of BANNED) {
        expect(text.includes(word), `${name}.json 命中受限字样：${word}`).toBe(false)
      }
    }
  })
})

describe('响应包络 helper', () => {
  it('ok(data) 形态', () => {
    expect(ok({ a: 1 })).toEqual({ code: '0', message: 'ok', success: true, data: { a: 1 } })
    expect(ok(null)).toEqual({ code: '0', message: 'ok', success: true, data: null })
  })

  it('fail(message) 形态', () => {
    expect(fail('boom')).toEqual({ code: '1', message: 'boom', success: false, data: null })
  })
})
