import { CxRenderCmpts } from '@lionad/cx-render'
import { CxBasics, CxCalendar, CxGrid, CxPage, CxUserStyle } from '@lionad/cx-components'
import { CxNuxtUI, CxSimpleCard } from '@lionad/cx-components-nuxt-ui-v2'

import type { CxLoaderInstance } from '@lionad/cx-definition'
import type { NuxtApp } from '#app'

// 静态 bundle：v2 物料 vendor 自包含，不依赖宿主 @nuxt/ui
const STATIC_BUNDLES: Record<string, any[]> = {
  render: [...CxRenderCmpts],
  components: [CxPage, CxGrid, CxCalendar, CxUserStyle, ...CxBasics],
  'nuxt-ui': [...CxNuxtUI, CxSimpleCard],
}

// 动态 bundle：v4 物料依赖宿主 @nuxt/ui（物料 .vue import { U* } from '#components'），
// 仅在 materials 启用 nuxt-ui-v4 时按需加载，避免未装 @nuxt/ui 的宿主在静态 import
// 解析 #components 时 build/dev 报错（真 opt-in，非配置开关）
const DYNAMIC_BUNDLES: Record<string, () => Promise<any[]>> = {
  'nuxt-ui-v4': async () => {
    const { CxNuxtUIV4 } = await import('@lionad/cx-components-nuxt-ui-v4')
    return [...CxNuxtUIV4]
  },
}

/**
 * 按模块选项安装物料集（与 p-ray 编辑器相同的装配形态）。
 * async：v4 bundle 经动态 import 按需加载。
 */
export const installCxBundles = async (cx: CxLoaderInstance, nuxtApp: NuxtApp) => {
  const enabled = (nuxtApp.$config.public.cx as any)?.materials || [
    'render',
    'components',
    'nuxt-ui',
  ]
  for (const key of enabled) {
    const cmpts =
      STATIC_BUNDLES[key] ?? (DYNAMIC_BUNDLES[key] ? await DYNAMIC_BUNDLES[key]() : [])
    for (const cmpt of cmpts) {
      cmpt._cx_meta.type = 'local'
      cx.installComponent(cmpt._cx_meta.key, cmpt)
    }
  }
}
