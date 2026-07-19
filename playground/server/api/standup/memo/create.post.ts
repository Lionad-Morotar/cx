import { getCollection, ok } from '../../../utils/mock-store'

type MemoContent = { id: string; content: string; checked?: boolean; mention?: unknown[] }
type Memo = { id: string; assignee: string; meetingId: string; problem: string }

/** 解析全部 memo 的 problem 取最大行 id（problem 非法时按 0 兜底） */
const maxContentId = (memos: Memo[]) =>
  Math.max(
    7000000,
    ...memos.flatMap((m) => {
      try {
        return (JSON.parse(m.problem || '[]') as MemoContent[]).map((c) => Number(c.id) || 0)
      } catch {
        return [0]
      }
    }),
  )

/** 同一会场同一成员的备忘已存在时复用，避免前端 create 重试链路产生重复记录 */
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const memos = getCollection('memos') as Memo[]
  const meetingId = String(body.meetingId || '')
  const assignee = String(body.assignee || '')

  const existing = memos.find((m) => m.meetingId === meetingId && m.assignee === assignee)
  if (existing) return ok({ id: existing.id })

  let contentSeq = maxContentId(memos) + 1
  const contents: MemoContent[] = (body.contents || []).map((c: Partial<MemoContent>) => ({
    id: String(c.id || contentSeq++),
    content: c.content || '',
  }))
  const id = String(Math.max(600000, ...memos.map((x) => Number(x.id) || 0)) + 1)
  memos.push({ id, assignee, meetingId, problem: JSON.stringify(contents) })
  return ok({ id })
})
