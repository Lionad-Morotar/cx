import { getCollection, ok } from '../../utils/mock-store'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const rows = getCollection('standups') as Record<string, unknown>[]
  // participants 保持 JSON 字符串原样返回，前端自行 JSON.parse
  return ok(rows.find((x) => String(x.id) === String(body.id)) || null)
})
