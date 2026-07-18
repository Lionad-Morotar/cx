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

export const createCxMetadataUtils = (cx: CxLoaderInstance) => {
  /**
   * 从 CX 实例中查找到组件元数据
   * 当新安装组件时，会重置缓存
   */
  const findCmptFromCX = useMemoize(
    (_key: CxComponentRuntime['key'] | CxComponentRuntime) => {
      let key = _key ? toRaw(_key) : ''
      if (isCxComponent(key)) {
        key = key.key
      }
      const isSameKey = (meta: any) => {
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

      const syncCmpts = Object.values(cx.installed || {})
      const asyncCmpts = Object.values(cx.installedAsync || {})

      // * 本地开发时，async 组件不会异步加载
      // const target = isAsyncCmpt
      //   ? (asyncCmpts.find((x: any) => isSameKey(x._cx_meta)) as any)
      //   : (syncCmpts.find((x: any) => isSameKey(x._cx_meta)) as any)
      const target =
        (asyncCmpts.find((x: any) => isSameKey(x._cx_meta)) as any) ||
        (syncCmpts.find((x: any) => isSameKey(x._cx_meta)) as any)

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

  const getMeta = (_key: CxComponentRuntime['key'] | CxComponentRuntime) => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    const cxCmpt = findCmptFromCX(key)
    return cxCmpt ? cxCmpt._cx_meta : {}
  }

  // 获取组件初始化信息
  const getCmpt = (_key: CxComponentRuntime['key'] | CxComponentRuntime) => {
    let key = _key ? toRaw(_key) : ''
    key = isCxComponent(key) ? key.key : key
    const cmpt = findCmptFromCX(key)
    return cmpt as CxComponentRuntime | null
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
    const cxCmpt = findCmptFromCX(key)
    // console.log(cxCmpt)
    const name = cxCmpt ? cxCmpt._cx_meta?.name : ''
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
    const cxCmpt = findCmptFromCX(key)
    const description = cxCmpt ? cxCmpt._cx_meta?.description : ''
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
    const cxCmpt = findCmptFromCX(key)
    // console.log('[debug] cxCmpt', cxCmpt)
    return cxCmpt ? cxCmpt._cx_meta?.props : {}
  }

  /**
   * 获取组件的运行时数据（data）
   * @param key 组件类型（key）
   * @param initialData 初始数据
   */
  const getData = (
    key: CxComponentRuntime['key'] | CxComponentRuntime,
    initialData: Record<string, any> = {},
    context?: CxPropCTX,
  ): Record<string, any> => {
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

  // * todo cmpt.getName
  const getDataName = (_cmpt: CxComponentRuntime): string => {
    const cmpt = toRaw(_cmpt)
    return cmpt.data?._cx_name || cmpt.name || ''
  }
  const getDataEvents = (_cmpt: CxComponentRuntime): CxEvent[] => {
    const cmpt = toRaw(_cmpt)
    return cmpt.data?._cx_events || []
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
    const initialValues: CxComponentMetaProps = {}
    const targetProps: CxComponentMetaProps = getProps(key)
    const initialContext = context as CxPropCTX

    Object.entries(targetProps || {}).reduce((h, [k, v]) => {
      const initialKeys = ['initial', 'default'] as ['initial', 'default']
      initialKeys.forEach((key) => {
        h[k] = h[k] || (v[key] instanceof Function ? (v[key] as any)?.(initialContext) : v[key])
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
    const cxCmpt = findCmptFromCX(key)
    // console.log('[debug] key', key, cxCmpt._cx_meta)
    return cxCmpt ? cxCmpt._cx_meta?.emits : {}
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
    const cxCmpt = findCmptFromCX(key)
    return cxCmpt ? cxCmpt._cx_meta?.exposes : {}
  }

  const getSlots = (
    _key: CxComponentRuntime['key'] | CxComponentRuntime | CxComponentMetaDefined,
  ) => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key) || isCxComponentMeta(key)) {
      key = key.key
    }
    const cxCmpt = findCmptFromCX(key)
    const slots = cxCmpt?._cx_meta?.slots
    return slots || {}
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getKey = (_key: CxComponentRuntime['key'] | CxComponentRuntime, data?: any) => {
    let key = _key ? toRaw(_key) : ''
    if (isCxComponent(key)) {
      key = key.key
    }
    return key
  }

  return {
    touch,
    findFromCX: findCmptFromCX,
    findFromCXByKey: findCmptFromCX,
    getMeta,
    getCmpt,
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
