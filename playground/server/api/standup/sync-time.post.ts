import { getCollection, ok } from '../../utils/mock-store'

export default defineEventHandler(async () => {
  const { syncTime } = getCollection('sync-time') as { syncTime: string }
  return ok(syncTime)
})
