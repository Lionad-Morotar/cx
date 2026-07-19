import { getCollection, ok, setCollection } from '../../utils/mock-store'

export default defineEventHandler(async () => {
  let setting: { projectId: string } | null = null
  try {
    setting = getCollection('user-setting') as { projectId: string }
  } catch {
    // user-setting 无种子文件，首次访问时以默认项目落一份内存态
  }
  if (!setting) {
    const project = getCollection('project') as { id: string }
    setting = { projectId: project.id }
    setCollection('user-setting', setting)
  }
  return ok({ projectId: setting.projectId })
})
