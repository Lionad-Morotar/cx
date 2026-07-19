import { getCollection, ok } from '../../utils/mock-store'

export default defineEventHandler(async () => {
  const { _meta, ...project } = getCollection('project') as Record<string, unknown>
  return ok(project)
})
