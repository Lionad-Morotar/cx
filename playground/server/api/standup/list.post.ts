import { getCollection, ok } from '../../utils/mock-store'

type Standup = { id: string; type: string; meetingDate: string }

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const type = body.type || 'day'
  let rows = (getCollection('standups') as Standup[]).filter((x) => x.type === type)
  // startTime/endTime 是完整时间串，meetingDate 是日期串，截前 10 位字典序比较
  if (body.startTime)
    rows = rows.filter((x) => x.meetingDate >= String(body.startTime).slice(0, 10))
  if (body.endTime) rows = rows.filter((x) => x.meetingDate <= String(body.endTime).slice(0, 10))
  rows = [...rows].sort((a, b) => (a.meetingDate < b.meetingDate ? -1 : 1))
  return ok(rows)
})
