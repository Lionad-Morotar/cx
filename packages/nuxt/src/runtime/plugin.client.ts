import { CxLoader } from '@lionad/cx-definition'
import { defineNuxtPlugin } from '#imports'

import { installCxBundles } from './install'

/**
 * client 侧：完成远程 metadata init（p-ray 同形），并安装物料。
 */
export default defineNuxtPlugin({
  name: 'cx',
  enforce: 'pre',
  // defineNuxtPlugin 的 setup 入参是 Nuxt 注入的 NuxtApp，框架类型在此模块上下文不可达，
  // 用 unknown + 消费侧断言收口（installCxBundles 与 vueApp 访问均经断言）
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
