import { getCollection, ok } from '../../utils/mock-store'

type Issue = {
  assignee: string
  participants: string
  createdAt: string
  pmPassedAt: string | null
}

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  let rows = getCollection('issues') as Issue[]

  if (!body.allUser && body.assigneeUserName) {
    rows = rows.filter(
      (x) =>
        x.assignee === body.assigneeUserName ||
        (x.participants || '').split(',').includes(body.assigneeUserName),
    )
  }
  // date 语义：该日期时议题已创建且尚未最终验收通过，即当日站会上仍与其相关
  if (body.date) {
    const d = String(body.date).slice(0, 10)
    rows = rows.filter(
      (x) =>
        String(x.createdAt || '').slice(0, 10) <= d &&
        (!x.pmPassedAt || String(x.pmPassedAt).slice(0, 10) >= d),
    )
  }
  return ok(rows)
})
