import { getCollection, ok } from '../../utils/mock-store'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const rows = getCollection('standups') as Record<string, string>[]
  const found = rows.find((x) => String(x.id) === String(body.id))
  if (found) {
    // 写回 JSON 字符串保真 detail 契约（前端对 participants 做 JSON.parse）
    found.participants = JSON.stringify(body.participants || [])
  }
  return ok(null)
})
