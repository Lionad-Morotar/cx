import { getCollection, ok } from '../../utils/mock-store'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const all = getCollection('issues') as Record<string, unknown>[]
  const found = all.find((x) => String(x.id) === String(body.id))
  if (found) {
    found.name = body.title
    // title 为 name 的冗余别名字段，保持同步
    found.title = body.title
  }
  return ok(null)
})
