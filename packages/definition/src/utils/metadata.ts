import { isCxComponent, isCxComponentMeta } from '../guards'
import { touch } from './tree'
import type {
  CxEvent,
  CxComponentMetaDefined,
  CxComponentMetaProps,
  CxComponentRuntime,
  CxLoaderInstance,
  CxPropCTX,
} from '../types'
import { useMemoize } from '@vueuse/core'
import { toRaw } from 'vue'
import { isString } from '@vue/shared'
import type { Component } from 'vue'

/**
 * installed/installedAsync 存储的组件实例形态：
 * Vue Component 上动态挂载了 _cx_meta 元信息字段（运行时由 defineCxComponent 挂载）。
 * _cx_meta 除标准字段外还可能挂载 getName 等运行时方法，故保留索引签名
 */
type CxInstalledComponent = Component & {
  _cx_meta?: CxComponentMetaDefined & { description?: string } & Record<string, unknown>
}

export const createCxMetadataUtils = (cx: CxLoaderInstance) => {
  /**
   * 从 CX 实例中查找到组件元数据
   * 当新安装组件时，会重置缓存
   */
  const findCompFromCX = useMemoize(
    (_key: CxComponentRuntime['key'] | CxComponentRuntime) => {
      let key = _key ? toRaw(_key) : ''
      if (isCxComponent(key)) {
        key = key.key
      }
      const isSameKey = (meta: (CxInstalledComponent['_cx_meta']) | string | undefined) => {
        if (!meta) {
          return false
        }
        if (isString(meta)) {
          return meta === key
        }
        // console.log('key', key, meta)
        const keys = [
          ...(Array.isArray(meta.key) ? meta.key : [meta.key]),
          ...(Array.isArray(meta.aliasKeys) ? meta.aliasKeys : [meta.aliasKeys]),
        ].filter(Boolean)
        return keys.includes(key)
      }

      const syncComps = Object.values(cx.installed || {}) as CxInstalledComponent[]
      const asyncComps = Object.values(cx.installedAsync || {}) as CxInstalledComponent[]

      // * 本地开发时，async 组件不会异步加载
      const target =
        asyncComps.find((x) => isSameKey(x._cx_meta)) ||
        syncComps.find((x) => isSameKey(x._cx_meta))

      // console.log('@findFromCX', key, target)
      return target
    },
    {
      getKey: (_key) => {
        const key = _key ? toRaw(_key) : ''
        return !key ? '' : isString(key) ? key : key.key
      },
    },
  )

  /**
   * 获取组件的元数据（meta）
   * @param key 组件类型（key）
   */

  const getMeta = (
    _key: CxComponentRuntime['key'] | CxComponentRuntime,
  ): CxComponentMetaDefined & Record<string, unknown> => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    const cxComp = findCompFromCX(key)
    // _cx_meta 除标准字段外含 getName 等运行时方法，索引签名覆盖动态挂载；
    // fallback 为空元信息对象，与有组件时同形态，保证消费侧属性访问安全
    return (
      (cxComp?._cx_meta as CxComponentMetaDefined & Record<string, unknown>) ??
      ({} as CxComponentMetaDefined & Record<string, unknown>)
    )
  }

  // 获取组件初始化信息
  const getComp = (_key: CxComponentRuntime['key'] | CxComponentRuntime) => {
    let key = _key ? toRaw(_key) : ''
    key = isCxComponent(key) ? key.key : key
    const comp = findCompFromCX(key)
    // installed 存的是 Component（带 _cx_meta），运行时按 CxComponentRuntime 形态消费；
    // 两者结构不重叠（Component vs runtime record），用 unknown 双重断言越过
    return (comp ?? null) as unknown as CxComponentRuntime | null
  }

  /**
   * 获取组件的名字
   * @param key 组件类型（key）
   */
  const getName = (_key: CxComponentRuntime['key'] | CxComponentRuntime) => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    const cxComp = findCompFromCX(key)
    // console.log(cxComp)
    const name = cxComp ? cxComp._cx_meta?.name ?? '' : ''
    return name.startsWith('-') ? `${key}-${name}` : name
  }

  /**
   * 获取组件的描述
   * @param key 组件类型（description）
   */
  const getDescription = (_key: CxComponentRuntime['key'] | CxComponentRuntime) => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    const cxComp = findCompFromCX(key)
    const description = cxComp ? cxComp._cx_meta?.description : ''
    return description
  }
  /**
   * 获取组件的依赖数据（props）
   * @param key 组件类型（key）
   */
  const getProps = (_key: CxComponentRuntime['key'] | CxComponentRuntime): CxComponentMetaProps => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    // console.log('[debug] key', key)
    const cxComp = findCompFromCX(key)
    // console.log('[debug] cxComp', cxComp)
    return (cxComp ? cxComp._cx_meta?.props : undefined) ?? ({} as CxComponentMetaProps)
  }

  /**
   * 获取组件的运行时数据（data）
   * @param key 组件类型（key）
   * @param initialData 初始数据
   */
  const getData = (
    key: CxComponentRuntime['key'] | CxComponentRuntime,
    initialData: Record<string, unknown> = {},
    context?: CxPropCTX,
  ): Record<string, unknown> => {
    key = key ? toRaw(key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    const data = Object.assign(getInitialValues(key, {}, context), initialData)
    return {
      ...data,
      _cx_name: data._cx_name || '',
      _cx_events: data._cx_events || [],
      _cx_style: data._cx_style || {},
    }
  }

  // * todo comp.getName
  const getDataName = (_comp: CxComponentRuntime): string => {
    const comp = toRaw(_comp)
    return comp.data?._cx_name || comp.name || ''
  }
  const getDataEvents = (_comp: CxComponentRuntime): CxEvent[] => {
    const comp = toRaw(_comp)
    return comp.data?._cx_events || []
  }

  // 获取组件初始数据
  function getInitialValues(
    _key: CxComponentRuntime['key'] | CxComponentRuntime,
    mergeData = {},
    context?: CxPropCTX,
  ) {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    // initialValues 存的是属性初始值（string/number/函数返回），非属性配置 ConfigPropMatch
    const initialValues: Record<string, unknown> = {}
    const targetProps: CxComponentMetaProps = getProps(key)
    const initialContext = context as CxPropCTX

    Object.entries(targetProps || {}).reduce((h, [k, v]) => {
      const initialKeys = ['initial', 'default'] as ['initial', 'default']
      initialKeys.forEach((key) => {
        h[k] =
          h[k] ||
          (v[key] instanceof Function
            ? (v[key] as (ctx: CxPropCTX) => unknown)?.(initialContext)
            : v[key])
      })
      if (h[k] == null) {
        delete h[k]
      }
      return h
    }, initialValues)

    return Object.assign(initialValues, mergeData)
  }

  /**
   * 获取组件的事件广播（emits）
   * @param key 组件类型（key）
   */
  const getEmits = (_key: CxComponentRuntime['key'] | CxComponentRuntime) => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    const cxComp = findCompFromCX(key)
    // console.log('[debug] key', key, cxComp._cx_meta)
    return cxComp ? cxComp._cx_meta?.emits ?? {} : {}
  }

  /**
   * 获取组件的事件暴露（exposes）
   * @param key 组件类型（key）
   */
  const getExposes = (_key: CxComponentRuntime['key'] | CxComponentRuntime) => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    const cxComp = findCompFromCX(key)
    return cxComp ? cxComp._cx_meta?.exposes ?? {} : {}
  }

  const getSlots = (
    _key: CxComponentRuntime['key'] | CxComponentRuntime | CxComponentMetaDefined,
  ) => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key) || isCxComponentMeta(key)) {
      key = key.key
    }
    const cxComp = findCompFromCX(key)
    const slots = cxComp?._cx_meta?.slots
    return slots || {}
  }

  // _ 前缀豁免 unused（TS6133 与 no-unused-vars 的 argsIgnorePattern: '^_'）
  const getKey = (_key: CxComponentRuntime['key'] | CxComponentRuntime, _data?: unknown) => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    return key
  }

  return {
    touch,
    findFromCX: findCompFromCX,
    findFromCXByKey: findCompFromCX,
    getMeta,
    getComp,
    getName,
    getDescription,
    getDesc: getDescription,
    getProps,
    getData,
    getDataName,
    getDataEvents,
    getEmits,
    getExposes,
    getSlots,
    getKey,
  }
}

export type CxMetadataUtils = ReturnType<typeof createCxMetadataUtils>
