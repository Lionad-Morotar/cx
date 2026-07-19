import { CxRenderCmpts } from '@lionad/cx-render'
import { CxBasics, CxCalendar, CxGrid, CxPage, CxUserStyle } from '@lionad/cx-components'
import { CxNuxtUI, CxSimpleCard } from '@lionad/cx-components-nuxt-ui-v4'

import type { CxLoaderInstance } from '@lionad/cx-definition'
import type { NuxtApp } from '#app'

/**
 * 按模块选项安装物料集（与 p-ray 编辑器相同的装配形态）。
 */
export const installCxBundles = (cx: CxLoaderInstance, nuxtApp: NuxtApp) => {
  const enabled = (nuxtApp.$config.public.cx as any)?.materials || ['render', 'components', 'nuxt-ui']
  const bundles: Record<string, any[]> = {
    render: [...CxRenderCmpts],
    components: [CxPage, CxGrid, CxCalendar, CxUserStyle, ...CxBasics],
    'nuxt-ui': [...CxNuxtUI, CxSimpleCard],
  }

  for (const key of enabled) {
    for (const cmpt of bundles[key] || []) {
      cmpt._cx_meta.type = 'local'
      cx.installComponent(cmpt._cx_meta.key, cmpt)
    }
  }
}
