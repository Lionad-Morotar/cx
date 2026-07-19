import { getCollection, ok } from '../../utils/mock-store'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const type = body.type || 'day'
  const rows = getCollection('standups') as Record<string, string>[]
  const current = rows.filter((x) => x.type === type && x.state === 'IN_PROGRESS').at(-1)
  if (current) {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    current.state = 'ENDED'
    // endTime 与 startTime 同形态：纯时钟串，前端展示时与 meetingDate 拼接
    current.endTime = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
  }
  return ok(null)
})
