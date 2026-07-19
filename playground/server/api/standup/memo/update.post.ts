import { getCollection, ok } from '../../../utils/mock-store'

type MemoContent = { id: string; content: string; checked?: boolean; mention?: unknown[] }
type Memo = { id: string; assignee: string; meetingId: string; problem: string }

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const memos = getCollection('memos') as Memo[]
  const memo = memos.find((m) => String(m.id) === String(body.id))
  if (memo) {
    let contentSeq =
      Math.max(
        7000000,
        ...memos.flatMap((m) => {
          try {
            return (JSON.parse(m.problem || '[]') as MemoContent[]).map((c) => Number(c.id) || 0)
          } catch {
            return [0]
          }
        }),
      ) + 1
    // 前端 todo-card 的行对象可能带 checked/mention，原样保留仅补 id
    const contents = (body.contents || []).map((c: Partial<MemoContent>) => ({
      ...c,
      id: String(c.id || contentSeq++),
      content: c.content ?? '',
    }))
    memo.problem = JSON.stringify(contents)
  }
  return ok(null)
})
