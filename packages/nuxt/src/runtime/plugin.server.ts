import { CxLoader } from '@lionad/cx-definition'
import { defineNuxtPlugin } from '#imports'

import { installCxBundles } from './install'

/**
 * server 侧：仅注册本地物料（远程 metadata init 是 client-only 能力），
 * 保证 CxRender 以 components prop 直接驱动时可 SSR。
 */
export default defineNuxtPlugin({
  name: 'cx',
  enforce: 'pre',
  async setup(nuxtApp: any) {
    const cx = new CxLoader()

    await installCxBundles(cx, nuxtApp)
    nuxtApp.vueApp.provide('cx', cx)

    return {
      provide: { cx },
    }
  },
})
