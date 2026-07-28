import type { CxComponentRuntime, CxLoaderInstance } from '../types'

import { useCleanups } from './cleanups'
import { useMacroTask } from './schedule'
import { checkLEIndexThan } from './number'
import { ref, unref, watch } from 'vue'
import type { MaybeRef, Ref } from 'vue'
import { tryOnScopeDispose, watchImmediate } from '@vueuse/core'
import BigNumber from 'bignumber.js'

/**
 * 组件的存储形态（数据库行结构），与运行时形态 CxComponentRuntime 相对。
 * 原为 edgedb 生成类型，抽离后按实际使用字段本地定义。
 */
export type CxStoredComponent = {
  id: string
  key: string
  /** 排序权重（原始为 sortnStr 字符串，wash 后挂到 sortn） */
  sortn?: string
  sortnStr?: string
  parent?: { id: string } | null
  slot?: string
  components?: Record<string, CxComponentRuntime[]>
  parents?: string[]
  /** 遗留动态字段（wash/挂载阶段写入），后续治理时收敛 */
  [key: string]: unknown
}

// todo 提供判断组件层级的方法，不然每次要调用 touch 计算，性能不行
export const createCxDatas = (cx: CxLoaderInstance) => {
  const clean = useCleanups()

  // 组件树
  const compsTree = ref([] as CxComponentRuntime[])
  const clearTree = () => {
    compsTree.value = []
    comps.value = []
    root.value = null
    comps.value._cx_inited = false
    clean.cleanup()
  }

  // 转化组件树需要用到的临时状态，如组件列表，组件 id map 等
  const useCompList = (comps: CxStoredComponent[]) => {
    const tempCompList = comps as CxStoredComponent[]
    const tempCompsIdMap = tempCompList.reduce(
      (acc, x) => {
        acc[x.id] = x
        return acc
      },
      {} as Record<string, CxStoredComponent>,
    )
    const checkInTempCompsIdMap = (id: string) => tempCompsIdMap[id]
    return {
      tempCompList,
      tempCompsIdMap,
      checkInTempCompsIdMap,
    }
  }

  // 把新的组件列表转换为组件树
  const makeCxTree = (newComps: MaybeRef<CxStoredComponent[]>) => {
    const treeState = useCompList(unref(newComps) || [])
    compsTree.value = makeTree(treeState)
    // console.trace('[info] makeCxTree', compsTree.value)
    return compsTree
  }
  tryOnScopeDispose(() => {
    clearTree()
  })
  // 把新的组件列表附加并转化到现有组件树上
  const attachCxTree = (newComps: MaybeRef<CxStoredComponent[]>, toComp: CxComponentRuntime) => {
    // console.log('[debug] attachCxTree', newComps, toComp)
    if (!unref(newComps)?.length) {
      return compsTree
    } else {
      toComp = compsIdMap.value[toComp.id]!
      if (!toComp) {
        throw new Error(`[ERR] toComp not found`)
      }
      const subTreeState = useCompList(unref(newComps) || [])
      const subTreeComps = makeTree(subTreeState)
      // 改变 toComp 的 components 会重新触发 comps 和 吹灭同IDMap 计算，所以不用重新 makeTree
      toComp.components = {
        default: subTreeComps,
      }
      subTreeComps.map((comp) => {
        comp.parents = [toComp.id]
      })
    }
  }
  const clearCxTree = (toComp: CxComponentRuntime) => {
    toComp = compsIdMap.value[toComp.id]!
    if (!toComp) {
      throw new Error(`[ERR] toComp not found`)
    }
    cx.utils.touch(toComp, (comp) => {
      if (comp.parents?.includes(toComp.id)) {
        comp.parents = comp.parents.filter((x: string) => x !== toComp.id)
      }
    })
    toComp.components = {}
  }

  const root = ref(null) as Ref<CxComponentRuntime | null>
  const comps = ref([]) as Ref<
    CxComponentRuntime[] & {
      _cx_inited?: boolean
    }
  >
  const compsIdMap = ref<Record<string, CxComponentRuntime>>({})

  watch(compsTree, (_tree) => {
    clean.cleanup()
    if (!_tree?.length) return

    // console.log('[debug] reCalc comps list')
    const list = ref(new Set() as Set<CxComponentRuntime>)
    clean.add(list.value.clear)
    const follow = (comp: CxComponentRuntime) => {
      list.value.add(comp)
      // watch comp.id
      clean.add(
        watchImmediate(
          () => comp?.id,
          (nv, ov) => {
            if (nv && ov && nv !== ov) {
              compsIdMap.value[nv] = comp
              delete compsIdMap.value[ov]
            }
          },
        ),
      )
      // watch comp.components
      clean.add(
        watchImmediate(
          () => {
            return (Object.values(comp?.components || {}).flat(Infinity) as CxComponentRuntime[])
              .map((x) => x.id)
              .join(':')
          },
          (nv = '', ov = '') => {
            const oldIDs = ov.split(':')
            const newIDs = nv.split(':')

            const removedIDs = oldIDs.filter((x) => !newIDs.includes(x))
            removedIDs.map((id) => {
              useMacroTask(() => {
                if (list.value.has(compsIdMap.value[id]!)) {
                  list.value.delete(compsIdMap.value[id]!)
                }
              })
            })

            if (newIDs.length) {
              ;(Object.values(comp?.components || {}).flat(Infinity) as CxComponentRuntime[]).map(
                (x) => {
                  follow(x)
                },
              )
            }
          },
        ),
      )
    }
    compsTree.value.map((comp) => {
      cx.utils.touch(comp, follow)
    })
    clean.add(
      watchImmediate(
        () => list.value?.size,
        (_size) => {
          comps.value = [...list.value]
          compsIdMap.value = comps.value.reduce(
            (acc, x) => {
              acc[x.id] = x
              return acc
            },
            {} as Record<string, CxComponentRuntime>,
          )
          // console.log('[debug] reCalc comps value', _size, compsIdMap.value)

          root.value = comps.value[0] || null
          comps.value._cx_inited = true
        },
      ),
    )
  })

  function makeTree(treeState: ReturnType<typeof useCompList>) {
    const { tempCompList, tempCompsIdMap, checkInTempCompsIdMap } = treeState

    if (!tempCompList.length) return []
    // console.log('[info] makeTree', tempCompList.length, tempCompList, tempCompsIdMap)

    const res = tempCompList
      // validate
      .filter((comp) => {
        if (!comp.key) console.error('[ERR] no key in comp, skip', comp)
        return comp.key
      })
      // wash
      .map((comp) => {
        comp.sortn = (comp as { sortnStr?: string }).sortnStr
        return comp as CxStoredComponent
      })

      // sort
      // place root comp(no parent) first
      // order by sortn
      .sort((a, b) => {
        if (!a.parent && b.parent) return -1
        if (a.parent && !b.parent) return 1
        if (BigNumber(a.sortn as string).isEqualTo(BigNumber(b.sortn as string))) return 0
        return BigNumber(a.sortn as string).isLessThan(BigNumber(b.sortn as string)) ? -1 : 1
      })
      // add comp to parent
      .map((comp) => {
        // console.log('[info] comp', comp.id, comp.key)
        if (comp.parent?.id) {
          const parent = tempCompsIdMap[comp.parent.id] as unknown as CxComponentRuntime
          const slotKey = comp.slot || 'default'
          if (parent) {
            parent.components = (parent.components || {}) as Record<string, CxComponentRuntime[]>
            if (!parent.components[slotKey]) {
              parent.components[slotKey] = []
            }
            const slot = parent.components[slotKey] || []
            if (!slot?.length) {
              slot.push(comp as unknown as CxComponentRuntime)
            } else {
              if (slot.some((x) => x.id === comp.id)) {
                return comp
              }
              // const sorts = slot.map(x => x.sortn)
              /**
               * 排序顺序
               * 1. sortn 较小的在前
               * 2. sortn 相同的，先来后到
               */
              const insertIndex = slot.findLastIndex((x: CxComponentRuntime) =>
                checkLEIndexThan(x.sortn, comp.sortn),
              )
              if (insertIndex === -1) {
                slot.unshift(comp as unknown as CxComponentRuntime)
              } else {
                slot.splice(insertIndex + 1, 0, comp as unknown as CxComponentRuntime)
              }
              // console.log(comp.key, comp.sortn, '->', sorts, insertIndex)
            }
            ;(comp as unknown as CxComponentRuntime).parents = [parent.id]
          } else {
            // todo use retry
            // https://github.com/Shinigami92/vueuse/blob/e134d5e72241a797a24b98eb10eb084aabb9227d/packages/core/useRetry/index.ts
            console.error('[ERR] parent not found', comp)

            // * for debug
            const root = tempCompList.find((x) => !x.parent)
            const anySlot = Object.keys(root?.components || {})[0]
            if (anySlot) {
              root!.components![anySlot]!.push(comp as unknown as CxComponentRuntime)
              comp.parents = [root!.id]
            }
          }
        }
        return comp
      })
      // remove un-parented comps, only capable with slotted comp.components, for example,
      // { key: 'cx-page', components: { default: [] } }
      .map((_compAny: unknown) => {
        const comp = _compAny as CxComponentRuntime & CxStoredComponent
        // console.log('[debug] comp', cx)
        if (!cx.utils.isSlottedCxComponentGroup(comp.components)) {
          return comp
        }
        Object.entries(comp.components!).map(([slotKey, slotComps]) => {
          const compsInSlot = (slotComps || []) as CxComponentRuntime[]
          compsInSlot.map((compInSlot) => {
            if (checkInTempCompsIdMap(compInSlot.id)) return
            // remove un-parented comps
            const idx = comp.components![slotKey]!.findIndex((x: CxComponentRuntime) => {
              return x.id === compInSlot.id
            })
            if (idx > -1) {
              comp.components![slotKey]!.splice(idx, 1)
            }
          })
        })
        return comp
      })
      .filter((x) => !x.parent) as CxComponentRuntime[]

    const ret = cx.utils.reInitComponentDeep(res)

    return ret
  }

  return {
    root,
    comps,
    clearTree,
    makeCxTree,
    attachCxTree,
    clearCxTree,
    compsTree,
    compsIdMap,
  }
}

export type CxDatas = ReturnType<typeof createCxDatas>
