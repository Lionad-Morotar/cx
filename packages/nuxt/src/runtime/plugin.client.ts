import { CxLoader } from '@lionad/cx-definition'
import { defineNuxtPlugin } from '#imports'

import { installCxBundles } from './install'

/**
 * client 侧：完成远程 metadata init（p-ray 同形），并安装物料。
 */
export default defineNuxtPlugin({
  name: 'cx',
  enforce: 'pre',
  async setup(nuxtApp: any) {
    const cx = new CxLoader()
    await cx.init(window.location.href, { app: nuxtApp.vueApp })

    await installCxBundles(cx, nuxtApp)
    nuxtApp.vueApp.provide('cx', cx)

    return {
      provide: { cx },
    }
  },
})
