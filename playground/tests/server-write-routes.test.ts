import { beforeEach, describe, expect, it } from 'vitest'
import { getCollection, setCollection } from '../server/utils/mock-store'
import standupStart from '../server/api/standup/start.post'
import standupEnd from '../server/api/standup/end.post'
import standupParticipants from '../server/api/standup/participants.post'
import memoCreate from '../server/api/standup/memo/create.post'
import memoGet from '../server/api/standup/memo/get.post'
import memoUpdate from '../server/api/standup/memo/update.post'
import issuesTitle from '../server/api/issues/title.post'

// h3 handler 期望的形态：method 顶层；readRawBody 读 _requestBody；readBody 校验 node.req.headers
function mockEvent(body: unknown) {
  return {
    method: 'POST',
    _requestBody: Buffer.from(JSON.stringify(body ?? {})),
    node: {
      req: { headers: { 'content-type': 'application/json' } },
    },
    context: {},
  } as never
}

const seedStandups = [
  {
    id: '9001',
    type: 'day',
    name: '2026-07-18',
    meetingDate: '2026-07-18',
    state: 'ENDED',
    participants: '["1001"]',
  },
]
const seedMemos: unknown[] = []
const seedIssues = [{ id: 'i1', name: '旧标题', title: '旧标题' }]

beforeEach(() => {
  setCollection('standups', structuredClone(seedStandups))
  setCollection('memos', structuredClone(seedMemos))
  setCollection('issues', structuredClone(seedIssues))
})

describe('standup/start', () => {
  it('已有 IN_PROGRESS 会议时复用而非新建', async () => {
    const first = (await standupStart(mockEvent({ type: 'day' }))) as { data: { id: string } }
    const second = (await standupStart(mockEvent({ type: 'day' }))) as { data: { id: string } }
    expect(second.data.id).toBe(first.data.id)
    const standups = getCollection('standups') as { state: string }[]
    expect(standups.filter((x) => x.state === 'IN_PROGRESS').length).toBe(1)
  })
})

describe('standup/end', () => {
  it('结束进行中的会议并回填 endTime', async () => {
    await standupStart(mockEvent({ type: 'day' }))
    await standupEnd(mockEvent({ type: 'day' }))
    const standups = getCollection('standups') as { state: string; endTime: string }[]
    const target = standups.find((x) => x.state === 'ENDED' && x.endTime)
    expect(target).toBeTruthy()
    expect(standups.some((x) => x.state === 'IN_PROGRESS')).toBe(false)
  })
})

describe('standup/participants', () => {
  it('更新参会人并保持 JSON 字符串契约', async () => {
    await standupParticipants(mockEvent({ id: '9001', participants: ['1001', '1002'] }))
    const standups = getCollection('standups') as { id: string; participants: string }[]
    const target = standups.find((x) => x.id === '9001')!
    expect(typeof target.participants).toBe('string')
    expect(JSON.parse(target.participants)).toEqual(['1001', '1002'])
  })
})

describe('memo 链路', () => {
  it('create 幂等：同 assignee+meetingId 复用已有记录', async () => {
    const first = (await memoCreate(
      mockEvent({ assignee: '1001', meetingId: '9001', contents: [] }),
    )) as { data: { id: string } }
    const second = (await memoCreate(
      mockEvent({ assignee: '1001', meetingId: '9001', contents: [] }),
    )) as { data: { id: string } }
    expect(second.data.id).toBe(first.data.id)
    expect((getCollection('memos') as unknown[]).length).toBe(1)
  })

  it('get 不存在时返回非法 problem（前端 catch 后自动 create 的契约）', async () => {
    const res = (await memoGet(mockEvent({ assignee: 'nobody', meetingId: '9001' }))) as {
      data: { problem: string }
    }
    expect(() => JSON.parse(res.data.problem)).toThrow()
  })

  it('create → get → update 全链路往返', async () => {
    await memoCreate(
      mockEvent({ assignee: '1001', meetingId: '9001', contents: [{ content: '昨天做了什么' }] }),
    )
    const got = (await memoGet(mockEvent({ assignee: '1001', meetingId: '9001' }))) as {
      data: { id: string; problem: string }
    }
    const contents = JSON.parse(got.data.problem)
    expect(contents[0].content).toBe('昨天做了什么')

    await memoUpdate(
      mockEvent({
        id: got.data.id,
        assignee: '1001',
        meetingId: '9001',
        contents: [{ id: contents[0].id, content: '改后的内容' }],
      }),
    )
    const got2 = (await memoGet(mockEvent({ assignee: '1001', meetingId: '9001' }))) as {
      data: { problem: string }
    }
    expect(JSON.parse(got2.data.problem)[0].content).toBe('改后的内容')
  })
})

describe('issues/title', () => {
  it('行内改标题同步 name 与 title 双字段', async () => {
    await issuesTitle(mockEvent({ id: 'i1', title: '新标题' }))
    const issues = getCollection('issues') as { id: string; name: string; title: string }[]
    const target = issues.find((x) => x.id === 'i1')!
    expect(target.name).toBe('新标题')
    expect(target.title).toBe('新标题')
  })
})
