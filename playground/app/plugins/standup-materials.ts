// 站会迁移物料装配：注册进 CxLoader，使其可被 CxRender schema 驱动渲染
// 依赖 cx-nuxt 模块 pre plugin 提供的 cx 实例（enforce: 'pre' 先于本 plugin 执行）
import * as StandupMaterials from '~/standup/components'

export default defineNuxtPlugin({
  name: 'standup-materials',
  setup(nuxtApp) {
    const cx = nuxtApp.$cx as
      | {
          installComponent: (key: string, cmpt: unknown) => void
        }
      | undefined
    if (!cx) {
      console.warn('[standup-materials] cx instance not found, skip material install')
      return
    }
    const materials = Object.values(StandupMaterials).filter(
      (v) => v && typeof v === 'object' && (v as { _cx_meta?: unknown })._cx_meta,
    ) as { _cx_meta: { key: string; type?: string } }[]
    for (const cmpt of materials) {
      cmpt._cx_meta.type = 'local'
      cx.installComponent(cmpt._cx_meta.key, cmpt)
    }
    console.info(`[standup-materials] ${materials.length} materials installed`)
  },
})
