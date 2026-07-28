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

  const calcName = (_comp: CxComponentRuntime): string => {
    if (!_comp) return ''
    const comp = toRaw(_comp)
    const meta = utils.getMeta(comp.key)
    const getName = meta?.getName
    return getName
      ? getName({
          comp: readonly(comp),
          data: readonly(comp?.data),
          cx: rCX,
        })
      : comp.data?._cx_name || meta.name
  }

  const calcDataConfigs = (
    _comp: CxComponentRuntime,
  ): CxComponentRuntime['data']['_cx_data_config'] => {
    if (!_comp) return {} as CxComponentRuntime['data']['_cx_data_config']
    const comp = toRaw(_comp)
    return comp.data?._cx_data_config || ({} as CxComponentRuntime['data']['_cx_data_config'])
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

  const calcSlots = (_comp: CxComponentRuntime | CxComponentMetaDefined) => {
    const comp = toRaw(_comp)
    const slotDefs = utils.getSlots(comp)
    const slots = isFunction(slotDefs)
      ? slotDefs({
          comp: readonly(comp),
          cx: rCX,
        })
      : slotDefs
    const normalizedSlots = (Array.isArray(slots) ? slots : Object.values(slots)).filter((slot) =>
      has(slot.key),
    )
    // console.log('[debug] calcSlots', comp?.key || comp, slots, normalizedSlots)
    return normalizedSlots as CxComponentSlot[]
  }

  /**
   * 计算组件的子组件列表（扁平）
   * @param comp CxComponentRuntime
   * @param slot CxCompSlot['key']
   * @param unsafe slot 可能不存在于当前组件，但存在于 comp.components[slot]，设置 unsafe 将会包含后者
   */
  const calcChildren = (
    _comp: CxComponentRuntime,
    slot?: CxComponentSlot['key'],
    unsafe?: boolean,
  ) => {
    const comp = toRaw(_comp)
    const allSlots = calcSlots(comp)
    const slots = allSlots.filter((x) => !slot || x.key === slot)
    if (unsafe && !allSlots.some((x) => x.key === slot)) {
      slots.push({
        key: slot!,
        name: 'unknown',
      })
    }
    return slots.reduce((h, c) => {
      const group = comp?.components?.[c.key] || []
      h = [...h, ...group]
      return h
    }, [] as CxComponentRuntime[])
  }

  // 计算某个组件的根节点
  const calcRoot = (_comp: CxComponentRuntime) => {
    const comp = toRaw(_comp)
    let parent = comp
    while (parent?.id) {
      // todo multi parents capable
      const curParent = unref(cx.datas.compsIdMap)[(parent as any).parents?.[0]]
      if (!curParent) {
        break
      }
      parent = curParent
      // console.log('[info] parent', parent)
    }
    return parent
  }

  // 删除插槽
  const removeSlot = (comp: CxComponentRuntime, slotKey: string) => {
    const comps = comp.components?.[slotKey] || []
    comps.map((x) =>
      removeComponent({
        from: comp,
        remove: x,
        slotKey,
      }),
    )
    delete (comp.components as Record<string, any>)[slotKey]
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
      throw new Error('needs component key, eg "cx-button"')
    }

    const data = utils.getData(key, initialData)

    // console.log('[info] data', data)
    const comp: CxComponentRuntime = {
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
    // components 会当作组件属性（comp.component）而不是数据属性（data.component）
    if (data.components) {
      comp.components = data.components
      delete data.components
    }

    if (component) {
      comp.components = component
    }

    // console.log('[debug] createComponent', comp)

    return comp
  }

  // 复制组件
  const cloneComponent = (
    comp: Partial<CxComponentRuntime | CxComponentStructured> & {
      key: CxComponentRuntime['key']
      components?: any
    },
    preserve: string[] = ['data'],
    exclude: string[] = [],
  ): CxComponentRuntime => {
    const component = createComponent(comp, cloneDeep(comp.data))
    const cover = preserve.reduce(
      (h, k) => {
        if (comp.components && k === 'components') {
          if (isSlottedCxComponentGroup(comp.components)) {
            h.components = Object.entries(comp.components).reduce(
              (slotGroup, [slotKey, slotComps]) => {
                slotGroup[slotKey] = slotComps.map((x) => cloneComponent(x, preserve))
                return slotGroup
              },
              {} as Record<string, CxComponentRuntime[]>,
            )
          } else {
            console.error('[ERR]', comp)
            throw new Error('deprecated')
          }
        } else {
          // @ts-ignore todo
          h[k] = cloneDeep(comp[k])
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
        const newComps = Object.entries(component.components).reduce(
          (h, [k, v]) => {
            // @ts-ignore
            h[k] = (v || []).map((x) => cloneComponent(x, preserve))
            return h
          },
          {} as Record<string, CxComponentRuntime[]>,
        )
        component.components = newComps
      } else {
        throw new Error('deprecated')
      }
      // console.log("[debug]", component.key, component.components, newComps);
    }
    return component
  }

  // 从数据库保存的数据中重新生成标准组件数据结构
  const reInitComponent = (comp: CxComponentRuntime): CxComponentRuntime =>
    Object.assign(cloneComponent(comp, ['data', 'id', 'components', 'parents', 'sortn']), {
      _cx_inited: true,
    } as Record<string, any>)
  const reInitComponentDeep = <
    T =
      | CxComponentRuntime
      | CxComponentRuntime[]
      | CxComponentRuntime[][]
      | Record<string, CxComponentRuntime[]>,
  >(
    comps: T,
  ): T => {
    const newComps = isCxComponent(comps)
      ? // * is 'id' necessary?
        (cloneComponent(comps, ['data', 'id', 'components', 'parents', 'sortn']) as T)
      : isCxComponentGroup(comps)
        ? // @ts-ignore
          (comps.map((comp) => reInitComponentDeep(comp)) as T)
        : isCxComponentGroups(comps)
          ? // @ts-ignore
            (comps.map((group) => group.map((comp) => reInitComponentDeep(comp))) as T)
          : isSlottedCxComponentGroup(comps)
            ? (Object.entries(comps).reduce(
                (h, [k, v]) => {
                  h[k] = (v || []).map((comp) => reInitComponentDeep(comp))
                  return h
                },
                {} as Record<string, CxComponentRuntime[]>,
              ) as T)
            : comps || ([] as T)
    return newComps
  }

  // 添加组件
  const addComponentSource = (opts: {
    // 待添加的组件
    comp: CxComponentRuntime // or string
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
    const { target, slotKey, comp, position, anchor } = opts
    if (!target || !slotKey || !comp) {
      console.error('[ERR] target, slotKey, comp is required')
      return null
    }
    const toAddComp = isCxComponent(comp) ? comp : createComponent(comp)
    // console.log('[debug] addComponent', target, slotKey, toAddComp)
    if (!toAddComp) {
      return null
    } else {
      opts.comp = toAddComp as CxComponentRuntime
    }

    target.components = target.components || {}
    if (isSlottedCxComponentGroup(target.components)) {
      target.components[slotKey] = target.components[slotKey] || []
      if (!anchor) {
        // add to slot
        if (position === 'start') {
          const compareSortComp = target.components[slotKey][0]
          // const oSortn = toAddComp.sortn
          const nSortn = preIndex(compareSortComp?.sortn)
          // opts._cancels.push(() => {
          // toAddComp.sortn = oSortn
          // })
          toAddComp.sortn = nSortn
          target.components[slotKey].unshift(toAddComp)
        } else if (position === 'end') {
          const compareSortComp = target.components[slotKey][target.components[slotKey].length - 1]
          // const oSortn = toAddComp.sortn
          const nSortn = nextIndex(compareSortComp?.sortn)
          // opts._cancels.push(() => {
          // toAddComp.sortn = oSortn
          // })
          toAddComp.sortn = nSortn
          target.components[slotKey].push(toAddComp)
        }
      } else {
        // add to anchor
        const idx = target.components[slotKey].findIndex((x) => x.id === anchor.id)
        const anchorComp = target.components[slotKey]?.[idx]
        if (!anchorComp) {
          throw new Error('[ERR] anchor not found')
        }
        if (position === 'start') {
          const compareSortComp = target.components[slotKey][idx - 1]
          // const oSortn = toAddComp.sortn
          const nSortn = insertIndex(compareSortComp?.sortn, anchorComp?.sortn)
          // opts._cancels.push(() => {
          // toAddComp.sortn = oSortn
          // })
          toAddComp.sortn = nSortn as string
          target.components[slotKey].splice(idx, 0, toAddComp)
          // console.log('[debug] addComponent', target, slotKey, toAddComp)
        } else if (position === 'end') {
          const compareSortComp = target.components[slotKey][idx + 1]
          // const oSortn = toAddComp.sortn
          const nSortn = insertIndex(anchorComp?.sortn, compareSortComp?.sortn)
          // opts._cancels.push(() => {
          // toAddComp.sortn = oSortn
          // })
          toAddComp.sortn = nSortn as string
          target.components[slotKey].splice(idx + 1, 0, toAddComp)
          // console.log('[debug] addComponent end', target, slotKey, toAddComp)
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

    if (!toAddComp.parents) {
      toAddComp.parents = []
    }
    toAddComp.parents.push(target.id)

    return opts
  }
  const addComponent = useHooks(addComponentSource)

  /**
   * 将组件转化成另一种类型的组件
   * comp.components 不会被转换
   */
  const transformComponentSource = (opts: {
    comp: CxComponentRuntime
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
    if (!opts.comp && (opts.comp as any).key !== opts.from) {
      throw new Error('invalid args')
    }

    const fromCompMeta = utils.getMeta(opts.comp)
    const newComp = createComponent(opts.to)
    const newCompMeta = utils.getMeta(newComp)
    const newCompData = utils.getData(newComp)

    const fromKeys = Object.keys(fromCompMeta.props || {})

    if (opts.force) {
      // ! check events
      opts._oldDatas = Object.entries(opts.comp.data as Record<string, any>).reduce(
        (h, [k, v]) => {
          h[k] = v
          return h
        },
        {} as Record<string, any>,
      )
      const toKeys = Object.keys(opts.datas as Record<string, any>)
      Object.entries(opts.datas as Record<string, any>).map(([k, v]) => {
        ;(opts.comp.data as Record<string, any>)[k] = v
      })
      const toResetKeys = fromKeys.filter((x) => !toKeys.includes(x))
      toResetKeys.map((k) => {
        delete opts.comp.data[k]
      })
      // 组件初始化时会初始化一部分数据，就算这部分数据如果没有被强制设置，
      // 也应该在新组件中保留
      Object.keys(newCompData).map((initWithKey) => {
        if (!toKeys.includes(initWithKey)) {
          opts.comp.data[initWithKey] = newCompData[initWithKey]
        }
      })
    } else {
      const toKeys = Object.keys(newCompMeta.props || {})
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
      ;(opts.comp as Record<string, any>)[k] = (newComp as Record<string, any>)[k]
    })

    return opts
  }
  const transformComponent = useHooks(transformComponentSource)

  transformComponent.cancel((args: any) => {
    const isForce = (args as any).args[0].force
    const comp = args.args[0].comp
    if (!isForce) {
      const meta = utils.getMeta(args.args[0].from)
      for (const k in metaKeys) {
        comp[k] = meta[k]
      }
    } else {
      const oldDatas = args.args[0]._oldDatas || {}
      comp.data = Object.entries(oldDatas).reduce(
        (h, [k, v]) => {
          h[k] = v
          return h
        },
        {} as Record<string, any>,
      )
      for (const k in metaKeys) {
        comp[k] = args.args[0].comp[k]
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
      const isTarget = (comp: CxComponentRuntime) => comp.id === remove.id
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
        remove: _added.comp,
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
        comp: _removed.remove,
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
      comp: target,
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
        comp: _removed.remove,
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
        remove: _added.comp,
        slotKey: _added.slotKey,
        position: _added.position,
        anchor: _added.anchor,
      })
    }
  })

  /**
   * 计算组件在父组件中的位置，
   * @params comp 组件
   * @params parent 直接父组件
   */
  const calcInParentPosition = (comp: CxComponentRuntime, parent: CxComponentRuntime) => {
    if (isSlottedCxComponentGroup(parent.components)) {
      const slotKey = Object.entries(parent.components).find(([_k, v]) =>
        v.some((x) => x.id === comp.id),
      )?.[0]
      const index = slotKey ? parent.components[slotKey]?.findIndex((x) => x.id === comp.id) : -1
      return { slotKey, index }
    } else {
      throw new Error('deprecated')
    }
  }

  /**
   * 从运行时数据结构转换为结构化数据结构，以便保存到数据库或其他传输
   */
  const toStructured = (comp: CxComponentRuntime): CxComponentStructured => {
    // const newComp = cloneDeep(comp) as CxComponentRuntime
    const compRes = pick(comp, [
      'id',
      'name',
      'data',
      'key',
      'parents',
      'sortn',
    ]) as CxComponentStructured
    if (compRes.sortn) {
      compRes.sortn = compRes.sortn.toString()
    }
    return compRes
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
