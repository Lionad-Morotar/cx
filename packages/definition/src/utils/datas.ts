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
  [key: string]: any
}

// todo 提供判断组件层级的方法，不然每次要调用 touch 计算，性能不行
export const createCxDatas = (cx: CxLoaderInstance) => {
  const clean = useCleanups()

  // 组件树
  const cmptsTree = ref([] as CxComponentRuntime[])
  const clearTree = () => {
    cmptsTree.value = []
    cmpts.value = []
    root.value = null
    cmpts.value._cx_inited = false
    clean.cleanup()
  }

  // 转化组件树需要用到的临时状态，如组件列表，组件 id map 等
  const useCmptList = (cmpts: CxStoredComponent[]) => {
    const tempCmptList = cmpts as CxStoredComponent[]
    const tempCmptsIdMap = tempCmptList.reduce(
      (acc, x) => {
        acc[x.id] = x
        return acc
      },
      {} as Record<string, CxStoredComponent>,
    )
    const checkInTempCmptsIdMap = (id: string) => tempCmptsIdMap[id]
    return {
      tempCmptList,
      tempCmptsIdMap,
      checkInTempCmptsIdMap,
    }
  }

  // 把新的组件列表转换为组件树
  const makeCxTree = (newCmpts: MaybeRef<CxStoredComponent[]>) => {
    const treeState = useCmptList(unref(newCmpts) || [])
    cmptsTree.value = makeTree(treeState)
    // console.trace('[info] makeCxTree', cmptsTree.value)
    return cmptsTree
  }
  tryOnScopeDispose(() => {
    clearTree()
  })
  // 把新的组件列表附加并转化到现有组件树上
  const attachCxTree = (newCmpts: MaybeRef<CxStoredComponent[]>, toCmpt: CxComponentRuntime) => {
    // console.log('[debug] attachCxTree', newCmpts, toCmpt)
    if (!unref(newCmpts)?.length) {
      return cmptsTree
    } else {
      toCmpt = cmptsIdMap.value[toCmpt.id]!
      if (!toCmpt) {
        throw new Error(`[ERR] toCmpt not found`)
      }
      const subTreeState = useCmptList(unref(newCmpts) || [])
      const subTreeCmpts = makeTree(subTreeState)
      // 改变 toCmpt 的 components 会重新触发 cmpts 和 吹灭同IDMap 计算，所以不用重新 makeTree
      toCmpt.components = {
        default: subTreeCmpts,
      }
      subTreeCmpts.map((cmpt) => {
        cmpt.parents = [toCmpt.id]
      })
    }
  }
  const clearCxTree = (toCmpt: CxComponentRuntime) => {
    toCmpt = cmptsIdMap.value[toCmpt.id]!
    if (!toCmpt) {
      throw new Error(`[ERR] toCmpt not found`)
    }
    cx.utils.touch(toCmpt, (cmpt) => {
      if (cmpt.parents?.includes(toCmpt.id)) {
        cmpt.parents = cmpt.parents.filter((x: string) => x !== toCmpt.id)
      }
    })
    toCmpt.components = {}
  }

  const root = ref(null) as Ref<CxComponentRuntime | null>
  const cmpts = ref([]) as Ref<
    CxComponentRuntime[] & {
      _cx_inited?: boolean
    }
  >
  const cmptsIdMap = ref<Record<string, CxComponentRuntime>>({})

  watch(cmptsTree, (_tree) => {
    clean.cleanup()
    if (!_tree?.length) return

    // console.log('[debug] reCalc cmpts list')
    const list = ref(new Set() as Set<CxComponentRuntime>)
    clean.add(list.value.clear)
    const follow = (cmpt: CxComponentRuntime) => {
      list.value.add(cmpt)
      // watch cmpt.id
      clean.add(
        watchImmediate(
          () => cmpt?.id,
          (nv, ov) => {
            if (nv && ov && nv !== ov) {
              cmptsIdMap.value[nv] = cmpt
              delete cmptsIdMap.value[ov]
            }
          },
        ),
      )
      // watch cmpt.components
      clean.add(
        watchImmediate(
          () => {
            return (Object.values(cmpt?.components || {}).flat(Infinity) as CxComponentRuntime[])
              .map((x) => x.id)
              .join(':')
          },
          (nv = '', ov = '') => {
            const oldIDs = ov.split(':')
            const newIDs = nv.split(':')

            const removedIDs = oldIDs.filter((x) => !newIDs.includes(x))
            removedIDs.map((id) => {
              useMacroTask(() => {
                if (list.value.has(cmptsIdMap.value[id]!)) {
                  list.value.delete(cmptsIdMap.value[id]!)
                }
              })
            })

            if (newIDs.length) {
              ;(Object.values(cmpt?.components || {}).flat(Infinity) as CxComponentRuntime[]).map(
                (x) => {
                  follow(x)
                },
              )
            }
          },
        ),
      )
    }
    cmptsTree.value.map((cmpt) => {
      cx.utils.touch(cmpt, follow)
    })
    clean.add(
      watchImmediate(
        () => list.value?.size,
        (_size) => {
          cmpts.value = [...list.value]
          cmptsIdMap.value = cmpts.value.reduce(
            (acc, x) => {
              acc[x.id] = x
              return acc
            },
            {} as Record<string, CxComponentRuntime>,
          )
          // console.log('[debug] reCalc cmpts value', _size, cmptsIdMap.value)

          root.value = cmpts.value[0] || null
          cmpts.value._cx_inited = true
        },
      ),
    )
  })

  function makeTree(treeState: ReturnType<typeof useCmptList>) {
    const { tempCmptList, tempCmptsIdMap, checkInTempCmptsIdMap } = treeState

    if (!tempCmptList.length) return []
    // console.log('[info] makeTree', tempCmptList.length, tempCmptList, tempCmptsIdMap)

    const res = tempCmptList
      // validate
      .filter((cmpt) => {
        if (!cmpt.key) console.error('[ERR] no key in cmpt, skip', cmpt)
        return cmpt.key
      })
      // wash
      .map((cmpt) => {
        cmpt.sortn = (cmpt as any).sortnStr
        return cmpt as CxStoredComponent
      })

      // sort
      // place root cmpt(no parent) first
      // order by sortn
      .sort((a, b) => {
        if (!a.parent && b.parent) return -1
        if (a.parent && !b.parent) return 1
        if (BigNumber(a.sortn as string).isEqualTo(BigNumber(b.sortn as string))) return 0
        return BigNumber(a.sortn as string).isLessThan(BigNumber(b.sortn as string)) ? -1 : 1
      })
      // add cmpt to parent
      .map((cmpt) => {
        // console.log('[info] cmpt', cmpt.id, cmpt.key)
        if (cmpt.parent?.id) {
          const parent = tempCmptsIdMap[cmpt.parent.id] as unknown as CxComponentRuntime
          const slotKey = cmpt.slot || 'default'
          if (parent) {
            parent.components = (parent.components || {}) as Record<string, CxComponentRuntime[]>
            if (!parent.components[slotKey]) {
              parent.components[slotKey] = []
            }
            const slot = parent.components[slotKey] || []
            if (!slot?.length) {
              slot.push(cmpt as unknown as CxComponentRuntime)
            } else {
              if (slot.some((x) => x.id === cmpt.id)) {
                return cmpt
              }
              // const sorts = slot.map(x => x.sortn)
              /**
               * 排序顺序
               * 1. sortn 较小的在前
               * 2. sortn 相同的，先来后到
               */
              const insertIndex = slot.findLastIndex((x: CxComponentRuntime) =>
                checkLEIndexThan(x.sortn, cmpt.sortn),
              )
              if (insertIndex === -1) {
                slot.unshift(cmpt as unknown as CxComponentRuntime)
              } else {
                slot.splice(insertIndex + 1, 0, cmpt as unknown as CxComponentRuntime)
              }
              // console.log(cmpt.key, cmpt.sortn, '->', sorts, insertIndex)
            }
            ;(cmpt as unknown as CxComponentRuntime).parents = [parent.id]
          } else {
            // todo use retry
            // https://github.com/Shinigami92/vueuse/blob/e134d5e72241a797a24b98eb10eb084aabb9227d/packages/core/useRetry/index.ts
            console.error('[ERR] parent not found', cmpt)

            // * for debug
            const root = tempCmptList.find((x) => !x.parent)
            const anySlot = Object.keys(root?.components || {})[0]
            if (anySlot) {
              root!.components![anySlot]!.push(cmpt as unknown as CxComponentRuntime)
              cmpt.parents = [root!.id]
            }
          }
        }
        return cmpt
      })
      // remove un-parented cmpts, only capable with slotted cmpt.components, for example,
      // { key: 'cx-page', components: { default: [] } }
      .map((_cmptAny: any) => {
        const cmpt = _cmptAny as CxComponentRuntime & CxStoredComponent
        // console.log('[debug] cmpt', cx)
        if (!cx.utils.isSlottedCxComponentGroup(cmpt.components)) {
          return cmpt
        }
        Object.entries(cmpt.components!).map(([slotKey, slotCmpts]) => {
          const cmptsInSlot = (slotCmpts || []) as CxComponentRuntime[]
          cmptsInSlot.map((cmptInSlot) => {
            if (checkInTempCmptsIdMap(cmptInSlot.id)) return
            // remove un-parented cmpts
            const idx = cmpt.components![slotKey]!.findIndex((x: CxComponentRuntime) => {
              return x.id === cmptInSlot.id
            })
            if (idx > -1) {
              cmpt.components![slotKey]!.splice(idx, 1)
            }
          })
        })
        return cmpt
      })
      .filter((x) => !x.parent) as CxComponentRuntime[]

    const ret = cx.utils.reInitComponentDeep(res)

    return ret
  }

  return {
    root,
    cmpts,
    clearTree,
    makeCxTree,
    attachCxTree,
    clearCxTree,
    cmptsTree,
    cmptsIdMap,
  }
}

export type CxDatas = ReturnType<typeof createCxDatas>
