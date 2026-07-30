import {
  addComponent,
  addPlugin,
  addTemplate,
  createResolver,
  defineNuxtModule,
  extendViteConfig,
} from '@nuxt/kit'

import type { NuxtModule } from '@nuxt/schema'

/** 物料 bundle 声明：package 为物料包名，namedExport 为包导出的 bundle 命名导出 */
export interface CxBundleSpec {
  package: string
  namedExport: string
}

/** 内置物料集名称（兼容形态）：映射到对应物料包的 bundle 声明，不 import 物料包本体 */
export type CxBuiltinMaterialSet =
  | 'render'
  | 'components'
  | 'nuxt-ui-v2'
  | 'nuxt-ui-v4'
  | 'vtu'
  | 'element-plus'
  | 'naive-ui'

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
  components: { package: '@lionad/cx-comps', namedExport: 'CxComponentsBundle' },
  'nuxt-ui-v2': { package: '@lionad/cx-comps-nuxt-ui-v2', namedExport: 'CxNuxtUIV2Bundle' },
  'nuxt-ui-v4': { package: '@lionad/cx-comps-nuxt-ui-v4', namedExport: 'CxNuxtUIV4Bundle' },
  vtu: { package: '@lionad/cx-comps-vtu', namedExport: 'CxVtuBundle' },
  'element-plus': { package: '@lionad/cx-comps-element-plus', namedExport: 'CxElementPlusBundle' },
  'naive-ui': { package: '@lionad/cx-comps-naive-ui', namedExport: 'CxNaiveUiBundle' },
}

/**
 * dev 冷启动依赖预构建声明：workspace 链接的物料源码与三方物料库的深路径导入
 * （dayjs plugin/locale、lodash-es 子路径）对 Vite 扫描器首趟不可见，运行期才被发现，
 * 会触发 re-optimize 与整页重载；预先声明消除冷启动多次重载。
 * 基线表派生自 cx-nuxt 自身依赖链（cx-definition + cx-vue），恒可解析；
 * 物料集增量按内置物料集条件注入——宿主未安装对应物料包时预构建会解析失败，
 * 故不能无条件注入；自定义 bundles 形态的依赖链本模块无从得知，不予管理。
 */
const BASE_OPTIMIZE_DEPS = [
  // cx-definition 运行时依赖
  'bignumber.js',
  'kareem',
  'mitt',
  'nanoid',
  'nativebird',
  'uuid',
  'zod',
  // cx 源码内 lodash-es 深路径导入
  'lodash-es',
  'lodash-es/camelCase',
  'lodash-es/cloneDeep',
  'lodash-es/isFunction',
  'lodash-es/kebabCase',
  'lodash-es/upperFirst',
  // cx-vue 运行时依赖
  '@iconify/vue',
  'anysort',
  'use-semantic-version',
  'vue-concurrency',
  // dayjs 及物料内引用的 plugin/locale（dayjs 由 cx-vue 声明，随任一物料安装）
  'dayjs',
  'dayjs/locale/zh-cn',
  'dayjs/plugin/duration',
  'dayjs/plugin/isSameOrAfter',
  'dayjs/plugin/isSameOrBefore',
  'dayjs/plugin/localeData',
  'dayjs/plugin/relativeTime',
  'dayjs/plugin/weekday',
]

/** 各内置物料集需追加预构建的依赖；render/components 无超出基线的依赖，空表即核验结论 */
const BUNDLE_OPTIMIZE_DEPS: Record<CxBuiltinMaterialSet, string[]> = {
  render: [],
  components: [],
  'nuxt-ui-v2': [
    '@headlessui/vue',
    '@popperjs/core',
    '@vueuse/integrations/useFuse',
    'fuse.js',
    'tailwind-merge',
    'v-calendar',
    'vue-demi',
  ],
  'nuxt-ui-v4': ['@internationalized/date'],
  // vtu-components 的重组件依赖（shiki/leaflet/chart.js 等）不预声明：
  // 引用它们的组件按需加载，预声明只会拖慢冷启动；待运行期观测到再补
  vtu: ['@lionad/vtu-components', '@vueuse/router'],
  // element-plus 经物料包装层全入口具名导入，首趟对扫描器不可见，预声明消除冷启动重载；
  // dayjs / lodash-es 等深路径已在基线表覆盖
  'element-plus': ['element-plus'],
  // naive-ui 同为包装层全入口具名导入；其依赖链（css-render / vueuc / date-fns 等）
  // 随 naive-ui 预构建同 chunk 解析，单条声明即可
  'naive-ui': ['naive-ui'],
}

/** 内置物料包名 → 物料集名反查；自定义 bundles 的包名不会命中 */
const BUNDLE_SET_BY_PACKAGE: Record<string, CxBuiltinMaterialSet> = Object.fromEntries(
  (Object.keys(BUILTIN_BUNDLES) as CxBuiltinMaterialSet[]).map((name) => [
    BUILTIN_BUNDLES[name].package,
    name,
  ]),
)

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
    if (options.injectStyles && specs.some((s) => s.package === '@lionad/cx-comps-nuxt-ui-v2')) {
      nuxt.options.css.push('v-calendar/dist/style.css')
    }

    // element-plus 与 vtu 样式均不在模块侧注入，交还宿主入口 css 负责：
    // - vtu：宿主须在 `@import "tailwindcss"` 之后 `@import "@lionad/vtu-components/style.css"`，
    //   由其内置 @theme 注册颜色 token、@source 扫描 dist 生成工具类（模块侧扫描因缺 @theme 会致
    //   颜色工具类不生成，边框回退 currentColor 发黑、bg/text 色丢失，故弃用）
    // - element-plus：其全量 css 含全局元素 reset 且为 unlayered，模块侧直接 push 会按级联规则
    //   胜宿主的 @layer utilities（如把 nuxt-ui 按钮背景重置为透明）。须由宿主以
    //   `@import 'element-plus/dist/index.css' layer(cx-ep)` 压入层序最前的 cx-ep 层
    //   （见 @lionad/cx-comps-element-plus README 装配契约），元素 reset 方能输给宿主工具类
    // - naive-ui：CSS-in-JS（css-render 于组件渲染期注入 <style> 标签），无 dist css 文件，
    //   模块侧与宿主侧均无需注入；样式全部作用于 n-* 前缀类选择器，无全局元素 reset，
    //   故不参与 @layer 层序安排（与 vtu/element-plus 的委托形态均不同）

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

    // 仅 client dev 注入：optimizeDeps 是依赖预构建开关，生产构建与 server bundle 不消费此字段
    extendViteConfig(
      (config) => {
        config.optimizeDeps ||= {}
        config.optimizeDeps.include ||= []
        const declared = new Set(config.optimizeDeps.include)
        for (const dep of BASE_OPTIMIZE_DEPS) {
          declared.add(dep)
        }
        for (const spec of specs) {
          const setName = BUNDLE_SET_BY_PACKAGE[spec.package]
          if (!setName) continue
          for (const dep of BUNDLE_OPTIMIZE_DEPS[setName]) {
            declared.add(dep)
          }
        }
        config.optimizeDeps.include = [...declared]
      },
      { client: true, dev: true },
    )
  },
})

export default module
