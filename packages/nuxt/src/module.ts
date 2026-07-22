import { addComponent, addPlugin, addTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'

import type { NuxtModule } from '@nuxt/schema'

/** 物料 bundle 声明：package 为物料包名，namedExport 为包导出的 bundle 命名导出 */
export interface CxBundleSpec {
  package: string
  namedExport: string
}

/** 内置物料集名称（兼容形态）：映射到对应物料包的 bundle 声明，不 import 物料包本体 */
export type CxBuiltinMaterialSet = 'render' | 'components' | 'nuxt-ui-v2' | 'nuxt-ui-v4' | 'vtu'

export interface CxNuxtModuleOptions {
  /** 物料 bundle 声明列表（插件化形态）；与 materials 同时提供时 bundles 优先 */
  bundles?: CxBundleSpec[]
  /** 物料集开关（兼容形态）：经内置映射展开为 bundle 声明 */
  materials?: CxBuiltinMaterialSet[]
  /** 注入渲染必需样式（@layer cx 与断点样式） */
  injectStyles?: boolean
}

// 兼容形态的物料集 → bundle 声明映射；纯字符串表，cx-nuxt 不依赖任何物料包
const BUILTIN_BUNDLES: Record<CxBuiltinMaterialSet, CxBundleSpec> = {
  render: { package: '@lionad/cx-render', namedExport: 'CxRenderBundle' },
  components: { package: '@lionad/cx-components', namedExport: 'CxComponentsBundle' },
  'nuxt-ui-v2': { package: '@lionad/cx-components-nuxt-ui-v2', namedExport: 'CxNuxtUIV2Bundle' },
  'nuxt-ui-v4': { package: '@lionad/cx-components-nuxt-ui-v4', namedExport: 'CxNuxtUIV4Bundle' },
  vtu: { package: '@lionad/cx-components-vtu', namedExport: 'CxVtuBundle' },
}

/**
 * cx Nuxt module：注册 CxRender 渲染器，按宿主启用的物料 bundle 生成装配清单
 * （虚拟模块），并经 plugin 提供 CxLoader 实例（inject('cx') / useNuxtApp().$cx）。
 */
const module: NuxtModule<CxNuxtModuleOptions> = defineNuxtModule<CxNuxtModuleOptions>({
  meta: {
    name: '@lionad/cx-nuxt',
    configKey: 'cx',
  },
  // materials 不设默认值：defu 合并会把 defaults 数组与用户数组拼接，
  // 导致用户永远无法裁剪掉默认物料集；缺省三件套改在 setup 内兜底
  defaults: {
    injectStyles: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // vendored nuxt-ui v2 组件在模块加载期读取 appConfig.ui.*，
    // 宿主未提供 ui 段时以空对象兜底（等价离线 shim 的默认行为）
    nuxt.options.appConfig.ui = Object.assign({}, nuxt.options.appConfig.ui)

    if (options.injectStyles) {
      nuxt.options.css.push('@lionad/cx-render/style')
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

    // 装配清单统一为 bundle 声明：bundles 优先，否则经内置映射展开 materials；
    // 未提供 materials 时兜底缺省三件套（去重防御 defu 拼接的极端场景）
    const specs =
      options.bundles ??
      [
        ...new Set(
          options.materials ?? (['render', 'components', 'nuxt-ui-v2'] as CxBuiltinMaterialSet[]),
        ),
      ].map((name) => {
        const spec = BUILTIN_BUNDLES[name]
        if (!spec) {
          throw new Error(`[@lionad/cx-nuxt] 未知物料集: ${name}`)
        }
        return spec
      })

    // v-calendar 样式仅 v2 bundle（date-picker 物料）启用时注入：
    // 该依赖归属 v2 物料包，无条件注入会对未装 v-calendar 的宿主产生解析负担
    if (
      options.injectStyles &&
      specs.some((s) => s.package === '@lionad/cx-components-nuxt-ui-v2')
    ) {
      nuxt.options.css.push('v-calendar/dist/style.css')
    }

    // vtu 样式仅 vtu bundle 启用时注入：style.css 自带 `@source "."` 指令，须经宿主
    // Tailwind v4 处理以扫描 vtu dist 生成工具类（tokens + 结构 CSS 已内联其中）；
    // 该依赖归属 vtu 物料包，无条件注入会对未装 vtu 的宿主产生解析负担
    if (options.injectStyles && specs.some((s) => s.package === '@lionad/cx-components-vtu')) {
      nuxt.options.css.push('@lionad/vtu-components/style.css')
    }

    // 虚拟模块桥接：仅启用的包出现在 import 语句中——未启用的物料包不会被构建期
    // 解析（v4 物料依赖宿主 @nuxt/ui 的 #components，未启用即不解析，维持真 opt-in）
    addTemplate({
      filename: 'cx-bundles.mjs',
      write: true,
      getContents: () =>
        [
          '// 由 @lionad/cx-nuxt 生成：宿主启用的物料 bundle 装配清单',
          ...specs.map((s, i) => `import { ${s.namedExport} as bundle${i} } from '${s.package}'`),
          `export const cxBundles = [${specs.map((_, i) => `bundle${i}`)}]`,
        ].join('\n'),
    })

    nuxt.options.runtimeConfig.public.cx = {
      materials: specs.map((s) => s.package),
    }
  },
})

export default module
