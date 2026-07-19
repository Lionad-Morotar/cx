import { getCollection, ok } from '../../../utils/mock-store'

type Memo = { id: string; assignee: string; meetingId: string; problem: string }
type User = { id: string; username: string; name: string }

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const memos = getCollection('memos') as Memo[]
  const users = getCollection('users') as User[]
  const meetingId = String(body.meetingId || '')

  // Why 宽松匹配：种子按 user.id 存储，但调用方可能传 username，按 id 未命中时解析后再试
  let assigneeId = String(body.assignee || '')
  if (!memos.some((m) => m.meetingId === meetingId && m.assignee === assigneeId)) {
    const byName = users.find((u) => u.username === assigneeId || u.name === assigneeId)
    if (byName) assigneeId = byName.id
  }

  const memo = memos.find((m) => m.meetingId === meetingId && m.assignee === assigneeId)
  if (!memo) {
    // 保真旧行为：备忘不存在时返回非法 JSON 的 problem，前端 JSON.parse 抛错后
    // 自动走 create 再重试 get——server 端不代办创建，否则这条重试链路死掉
    return ok({ id: '', problem: 'undefined' })
  }
  return ok({ id: memo.id, problem: memo.problem })
})
