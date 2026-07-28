import {
  capitalize,
  defineAsyncComponent,
  h,
  markRaw,
  readonly,
  computed,
  type Component,
} from 'vue'
import { useMemoize } from '@vueuse/core'
import camelCase from 'lodash-es/camelCase'
// @ts-expect-error nativebird 类型为 export=，运行时 ESM default 可用（已验证 .map 存在）
import NPromise from 'nativebird'

import { createCxEmitter } from '../events/cx-emitter'
import { useRefs } from '../utils/refs'
import { createCxUtils, createCxDatas, createCxID } from '../utils'
import { cxLoaderHooks } from '../events'
import { defineCxComponent } from '../define'
import getURL from './script-manager'
import { isDev } from './config'
import { getDefaultExportFromModule } from './module'

import type { ComputedRef, DeepReadonly } from 'vue'
import type { CxUtils, CxDatas } from '../utils'
import type { CxRefs, CxEmitter, CxComponentMetaDefined, CxLoaderConfig } from '../types'

const getArray = <T>(x: T | T[]) => (Array.isArray(x) ? x : x ? [x] : [])

/**
 * metadata.js 加载回来的单条组件元信息形态。
 * 字段比 CxComponentMetaDefined 更宽（含 exports 导出名、字段多可选），
 * 因为是加载阶段未补全的原始数据；installComponentsFromMetadata 会消费它
 */
type CxComponentMetadataEntry = {
  key: string
  name?: string
  exports?: string
  url?: string
  async?: boolean
  aliasKeys?: string[]
}

// 开发模式不能冻结组件元数据，
// 热更新需要覆盖更新组件元信息
const hmrFreeFreezing = (x: Component) => {
  return isDev ? markRaw(x) : markRaw(Object.freeze(x))
}

/**
 * CX 加载器
 * （在 CxLoader 上挂了越来越多的东西，考虑重命名）
 * 用于从给定路径加载自定义组件库
 * 0. 从组件库地址的 render.js 路径读取并加载 CX 渲染器（TODO refactor，应当从固定地址载入或放到包内）
 * 1. 从组件库地址的 metadata.js 路径读取组件库元信息
 * 2. 加载 metadata.js 包含的所有的组件
 * 3. 注册组件
 * 4. 执行回调函数
 */
export class CxLoader {
  id: string
  /**
   * Loader 相关钩子函数和事件管理，
   * 挂载到 CxLoader 是因为要和 CxRender 交互，
   * 既然 CxRender 依赖 CxLoader，那就没必要再从 window 读了
   */
  static hooks = cxLoaderHooks as DeepReadonly<typeof cxLoaderHooks>
  hooks: DeepReadonly<typeof cxLoaderHooks>
  utils: DeepReadonly<CxUtils>
  refs: CxRefs
  emitter: CxEmitter
  datas: CxDatas
  /**
   * 是否初始化完毕
   */
  isInited: boolean
  /**
   * 初始化上下文，简单的 requireJS 的替代品，用来存 window.Vue 等变量
   */
  config: CxLoaderConfig | null
  /**
   * 组件地址路径前缀，如加载 c-tag 对应 https://b.com/c-tag.js 中的 https://b.com/
   */
  baseURL: string | null
  /**
   * 已安装的组件（组件实例上动态挂载了 _cx_meta 等元信息字段）
   */
  installed: Record<string, Component> | null
  /**
   * 已安装的组件的异步组件的实际组件（但不包括 Error、Loading）
   */
  installedAsync: Record<string, Component> | null
  /**
   * this.installed 的数组形式
   */
  installedComponents: ComputedRef<Component[]>
  /**
   * 组件 key 对应的注册好的组件或空
   */
  cs: Record<string, Component> | null
  /**
   * 根据地址加载的组件元信息
   */
  metadata: CxComponentMetadataEntry[]
  /**
   * 是否已加载 CxRender
   */
  isLoadedCxRender: boolean
  /**
   * 把 metadata 定义的组件加载完成之后的回调函数
   */
  cb: null | ((instance: CxLoader) => void)

  /**
   * new CxLoader
   * @param url 自定义组件元数据（及组件）所在地址
   * @param config { app?: 用于组件注册等, type: 'umd'、'esm' 模块类型 }
   * @param cb 回调函数
   */
  constructor(url?: string, config?: CxLoaderConfig, cb?: (instance: CxLoader) => void) {
    // console.log('[INFO] cx-loader created', this)
    // console.log('[info] current env', nodeEnv)

    this.id = createCxID()
    this.hooks = readonly(cxLoaderHooks)
    this.utils = readonly(createCxUtils(this))
    this.refs = useRefs() as CxRefs
    this.emitter = createCxEmitter(this.refs) as CxEmitter
    this.datas = createCxDatas(this)

    this.isInited = false
    this.cb = null
    this.config = null
    this.baseURL = null
    this.installed = null
    this.installedAsync = null
    // init() 会赋真正的 computed；构造期先用空数组的 computed 占位
    this.installedComponents = computed(() => []) as ComputedRef<Component[]>
    this.cs = null
    this.isLoadedCxRender = false
    this.metadata = []
    if (url && config) {
      this.init(url, config, cb)
    }
    return this
  }

  /**
   * 获取 cxLoaderInstance 的复制，可用于 cx-render 嵌套等情况
   */
  async getClone() {
    const cx = new CxLoader()

    cx.id = createCxID()
    cx.hooks = this.hooks
    cx.utils = readonly(createCxUtils(cx))
    cx.refs = useRefs() as CxRefs
    cx.emitter = createCxEmitter(cx.refs) as CxEmitter
    cx.datas = createCxDatas(cx)

    cx.isInited = false
    cx.cb = this.cb
    cx.config = this.config
    cx.baseURL = this.baseURL
    cx.installed = this.installed
    cx.installedAsync = this.installedAsync
    cx.installedComponents = this.installedComponents
    cx.isLoadedCxRender = this.isLoadedCxRender
    cx.metadata = this.metadata

    // console.log('[INFO] cx-loader cloned', cx)

    return cx
  }

  _validateConfig() {
    if (!this.config?.app) {
      throw new Error('pls provide app')
    }
  }

  _getURL(url: string) {
    return `${this.baseURL}${url}`
  }

  fetchModule = useMemoize(async (...args: [url: string, exportsName?: string]) => {
    // useMemoize 泛型会让具名参数在闭包内退化为 unknown；用具名解构重新锚定类型
    const [urlArg, exportsNameArg = 'default'] = args
    const url: string = urlArg
    const exportsName: string = exportsNameArg
    const moduleType = this.config!.type
    // 显式标注 fetchModule 签名：CxLoaderConfig 与 CxLoader 循环导入会导致
    // this.config!.fetchModule 的参数类型退化为 unknown，此处收口
    const customFetcher = this.config!.fetchModule as
      | ((url: string, exportsName: string, pkgName: string) => Promise<unknown>)
      | undefined

    // TODO ext auto adapter
    if (!url.endsWith('.js')) {
      args[0] = `${url}.js`
    }
    const finalURL = args[0]

    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (customFetcher) {
        try {
          const res = await customFetcher(finalURL, exportsName, 'CxComponent')
          resolve(res)
        } catch (e) {
          reject(e)
        }
      }
      // temp disabled
      // if (moduleType === 'esm-native') {
      //   // * use native import to fetch esm module
      //   // TODO fixme
      //   import(/* webpackIgnore: true */ /* @vite-ignore */ url)
      //     .then((module) => {
      //       resolve(module.default)
      //     })
      //     .catch((err) => {
      //       reject(err)
      //     })
      // }
      if (moduleType === 'esm') {
        const { mount } = getURL(finalURL, {
          moduleType,
          onError(err) {
            console.error('[ERR]', err)
            reject(err)
          },
          onLoad() {
            try {
              // esm 模式下脚本会把模块挂到 window[url]；window 无字符串索引签名，断言取出
              const component = (window as unknown as Record<string, unknown>)[finalURL]
              resolve(component)
            } catch (error) {
              console.error('[ERR]', error)
              reject(error)
            }
          },
        })
        mount()
      }
      if (moduleType === 'umd') {
        const { mount } = getURL(finalURL, {
          moduleType,
          onError(err) {
            console.error('[ERR]', err)
            reject(err)
          },
          onLoad() {
            try {
              // umd 模式下脚本会把模块挂到 window[exportsName]
              const component = getDefaultExportFromModule(
                (window as unknown as Record<string, unknown>)[exportsName],
              )
              resolve(component)
            } catch (error) {
              console.error('[ERR]', error)
              reject(error)
            }
          },
        })
        mount()
      }
      if (moduleType === 'module-federation') {
        // console.log('[debug] fetching mf', `${'CxComponent'}/${exportsName}`)
        import(/* @vite-ignore */ `${'CxComponent'}/${exportsName}`)
          .then((module) => {
            resolve(module.default)
          })
          .catch((err) => {
            reject(err)
          })
      }
    })
  })

  init(url?: string, config?: CxLoaderConfig, cb?: (instance: CxLoader) => void) {
    if (this.isInited) {
      return this
    }

    this.cb = cb || null
    this.baseURL = url || this.baseURL

    this.config = Object.assign(
      {
        type: 'umd',
      },
      config || this.config || {},
    ) as CxLoaderConfig
    this._validateConfig()

    this.installed = Object.create(null)
    this.installedAsync = Object.create(null)

    this.installedComponents = computed(() => {
      const syncComps = Object.values(this.installed || {})

      // * 这样改和直接修改 installed 内 _cx_meta 一样也会导致报错
      const asyncComps = Object.values(this.installedAsync || {})

      // 异步组件真实内容加载完后，
      // 会自动覆盖一开始就注册的 defineAsyncComponent 同步组件，
      // 虽然也是用 defineCxComponent 处理了同步组件，但是他的 _cx_meta 等是不完整的，
      // 所以这里需要通过真实注册的组件来获取自定义组件元数据，
      // 这里的返回是顺序相关的
      return [...asyncComps, ...syncComps]
    })

    this.isInited = true

    return this
  }

  async load() {
    await this._validateConfig()
    await this.loadMetadata()
    if (this.cb) {
      await this.cb(this)
      this.cb = null
    }
    return this
  }

  async loadMetadata() {
    const fullURL = this._getURL('metadata')
    try {
      const metadata = (await this.fetchModule(fullURL, 'CxMetadata')) as CxComponentMetadataEntry[]
      this.metadata = metadata || []
      await this.installComponentsFromMetadata()
    } catch (e) {
      console.error(e)
      throw new Error('[ERR] error on loading components-metadata', { cause: e })
    }
    return this
  }

  async installComponentsFromMetadata() {
    await this._validateConfig()

    // TODO check "return await promise" vs "return promise"

    return await NPromise.map(
      this.metadata,
      async (meta: CxComponentMetadataEntry) => {
        const { async, exports, url, key, aliasKeys } = meta
        const installKey = capitalize(camelCase(key))
        const exportsName = exports
        // baseURL 在 init() 后必填；url 缺失时退空串（metadata 契约保证有值）
        const fullURL = `${this.baseURL ?? ''}${url ?? ''}`
        try {
          const component = (
            !async
              ? await this.fetchModule(fullURL, exportsName)
              : defineCxComponent({
                  name: meta.name,
                  key: meta.key,
                  aliasKeys: meta.aliasKeys,
                  async: meta.async,
                  // TODO 懒加载 https://segmentfault.com/a/1190000044239102
                  component: defineAsyncComponent({
                    loader: async () => {
                      const comp = (await this.fetchModule(
                        fullURL,
                        exportsName,
                      )) as CxComponentMetaDefined
                      // console.log('[info] comp', comp)
                      const comps = getArray(comp)
                      // installed 和 installedAsync 都是响应式数据，
                      // 修改后某些组件会重渲染，和当前异步组件的渲染发生冲突报错，
                      // 所以这里需要等待异步组件渲染结束
                      setTimeout(() => {
                        comps.forEach((comp) => {
                          this.installedAsync![installKey] = hmrFreeFreezing(comp as Component)
                          this.utils.findFromCX.clear()
                          this.hooks.emit('comp:async-comp:loaded', {
                            comp,
                          })
                        })
                      })
                      return comp
                    },
                    // 可能是和 vue-draggable 有冲突报错，
                    // 总之不能使用默认的 suspensible 设置
                    suspensible: false,
                    delay: 0,
                    timeout: 5000,
                    errorComponent: () => h('div', {}, `Error on ${meta.key}`),
                  }),
                })
          ) as CxComponentMetaDefined

          const keys = [key, ...(aliasKeys || [])]
          await NPromise.map(keys, async (key: string) => {
            // console.log('[info] xxx', key, exportsName, component)
            await this.installComponent(key, component)
          })
        } catch (err) {
          console.group()
          console.info(`[ERR] error on install ${key}`)
          console.info('error', err)
          console.info('url', url)
          console.groupEnd()
        }
      },
      {
        concurrency: 6,
      },
    )
  }

  async installComponent(
    key: string,
    name: string | CxComponentMetaDefined | CxComponentMetaDefined[],
    component?: CxComponentMetaDefined | CxComponentMetaDefined[],
  ) {
    if (typeof name !== 'string') {
      component = name as unknown as CxComponentMetaDefined | CxComponentMetaDefined[]
      name = capitalize(camelCase(key))
    }
    const app = this.config!.app
    const comps = getArray(component).filter(Boolean)
    comps.forEach((comp) => {
      if (app.component(key)) {
        // console.log('[info] comp already installed', key)
      } else {
        app.component(key, hmrFreeFreezing(comp!))
        this.utils.findFromCX.clear()
      }
      this.installed![comp!.name || name] = hmrFreeFreezing(comp as unknown as Component)
      this.utils.findFromCX.clear()
    })
  }

  async installComponents(component: CxComponentMetaDefined | CxComponentMetaDefined[]) {
    const comps = getArray(component)
    comps.forEach((comp) => {
      const key = comp.key
      const name = capitalize(camelCase(key))
      // console.log('[info] prepare to install component', name, key)
      this.installComponent(key, name, comp)
    })
  }
}

/**
 * @deprecated
 * backward capability, remove later
 */
export const Loader = CxLoader
