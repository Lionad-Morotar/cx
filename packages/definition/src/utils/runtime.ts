import { cloneDeep } from 'lodash-es'
import {
  isCxComponent,
  isCxComponentGroups,
  isCxComponentGroup,
  isSlottedCxComponentGroup,
} from '../guards'
import type {
  CxLoaderInstance,
  CxComponentRuntime,
  CxComponentStructured,
  CxComponentSlot,
  CxComponentMetaDefined,
} from '../types'
import type { CxMetadataUtils } from './metadata'
import { readonly, toRaw, unref } from 'vue'
import { preIndex, nextIndex, insertIndex } from './number'
import { pick } from 'lodash-es'
import { has } from './guard'
import { genUseHooks } from './use-fn'
import { createCxID } from './create-id'
import { isFunction, isString } from '@vue/shared'

const metaKeys = readonly([
  'name',
  'key',
  'aliasKeys',
  'props',
  'emits',
  'exposes',
  'slots',
  'headless',
])

export const createCxRuntimeUtils = (cx: CxLoaderInstance, utils: CxMetadataUtils) => {
  const useHooks = genUseHooks()
  const rCX = readonly(cx)

  const calcName = (_cmpt: CxComponentRuntime): string => {
    if (!_cmpt) return ''
    const cmpt = toRaw(_cmpt)
    const meta = utils.getMeta(cmpt.key)
    const getName = meta?.getName
    return getName
      ? getName({
          cmpt: readonly(cmpt),
          data: readonly(cmpt?.data),
          cx: rCX,
        })
      : cmpt.data?._cx_name || meta.name
  }

  const calcDataConfigs = (
    _cmpt: CxComponentRuntime,
  ): CxComponentRuntime['data']['_cx_data_config'] => {
    if (!_cmpt) return {} as CxComponentRuntime['data']['_cx_data_config']
    const cmpt = toRaw(_cmpt)
    return cmpt.data?._cx_data_config || ({} as CxComponentRuntime['data']['_cx_data_config'])
  }

  const parseDataBind = (x: string) => {
    const values = x.split('/')
    const [h1Cate, h2Cate, h3Cate, h4Cate] = values as string[]
    const cates = {
      component: '组件',
      datasource: '数据源',
      data: '配置数据',
      meta: '元数据',
    }
    const res = [
      cates[h1Cate as keyof typeof cates] || h1Cate,
      cates[h2Cate as keyof typeof cates] || h2Cate,
      cates[h3Cate as keyof typeof cates] || h3Cate,
      cates[h4Cate as keyof typeof cates] || h4Cate,
    ]
    return res
  }

  let calcSlotsTick
  const calcSlots = (_cmpt: CxComponentRuntime | CxComponentMetaDefined) => {
    if (calcSlotsTick) {
      clearTimeout(calcSlotsTick)
    }

    const cmpt = toRaw(_cmpt)
    const slotDefs = utils.getSlots(cmpt)
    const slots = isFunction(slotDefs)
      ? slotDefs({
          cmpt: readonly(cmpt),
          cx: rCX,
        })
      : slotDefs
    const normalizedSlots = (Array.isArray(slots) ? slots : Object.values(slots)).filter((slot) =>
      has(slot.key),
    )
    // console.log('[debug] calcSlots', cmpt?.key || cmpt, slots, normalizedSlots)
    return normalizedSlots as CxComponentSlot[]
  }

  /**
   * 计算组件的子组件列表（扁平）
   * @param cmpt CxComponentRuntime
   * @param slot CxCmptSlot['key']
   * @param unsafe slot 可能不存在于当前组件，但存在于 cmpt.components[slot]，设置 unsafe 将会包含后者
   */
  const calcChildren = (
    _cmpt: CxComponentRuntime,
    slot?: CxComponentSlot['key'],
    unsafe?: boolean,
  ) => {
    const cmpt = toRaw(_cmpt)
    const allSlots = calcSlots(cmpt)
    const slots = allSlots.filter((x) => !slot || x.key === slot)
    if (unsafe && !allSlots.some((x) => x.key === slot)) {
      slots.push({
        key: slot!,
        name: 'unknown',
      })
    }
    return slots.reduce((h, c) => {
      const group = cmpt?.components?.[c.key] || []
      h = [...h, ...group]
      return h
    }, [] as CxComponentRuntime[])
  }

  // 计算某个组件的根节点
  const calcRoot = (_cmpt: CxComponentRuntime) => {
    const cmpt = toRaw(_cmpt)
    let parent = cmpt
    while (parent?.id) {
      // todo multi parents capable
      const curParent = unref(cx.datas.cmptsIdMap)[(parent as any).parents?.[0]]
      if (!curParent) {
        break
      }
      parent = curParent
      // console.log('[info] parent', parent)
    }
    return parent
  }

  // 删除插槽
  const removeSlot = (cmpt: CxComponentRuntime, slotKey: string) => {
    const cmpts = cmpt.components?.[slotKey] || []
    cmpts.map((x) =>
      removeComponent({
        from: cmpt,
        remove: x,
        slotKey,
      }),
    )
    delete (cmpt.components as Record<string, any>)[slotKey]
  }

  // 初始化组件
  function createComponent(
    input: (Partial<CxComponentRuntime> & { key: CxComponentRuntime['key'] }) | string,
    initialData: Record<string, any> = {},
    component?: Record<string, CxComponentRuntime[]>,
  ): CxComponentRuntime {
    input = isString(input) ? { key: input } : input
    const { key, name } = input
    if (!key) {
      console.error('[debug]', input, initialData)
      throw new Error('needs component key, eg "cx-simple-card"')
    }

    const data = utils.getData(key, initialData)

    // console.log('[info] data', data)
    const cmpt: CxComponentRuntime = {
      key: utils.getKey(key, data),
      data,
      id: createCxID(),
      name: name || utils.getName(key),
      props: utils.getProps(key),
      emits: utils.getEmits(key),
      exposes: utils.getExposes(key),
      slots: utils.getSlots(key),
      parents: [],
      sortn: '0',
    }

    // 后向兼容一段时间，之后会废弃
    // 特殊处理，如果传入 data.components，
    // components 会当作组件属性（cmpt.component）而不是数据属性（data.component）
    if (data.components) {
      cmpt.components = data.components
      delete data.components
    }

    if (component) {
      cmpt.components = component
    }

    // console.log('[debug] createComponent', cmpt)

    return cmpt
  }

  // 复制组件
  const cloneComponent = (
    cmpt: Partial<CxComponentRuntime | CxComponentStructured> & {
      key: CxComponentRuntime['key']
      components?: any
    },
    preserve: string[] = ['data'],
    exclude: string[] = [],
  ): CxComponentRuntime => {
    const component = createComponent(cmpt, cloneDeep(cmpt.data))
    const cover = preserve.reduce(
      (h, k) => {
        if (cmpt.components && k === 'components') {
          if (isSlottedCxComponentGroup(cmpt.components)) {
            h.components = Object.entries(cmpt.components).reduce(
              (slotGroup, [slotKey, slotCmpts]) => {
                slotGroup[slotKey] = slotCmpts.map((x) => cloneComponent(x, preserve))
                return slotGroup
              },
              {} as Record<string, CxComponentRuntime[]>,
            )
          } else {
            console.error('[ERR]', cmpt)
            throw new Error('deprecated')
          }
        } else {
          // @ts-ignore todo
          h[k] = cloneDeep(cmpt[k])
        }
        return h
      },
      {} as Record<string, any>,
    )
    Object.assign(component, cover)

    exclude.map((k) => {
      delete (component as Record<string, any>)[k]
    })

    // 新组件自带子组件的情况
    if (component.components && !exclude.includes('components')) {
      if (component.components && isSlottedCxComponentGroup(component.components)) {
        const newCmpts = Object.entries(component.components).reduce(
          (h, [k, v]) => {
            // @ts-ignore
            h[k] = (v || []).map((x) => cloneComponent(x, preserve))
            return h
          },
          {} as Record<string, CxComponentRuntime[]>,
        )
        component.components = newCmpts
      } else {
        throw new Error('deprecated')
      }
      // console.log("[debug]", component.key, component.components, newCmpts);
    }
    return component
  }

  // 从数据库保存的数据中重新生成标准组件数据结构
  const reInitComponent = (cmpt: CxComponentRuntime): CxComponentRuntime =>
    Object.assign(cloneComponent(cmpt, ['data', 'id', 'components', 'parents', 'sortn']), {
      _cx_inited: true,
    } as Record<string, any>)
  const reInitComponentDeep = <
    T =
      | CxComponentRuntime
      | CxComponentRuntime[]
      | CxComponentRuntime[][]
      | Record<string, CxComponentRuntime[]>,
  >(
    cmpts: T,
  ): T => {
    const newCmpts = isCxComponent(cmpts)
      ? // * is 'id' necessary?
        (cloneComponent(cmpts, ['data', 'id', 'components', 'parents', 'sortn']) as T)
      : isCxComponentGroup(cmpts)
        ? // @ts-ignore
          (cmpts.map((cmpt) => reInitComponentDeep(cmpt)) as T)
        : isCxComponentGroups(cmpts)
          ? // @ts-ignore
            (cmpts.map((group) => group.map((cmpt) => reInitComponentDeep(cmpt))) as T)
          : isSlottedCxComponentGroup(cmpts)
            ? (Object.entries(cmpts).reduce(
                (h, [k, v]) => {
                  h[k] = (v || []).map((cmpt) => reInitComponentDeep(cmpt))
                  return h
                },
                {} as Record<string, CxComponentRuntime[]>,
              ) as T)
            : cmpts || ([] as T)
    return newCmpts
  }

  // 添加组件
  const addComponentSource = (opts: {
    // 待添加的组件
    cmpt: CxComponentRuntime // or string
    // 放置到哪个组件
    target: CxComponentRuntime
    // 放置到组件的哪个插槽
    slotKey: string
    // 放到目标位置（区域数组或组件）前或后
    position?: 'start' | 'end'
    // 放置的锚点位置，默认为放置到区域目标位置，
    // 如果锚点是组件，则放置到锚点的前或后
    anchor?: CxComponentRuntime

    // todo
    /* for internal use */
    // _cancels?: AnyFn[]
  }) => {
    // opts._cancels = opts._cancels || []

    opts.position = opts.position || 'end'
    const { target, slotKey, cmpt, position, anchor } = opts
    if (!target || !slotKey || !cmpt) {
      console.error('[ERR] target, slotKey, cmpt is required')
      return null
    }
    const toAddCmpt = isCxComponent(cmpt) ? cmpt : createComponent(cmpt)
    // console.log('[debug] addComponent', target, slotKey, toAddCmpt)
    if (!toAddCmpt) {
      return null
    } else {
      opts.cmpt = toAddCmpt as CxComponentRuntime
    }

    target.components = target.components || {}
    if (isSlottedCxComponentGroup(target.components)) {
      target.components[slotKey] = target.components[slotKey] || []
      if (!anchor) {
        // add to slot
        if (position === 'start') {
          const compareSortCmpt = target.components[slotKey][0]
          // const oSortn = toAddCmpt.sortn
          const nSortn = preIndex(compareSortCmpt?.sortn)
          // opts._cancels.push(() => {
          // toAddCmpt.sortn = oSortn
          // })
          toAddCmpt.sortn = nSortn
          target.components[slotKey].unshift(toAddCmpt)
        } else if (position === 'end') {
          const compareSortCmpt = target.components[slotKey][target.components[slotKey].length - 1]
          // const oSortn = toAddCmpt.sortn
          const nSortn = nextIndex(compareSortCmpt?.sortn)
          // opts._cancels.push(() => {
          // toAddCmpt.sortn = oSortn
          // })
          toAddCmpt.sortn = nSortn
          target.components[slotKey].push(toAddCmpt)
        }
      } else {
        // add to anchor
        const idx = target.components[slotKey].findIndex((x) => x.id === anchor.id)
        const anchorCmpt = target.components[slotKey]?.[idx]
        if (!anchorCmpt) {
          throw new Error('[ERR] anchor not found')
        }
        if (position === 'start') {
          const compareSortCmpt = target.components[slotKey][idx - 1]
          // const oSortn = toAddCmpt.sortn
          const nSortn = insertIndex(compareSortCmpt?.sortn, anchorCmpt?.sortn)
          // opts._cancels.push(() => {
          // toAddCmpt.sortn = oSortn
          // })
          toAddCmpt.sortn = nSortn as string
          target.components[slotKey].splice(idx, 0, toAddCmpt)
          // console.log('[debug] addComponent', target, slotKey, toAddCmpt)
        } else if (position === 'end') {
          const compareSortCmpt = target.components[slotKey][idx + 1]
          // const oSortn = toAddCmpt.sortn
          const nSortn = insertIndex(anchorCmpt?.sortn, compareSortCmpt?.sortn)
          // opts._cancels.push(() => {
          // toAddCmpt.sortn = oSortn
          // })
          toAddCmpt.sortn = nSortn as string
          target.components[slotKey].splice(idx + 1, 0, toAddCmpt)
          // console.log('[debug] addComponent end', target, slotKey, toAddCmpt)
        }
        if (!target.components[slotKey]?.length) {
          opts.anchor = undefined
        } else {
          opts.anchor =
            opts.position === 'start'
              ? target.components[slotKey][idx]
              : target.components[slotKey][idx + 1]
        }
      }
    } else {
      throw new Error('deprecated')
    }

    if (!toAddCmpt.parents) {
      toAddCmpt.parents = []
    }
    toAddCmpt.parents.push(target.id)

    return opts
  }
  const addComponent = useHooks(addComponentSource)

  /**
   * 将组件转化成另一种类型的组件
   * cmpt.components 不会被转换
   */
  const transformComponentSource = (opts: {
    cmpt: CxComponentRuntime
    from: CxComponentRuntime['key']
    to: CxComponentRuntime['key']
    force?: boolean
    datas?: CxComponentRuntime['data']

    /** for internal use */
    _oldDatas?: CxComponentRuntime['data']
  }) => {
    if (typeof opts.force !== 'boolean') {
      opts.force = false
    }
    if (!opts.cmpt && (opts.cmpt as any).key !== opts.from) {
      throw new Error('invalid args')
    }

    const fromCmptMeta = utils.getMeta(opts.cmpt)
    const newCmpt = createComponent(opts.to)
    const newCmptMeta = utils.getMeta(newCmpt)
    const newCmptData = utils.getData(newCmpt)

    const fromKeys = Object.keys(fromCmptMeta.props || {})

    if (opts.force) {
      // ! check events
      opts._oldDatas = Object.entries(opts.cmpt.data as Record<string, any>).reduce(
        (h, [k, v]) => {
          h[k] = v
          return h
        },
        {} as Record<string, any>,
      )
      const toKeys = Object.keys(opts.datas as Record<string, any>)
      Object.entries(opts.datas as Record<string, any>).map(([k, v]) => {
        ;(opts.cmpt.data as Record<string, any>)[k] = v
      })
      const toResetKeys = fromKeys.filter((x) => !toKeys.includes(x))
      toResetKeys.map((k) => {
        delete opts.cmpt.data[k]
      })
      // 组件初始化时会初始化一部分数据，就算这部分数据如果没有被强制设置，
      // 也应该在新组件中保留
      Object.keys(newCmptData).map((initWithKey) => {
        if (!toKeys.includes(initWithKey)) {
          opts.cmpt.data[initWithKey] = newCmptData[initWithKey]
        }
      })
    } else {
      const toKeys = Object.keys(newCmptMeta.props || {})
      // ! check
      const isSameKeys =
        fromKeys.length === toKeys.length &&
        fromKeys.every((x) => toKeys.includes(x)) &&
        toKeys.every((x) => fromKeys.includes(x))
      if (!isSameKeys) {
        console.group('[ERR] 属性不能完全匹配，不能自动转换')
        console.log('[info] from keys names:', fromKeys)
        console.log('[info] to keys names:', toKeys)
        console.groupEnd()
        throw new TypeError('[ERR] wrong transformation due to incompatible keys')
      }
    }
    metaKeys.map((k) => {
      ;(opts.cmpt as Record<string, any>)[k] = (newCmpt as Record<string, any>)[k]
    })

    return opts
  }
  const transformComponent = useHooks(transformComponentSource)

  transformComponent.cancel((args: any) => {
    const isForce = (args as any).args[0].force
    const cmpt = args.args[0].cmpt
    if (!isForce) {
      const meta = utils.getMeta(args.args[0].from)
      for (const k in metaKeys) {
        cmpt[k] = meta[k]
      }
    } else {
      const oldDatas = args.args[0]._oldDatas || {}
      cmpt.data = Object.entries(oldDatas).reduce(
        (h, [k, v]) => {
          h[k] = v
          return h
        },
        {} as Record<string, any>,
      )
      for (const k in metaKeys) {
        cmpt[k] = args.args[0].cmpt[k]
      }
    }
  })

  // 移除组件
  // 也许可以在删除组件时重置 sorts（sorts 如果使用 decimal 的话，分裂次数过多会导致 sortn 数据过长）
  const removeComponentSource = (opts: {
    from: CxComponentRuntime
    remove: CxComponentRuntime
    slotKey?: string
    position?: Parameters<typeof addComponentSource>[0]['position']
    anchor?: Parameters<typeof addComponentSource>[0]['anchor']
  }) => {
    // console.log('[debug] removeComponentSource', cx)

    if (!opts.remove) {
      throw new Error('nothing to remove')
    }

    const removeFrom = (from: CxComponentRuntime) => {
      const { remove, slotKey = '' } = opts
      const childs = from.components
      const isTarget = (cmpt: CxComponentRuntime) => cmpt.id === remove.id
      // return console.log('[debug] removeComponent', from, remove, slotKey)

      if (isSlottedCxComponentGroup(childs)) {
        const removeFromSlot = (slotKey: string) => {
          const group = childs[slotKey]
          if (group) {
            let idx
            if (opts.position && opts.anchor) {
              const optsIDX = group.findIndex((x) => x.id === opts.anchor!.id)
              idx = optsIDX > -1 ? (opts.position === 'start' ? optsIDX : optsIDX + 1) : -1
            } else {
              idx = group.findIndex(isTarget)
              if (group.length === 1) {
                opts.position = 'start'
                opts.anchor = undefined
              } else {
                opts.position = idx === 0 ? 'start' : 'end'
                opts.anchor = group[idx - 1]
              }
            }
            if (idx > -1) {
              group.splice(idx, 1)
              return slotKey
            }
          }
          return false
        }
        // * 没有指定 slotKey，需要从父组件中查找哪个 slot 中包含了要移除的组件
        if (!slotKey) {
          const findSlots = Object.keys(childs)
            .map((x) => {
              if (childs[x]!.some(isTarget)) {
                return { key: x }
              }
            })
            .filter(Boolean)
          // console.log('[debug] findSlots', findSlots)
          if (findSlots.length > 1) {
            console.error(
              '[error] component should not be in multiple slots at the same cxComponentRuntime',
            )
          }
          if (!findSlots?.[0]?.key) {
            throw new Error('[ERR] component not found in slots')
          }
          opts.slotKey = findSlots[0].key
        }
        removeFromSlot(opts.slotKey!)
      } else {
        throw new Error('deprecated')
      }

      if (remove.parents) {
        const idx = remove.parents.findIndex((x) => x === from.id)
        if (idx > -1) {
          remove.parents.splice(idx, 1)
        }
      }
    }

    opts.from ? removeFrom(opts.from) : cx.datas.clearTree()

    return opts
  }
  const removeComponent = useHooks(removeComponentSource)

  addComponent.cancel((opts: any) => {
    const _added = unref(opts.result)
    if (_added) {
      removeComponentSource({
        from: _added.target,
        remove: _added.cmpt,
        slotKey: _added.slotKey,
        position: _added.position,
        anchor: _added.anchor,
      })
    }
  })

  removeComponent.cancel((opts: any) => {
    // return console.log('[debug] removeComponent.cancel opts, remove me if nothing goes wrong', opts)
    const _removed = unref(opts.result)
    if (_removed) {
      addComponentSource({
        cmpt: _removed.remove,
        target: _removed.from,
        slotKey: _removed.slotKey,
        position: _removed.position,
        anchor: _removed.anchor,
      })
    }
  })

  const moveComponentSource = (opts: {
    // 从哪个组件移动
    // TODO optional
    from: CxComponentRuntime
    // 移动哪个组件
    target: CxComponentRuntime
    // 移动到哪个组件
    to: CxComponentRuntime
    // 移动到哪个区域
    slotKey: string
    // addComponent.position
    position?: Parameters<typeof addComponentSource>[0]['position']
    // addComponent.anchor
    anchor?: Parameters<typeof addComponentSource>[0]['anchor']
    // 复制组件而不是移动组件
    isCopy?: boolean
    isDeep?: boolean

    /* for internal use */
    _removed?: ReturnType<typeof removeComponentSource>
    _added?: ReturnType<typeof addComponentSource>
  }) => {
    const { isCopy = false, isDeep = false } = opts

    opts.target = isCopy
      ? cloneComponent(opts.target, isDeep ? ['data', 'components'] : ['data'])
      : opts.target

    const { from, target, to, slotKey } = opts

    if (!isCopy) {
      opts._removed = removeComponentSource({
        from,
        remove: target,
      })
    }

    opts._added = addComponentSource({
      cmpt: target,
      target: to,
      slotKey,
      position: opts.position,
      anchor: opts.anchor,
    })
    // throw new Error('test')

    return opts
  }
  const moveComponent = useHooks(moveComponentSource, (): any => ({
    _removed: null,
    _added: null,
    isCopy: false,
  }))
  const pasteComponent = useHooks(moveComponentSource, (): any => ({
    _removed: null,
    _added: null,
    isCopy: true,
  }))

  moveComponent.cancel((opts: any) => {
    console.log('[debug] moveComponent.cancel opts', opts)
    const _removed = unref(opts.args[0]._removed)
    if (_removed) {
      addComponentSource({
        cmpt: _removed.remove,
        target: _removed.from,
        slotKey: _removed.slotKey,
        position: _removed.position,
        anchor: _removed.anchor,
      })
    }
    const _added = unref(opts.args[0]._added)
    if (_added) {
      removeComponentSource({
        from: _added.target,
        remove: _added.cmpt,
        slotKey: _added.slotKey,
        position: _added.position,
        anchor: _added.anchor,
      })
    }
  })

  /**
   * 计算组件在父组件中的位置，
   * @params cmpt 组件
   * @params parent 直接父组件
   */
  const calcInParentPosition = (cmpt: CxComponentRuntime, parent: CxComponentRuntime) => {
    if (isSlottedCxComponentGroup(parent.components)) {
      const slotKey = Object.entries(parent.components).find(([_k, v]) =>
        v.some((x) => x.id === cmpt.id),
      )?.[0]
      const index = slotKey ? parent.components[slotKey]?.findIndex((x) => x.id === cmpt.id) : -1
      return { slotKey, index }
    } else {
      throw new Error('deprecated')
    }
  }

  /**
   * 从运行时数据结构转换为结构化数据结构，以便保存到数据库或其他传输
   */
  const toStructured = (cmpt: CxComponentRuntime): CxComponentStructured => {
    // const newCmpt = cloneDeep(cmpt) as CxComponentRuntime
    const cmptRes = pick(cmpt, [
      'id',
      'name',
      'data',
      'key',
      'parents',
      'sortn',
    ]) as CxComponentStructured
    if (cmptRes.sortn) {
      cmptRes.sortn = cmptRes.sortn.toString()
    }
    return cmptRes
  }

  return {
    calcName,
    calcDataConfigs,
    parseDataBind,
    calcSlots,
    calcChildren,
    calcRoot,
    removeSlot,

    createComponent,
    cloneComponent,
    reInitComponent,
    reInitComponentDeep,

    addComponent,
    transformComponent,
    removeComponent,
    moveComponent,
    pasteComponent,
    calcInParentPosition,
    toStructured,
  }
}

export type CxRuntimeUtils = ReturnType<typeof createCxRuntimeUtils>
