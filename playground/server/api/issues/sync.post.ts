import { ok, setCollection } from '../../utils/mock-store'

export default defineEventHandler(async () => {
  // 手动同步只刷新同步截止时间，不真的拉取外部数据
  setCollection('sync-time', { syncTime: new Date().toISOString() })
  return ok(null)
})
