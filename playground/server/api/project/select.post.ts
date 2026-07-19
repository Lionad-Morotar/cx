import { ok, setCollection } from '../../utils/mock-store'

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) || {}
  // 与前端 apiSetDefaultProject 的参数契约对齐（projectId）
  setCollection('user-setting', { projectId: String(body.projectId || '') })
  return ok(null)
})
