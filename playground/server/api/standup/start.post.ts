import { getCollection, ok } from '../../utils/mock-store'

// Why 可重复调用：已有同类型进行中会议时直接复用其 id，与原契约「可以重复调用」一致
export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const type = body.type || 'day'
  const rows = getCollection('standups') as Record<string, unknown>[]

  const existing = rows.filter((x) => x.type === type && x.state === 'IN_PROGRESS').at(-1)
  if (existing) return ok({ id: existing.id })

  const startTime = String(body.startTime || '')
  const meetingDate = startTime.slice(0, 10) || new Date().toISOString().slice(0, 10)
  const startClock = startTime.slice(11) || '09:30:00'
  const id = String(Math.max(0, ...rows.map((x) => Number(x.id) || 0)) + 1)
  rows.push({
    id,
    type,
    name: meetingDate,
    created: `${meetingDate} ${startClock}`,
    createdBy: 'shenyz',
    meetingDate,
    startTime: startClock,
    endTime: '',
    state: 'IN_PROGRESS',
    participants: '[]',
    lastUpdated: `${meetingDate} ${startClock}`,
    lastUpdatedBy: 'shenyz',
  })
  return ok({ id })
})
