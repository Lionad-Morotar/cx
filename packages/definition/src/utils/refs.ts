import type { RefsManager } from '../types/runtime/cx-refs'
import { useSleep } from './schedule'
import { reactive, computed, toValue, ref } from 'vue'
import type { MaybeRefOrGetter, ComponentPublicInstance } from 'vue'
import { watchImmediate, tryOnScopeDispose } from '@vueuse/core'

type UseRefsOptions<T> = {
  defaultValue?: MaybeRefOrGetter<Partial<T>>
}

/**
 * component ref manager
 */
export function useRefs<T = Element | ComponentPublicInstance | Record<string, any>>(
  opts: UseRefsOptions<T> = {},
) {
  const { defaultValue } = Object.assign(
    {
      defaultValue: {},
    },
    opts,
  )

  const maps = reactive<Record<string, T>>({})
  const refs = computed(() => Object.values(maps))

  const set = (id: string, vm: T) => {
    maps[id] = vm
  }
  const get = (id: string) => maps[id]
  const remove = (id: string) => {
    delete maps[id]
  }

  const setRef = <G extends { id: string }>(item: G, ref: any, data?: Partial<T>) => {
    // console.log('ref', ref)
    const toSetData = Object.assign(toValue(defaultValue), data || {})
    set(
      item.id,
      reactive({
        id: item.id,
        item,
        ref,
        ...toSetData,
      }) as T,
    )
  }
  const removeRef = (item: { id: string }) => {
    remove(item.id)
  }

  const getData = (x: { id: string } | string) => {
    const target = typeof x === 'string' ? get(x) : get(x.id)
    return target
  }

  const clear = () => {
    for (const key in maps) {
      delete maps[key]
    }
  }

  /**
   * 判断是否所有组件都已经初始化
   * @warn
   *  1. 组件长度和组件ref需要放到 T 中，并且其属性名是固定的（isInited）
   *  2. 组件需要在 beforeMount 的时候调用 removeRef
   */
  const checkCmptsInited = (countNameInRef: string = 'total') => {
    const result = ref(false)
    watchImmediate(
      () => {
        // console.log('[debug] checkCmptsInited getter', refs.value.length, refs.value.map(x => {
        //   return (x as { ref: any }).ref?.isInited
        // }))
        return (
          refs.value.length &&
          refs.value.map((x) => {
            return (x as { ref: any }).ref?.isInited
          })
        )
      },
      async () => {
        // console.log(
        //   '[debug] checkCmptsInited result',
        //   refs.value.length,
        //   refs.value.map(x => {
        //     return (x as { ref: any }).ref?.isInited
        //   }),
        //   refs.value.map(x => {
        //     return (x as Record<typeof countNameInRef, number>)[countNameInRef] === refs.value.length
        //   }),
        //   refs.value.every(x => {
        //     return (x as { ref: any }).ref?.isInited
        //       && (x as Record<typeof countNameInRef, number>)[countNameInRef] === refs.value.length
        //   })
        // )
        await useSleep(1)
        result.value =
          refs.value.length > 0 &&
          refs.value.every((x) => {
            return (
              (x as { ref: any }).ref?.isInited &&
              (x as Record<typeof countNameInRef, number>)[countNameInRef] === refs.value.length
            )
          })
      },
      {
        deep: true,
      },
    )
    return result
  }

  tryOnScopeDispose(clear)

  const states = {
    maps,
    refs,
    set,
    remove,
    setRef,
    removeRef,
    get,
    getData,
    clear,
    getAll: () => refs.value,
    checkCmptsInited,
  }

  return states
}

export type RefsMan<T = Element> = RefsManager<any>
