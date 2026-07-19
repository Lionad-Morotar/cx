import { getCollection, ok } from '../../utils/mock-store'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  const all = getCollection('issues') as Record<string, unknown>[]
  const pageSize = Number(body.pageSize) || 20
  // 兼容 offset 与 page 两种分页参数形态
  const offset =
    body.offset != null ? Number(body.offset) : ((Number(body.page) || 1) - 1) * pageSize
  return ok({ objects: all.slice(offset, offset + pageSize), totalCount: all.length })
})
