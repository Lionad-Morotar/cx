import { addComponent, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

import type { NuxtModule } from '@nuxt/schema'

/** 物料集开关：render 渲染器物料 + components 基础物料 + nuxt-ui(v2) 物料 + nuxt-ui-v4 物料（动态加载） */
export type CxMaterialBundle = 'render' | 'components' | 'nuxt-ui' | 'nuxt-ui-v4'

export interface CxNuxtModuleOptions {
  materials?: CxMaterialBundle[]
  /** 注入渲染必需样式（@layer cx 与断点样式） */
  injectStyles?: boolean
}

/**
 * cx Nuxt module：零配置注册 CxRender 渲染器与全部物料，
 * 注入渲染样式，并经 plugin 提供 CxLoader 实例（inject('cx') / useNuxtApp().$cx）。
 */
const module: NuxtModule<CxNuxtModuleOptions> = defineNuxtModule<CxNuxtModuleOptions>({
  meta: {
    name: '@lionad/cx-nuxt',
    configKey: 'cx',
  },
  defaults: {
    materials: ['render', 'components', 'nuxt-ui'],
    injectStyles: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // vendored nuxt-ui v2 组件在模块加载期读取 appConfig.ui.*，
    // 宿主未提供 ui 段时以空对象兜底（等价离线 shim 的默认行为）
    nuxt.options.appConfig.ui = Object.assign({}, nuxt.options.appConfig.ui)

    if (options.injectStyles) {
      nuxt.options.css.push('@lionad/cx-render/style')
      // date-picker 物料依赖的 v-calendar 样式
      nuxt.options.css.push('v-calendar/dist/style.css')
    }

    addComponent({
      name: 'CxRender',
      export: 'CxRender',
      filePath: '@lionad/cx-render',
    })

    addPlugin({
      src: resolver.resolve('./runtime/plugin.server'),
      order: -10,
    })
    addPlugin({
      src: resolver.resolve('./runtime/plugin.client'),
      order: -10,
    })

    nuxt.options.runtimeConfig.public.cx = {
      materials: options.materials ?? ['render', 'components', 'nuxt-ui'],
    }
  },
})

export default module
