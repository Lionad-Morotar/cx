import {
  computed,
  nextTick,
  ref,
  reactive,
  unref,
  watch,
  watchEffect,
  onMounted,
  onUnmounted,
} from 'vue'
import { unrefElement, useKeyModifier } from '@vueuse/core'
import { onKeyStroke } from './'

import type { Ref } from 'vue'
import type { MaybeComputedElementRef, MaybeRef, MaybeElement, MaybeElementRef } from '@vueuse/core'

type Direction = 'all' | 'horizontal' | 'vertical'
type Keycode = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Enter' | 'Space' | 'Escape'

type Elems = MaybeRef<
  | MaybeElementRef
  | MaybeElementRef[]
  | MaybeElementRef[][]
  | MaybeComputedElementRef
  | MaybeComputedElementRef[]
  | MaybeComputedElementRef[][]
>
type Handlers = Record<string, (e: KeyboardEvent) => void>

const isCtrlOn = useKeyModifier('Control')
const isMetaOn = useKeyModifier('Meta')
const isCtrlOrMetaOn = computed(() => isCtrlOn.value || isMetaOn.value)

/**
 * 传入元素列表，使用方向键切换聚焦这些元素，使用回车或空格点击聚焦中的元素，
 * 此“聚焦”与原生聚焦不同。原生聚焦只作用于常见的表单元素如按钮、输入框等。
 * direction 语义：矩阵遍历的主轴方向
 */
export const createUseFocus = (direction: Direction) => (elems: Elems, hdls?: Handlers) => {
  const handlers = Object.assign(
    {
      escape: escHandler,
      enter: confirmHandler,
      space: confirmHandler,
      left: prevHandler,
      right: nextHandler,
      up: prevHandler,
      down: nextHandler,
      goThroghLeft: goThroughPrevandler,
      goThroghRight: goThroughNextHandler,
      goThroghUp: goThroughPrevandler,
      goThroghDown: goThroughNextHandler,
    },
    hdls || {},
  )

  const keyRecords = ref<Keycode[]>([])

  // 注意，elements 是二维数组结构
  const elements = normalizeElements(elems)
  const inFocusElement = ref<HTMLElement | null>(null)
  const inFocusElementArea = ref<HTMLElement[]>([])
  const inFocusElementAreaTemp = ref<HTMLElement[]>([])
  const findInUseFrom = (elems?: HTMLElement[]) => {
    if (!elems?.length) return null
    const elem = elems.find((x) => x) || null
    if (elem) {
      inFocusElementAreaTemp.value = elems
    }
    return elem
  }

  const skipElements = ref<Set<Ref<HTMLElement[][]>>>(new Set())
  const shouldSkip = (elm: HTMLElement) =>
    [...skipElements.value].find((elms) => unref(elms).find((x) => x.find((y) => y === elm)))
  onUnmounted(() => skipElements.value.clear())

  const goThroughElements = ref<Set<Ref<HTMLElement[][]>>>(new Set())
  const shouldGoThrough = (elm: HTMLElement) =>
    [...goThroughElements.value].find((elms) => unref(elms).find((x) => x.find((y) => y === elm)))
  onUnmounted(() => goThroughElements.value.clear())

  // console.log("[debug] elements:", elements);

  const curSubParents = ref<HTMLElement[]>([])
  const curSubParent = computed(() => curSubParents.value[curSubParents.value.length - 1])
  const isFocusingSub = computed(() => !!curSubParent.value)
  const quitSubFocus = () => curSubParents.value.pop()

  const subFocusMap = ref<Map<HTMLElement, Ref<{ direction: Direction; subs: HTMLElement[][] }>>>(
    new Map(),
  )
  const subElements = computed(() => {
    const record = isFocusingSub.value
      ? subFocusMap.value.get(curSubParent.value!)
      : subFocusMap.value.get(inFocusElement.value!)
    if (record) {
      return record.value.subs
    } else {
      return []
    }
  })
  onUnmounted(() => subFocusMap.value.clear())

  const findParentOfSubElements = (elm: HTMLElement) => {
    return (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [...subFocusMap.value].find(([_, v]) =>
        unref(v).subs.find((x) => x.find((y) => y === elm)),
      )?.[0] || null
    )
  }
  const isFocusHasSubElements = computed(() => {
    const record = subFocusMap.value.get(inFocusElement.value!)
    return record && record?.value?.subs?.length > 0
  })
  const focusSubElement = () => {
    if (inFocusElement.value && subElements.value.length > 0) {
      curSubParents.value.push(inFocusElement.value)
      inFocusElement.value = findInUseFrom(subElements.value[0])
    }
  }

  const activeDirection = computed(() => {
    if (isFocusingSub.value) {
      const record = isFocusingSub.value
        ? subFocusMap.value.get(curSubParent.value!)
        : subFocusMap.value.get(inFocusElement.value!)
      return record?.value?.direction || null
    } else {
      return direction
    }
  })

  // *
  watch(inFocusElement, async (focus, lastFocus) => {
    // console.log("[debug] focus & last", focus, lastFocus);

    if (lastFocus) {
      lastFocus?.classList?.remove?.('is-focus__useFocus')
      lastFocus?.blur?.()
    }

    if (focus) {
      if (shouldSkip(focus)) {
        await nextTick()
        if (!activeDirection.value) {
          console.warn('[WARN] "direction" is not set, skip by default.')
          return
        }
        const lastEffectedKey = keyRecords.value[keyRecords.value.length - 1]
        if (!lastEffectedKey) return
        const nextHandlerMap = {
          all: {
            ArrowLeft: prevHandler,
            ArrowRight: nextHandler,
            ArrowUp: prevHandler,
            ArrowDown: nextHandler,
          },
          horizontal: {
            ArrowLeft: prevHandler,
            ArrowRight: nextHandler,
          },
          vertical: {
            ArrowUp: prevHandler,
            ArrowDown: nextHandler,
          },
        } as Record<Direction, Record<Keycode, () => void>>
        const dir = activeDirection.value
        if (!dir) return
        const next = nextHandlerMap[dir]?.[lastEffectedKey]
        if (next) {
          next()
        }
        return
      }
      if (shouldGoThrough(focus)) {
        await nextTick()
        if (isFocusHasSubElements.value) {
          focusSubElement()
        }
        return
      }

      focus?.classList?.add?.('is-focus__useFocus')
      focus?.focus?.()

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      focus?.scrollIntoViewIfNeeded?.({ behavior: 'smooth' })

      inFocusElementArea.value = inFocusElementAreaTemp.value
    } else {
      // if (inFocusElementArea.value.length) {
      //   const elem = findInUseFrom(inFocusElementArea.value);
      //   if (elem) {
      //     inFocusElement.value = elem;
      //   }
      // }
    }
  })

  // 直接聚焦到某个元素
  const focus = (elm?: MaybeElementRef) => {
    const target = unrefElement(elm) as HTMLElement
    if (!target) {
      return
    }
    const findInElms = elements.value.find((x) => x.find((y) => y === target))
    if (findInElms) {
      inFocusElement.value = target
      return
    }
    // * console.log(subFocusMap.value);
    const parentOfSub = findParentOfSubElements(target)
    if (parentOfSub) {
      curSubParents.value.push(parentOfSub)
      inFocusElement.value = target
    }
  }

  // 设置跳过某个元素
  const skip = (skips: Elems) => {
    const skipIn = normalizeElements(skips)
    skipElements.value.add(skipIn)
  }

  // 设置某个元素为可穿透元素，和跳过不同的是，
  // 如果当前元素有子元素，那么会进入子元素选中状态而不是直接跳过该元素
  const goThrough = (throughs: Elems) => {
    const goThroughIn = normalizeElements(throughs)
    goThroughElements.value.add(goThroughIn)
  }

  /**
   * **************************************************************** Key Event Manager
   */

  const findIndexFrom = (from = elements.value, target = inFocusElement.value!) => {
    const index = from.findIndex((x) => x.includes(target))
    return index
  }

  const findPrevFrom = (from = elements.value, target = inFocusElement.value!) => {
    const index = findIndexFrom(from, target)
    if (index > 0 && index <= from.length - 1) {
      const prev = findInUseFrom(from[index - 1])
      return prev
    }
    return null
  }

  const findNextFrom = (from = elements.value, target = inFocusElement.value!) => {
    const index = findIndexFrom(from, target)
    if (index < from.length - 1 && index >= 0) {
      const next = findInUseFrom(from[index + 1])
      return next
    }
    return null
  }

  const quit = () => {
    inFocusElement.value = null
    inFocusElementArea.value = []
  }

  /**
   * 1. 如果选中的是子元素，退出子元素选中状态
   * 2. 清空选中状态
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function escHandler(e: KeyboardEvent) {
    if (!inFocusElement.value) {
      return
    }
    if (isFocusingSub.value) {
      inFocusElement.value = quitSubFocus()!
    } else {
      quit()
    }
  }

  /**
   * 1. 点击选中元素
   * 2. 如果当前元素有子元素，则进入子元素选中状态
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function confirmHandler(e: KeyboardEvent) {
    if (!inFocusElement.value) {
      return
    }
    e.stopPropagation()
    e.stopImmediatePropagation()
    // 点击和回车事件都能触发按钮
    e.preventDefault()

    if (isFocusHasSubElements.value) {
      focusSubElement()
    } else {
      inFocusElement.value?.click()
    }
  }

  // 切换上一个需要聚焦的元素
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function prevHandler(e: KeyboardEvent) {
    if (!inFocusElement.value) {
      inFocusElement.value = findInUseFrom(elements.value[elements.value.length - 1])
    } else {
      if (isFocusingSub.value) {
        const index = findIndexFrom(subElements.value)
        const prev = findPrevFrom(subElements.value)
        if (prev) {
          inFocusElement.value = prev
          return
        }
        if (index === 0) {
          inFocusElement.value = quitSubFocus()!
        }
        return
      }
      const prev = findPrevFrom()
      if (prev) {
        inFocusElement.value = prev
      }
    }
  }

  // 切换下一个需要聚焦的元素
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function nextHandler(e: KeyboardEvent) {
    if (!inFocusElement.value) {
      inFocusElement.value = findInUseFrom(elements.value[0])
    } else {
      if (isFocusingSub.value) {
        const index = findIndexFrom(subElements.value)
        const next = findNextFrom(subElements.value)
        if (next) {
          inFocusElement.value = next
          return
        }
        if (index === subElements.value.length - 1) {
          inFocusElement.value = quitSubFocus()!
        }
        return
      }
      const next = findNextFrom()
      if (next) {
        inFocusElement.value = next
      }
    }
  }

  // 切换聚焦到当前子元素父元素的上一个元素
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function goThroughPrevandler(e: KeyboardEvent) {
    if (curSubParent.value) {
      const prev = findPrevFrom(elements.value, curSubParent.value)
      if (prev) {
        quitSubFocus()
        inFocusElement.value = prev
      }
    }
  }

  // 切换聚焦到当前子元素父元素的下一个元素
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function goThroughNextHandler(e: KeyboardEvent) {
    if (curSubParent.value) {
      const next = findNextFrom(elements.value, curSubParent.value)
      if (next) {
        quitSubFocus()
        inFocusElement.value = next
      }
    }
  }

  onMounted(() => {
    onKeyStroke(
      ['Escape'],
      (e) => {
        if (isCtrlOrMetaOn.value) return
        keyRecords.value.push('Escape')
        handlers?.preEscape?.(e)
        handlers?.escape?.(e)
        handlers?.postEscape?.(e)
      },
      {
        takeover: true,
      },
    )
    onKeyStroke(
      ['Enter'],
      (e) => {
        if (isCtrlOrMetaOn.value) return
        keyRecords.value.push('Enter')
        handlers?.preEnter?.(e)
        handlers?.enter?.(e)
        handlers?.postEnter?.(e)
      },
      {
        takeover: true,
      },
    )
    onKeyStroke(
      ['Space'],
      (e) => {
        if (isCtrlOrMetaOn.value) return
        keyRecords.value.push('Space')
        handlers?.preSpace?.(e)
        handlers?.space?.(e)
        handlers?.postSpace?.(e)
      },
      {
        takeover: true,
      },
    )
    onKeyStroke(
      ['ArrowLeft'],
      (e) => {
        if (isCtrlOrMetaOn.value) return
        if (!activeDirection.value) return
        keyRecords.value.push('ArrowLeft')

        if (!['all', 'horizontal'].includes(activeDirection.value)) {
          handlers?.goThroghLeft?.(e)
        } else {
          handlers?.preLeft?.(e)
          handlers?.left?.(e)
          handlers?.postLeft?.(e)
        }
      },
      {
        takeover: true,
      },
    )
    onKeyStroke(
      ['ArrowUp'],
      (e) => {
        if (isCtrlOrMetaOn.value) return
        if (!activeDirection.value) return
        keyRecords.value.push('ArrowUp')

        if (!['all', 'vertical'].includes(activeDirection.value)) {
          handlers?.goThroghUp?.(e)
        } else {
          handlers?.preUp?.(e)
          handlers?.up?.(e)
          handlers?.postUp?.(e)
        }
      },
      {
        takeover: true,
      },
    )
    onKeyStroke(
      ['ArrowRight'],
      (e) => {
        if (isCtrlOrMetaOn.value) return
        if (!activeDirection.value) return
        keyRecords.value.push('ArrowRight')

        if (!['all', 'horizontal'].includes(activeDirection.value)) {
          handlers?.goThroghRight?.(e)
        } else {
          handlers?.preRight?.(e)
          handlers?.right?.(e)
          handlers?.postRight?.(e)
        }
      },
      {
        takeover: true,
      },
    )
    onKeyStroke(
      ['ArrowDown'],
      (e) => {
        if (isCtrlOrMetaOn.value) return
        if (!activeDirection.value) return
        keyRecords.value.push('ArrowDown')

        if (!['all', 'vertical'].includes(activeDirection.value)) {
          handlers?.goThroghDown?.(e)
        } else {
          handlers?.preDown?.(e)
          handlers?.down?.(e)
          handlers?.postDown?.(e)
        }
      },
      {
        takeover: true,
      },
    )
  })

  function createUseSubFocus(direction: Direction) {
    return (elems: Elems, subs: Elems) => {
      const searchIn = normalizeElements(elems)
      const subElems = normalizeElements(subs)

      // console.log("[debug] elems", elems);

      onMounted(async () => {
        await nextTick()

        watchEffect(async () => {
          const focusedSubParents =
            searchIn.value.find((x) => x.find((y) => y === inFocusElement.value)) || []
          const focusedSubParent =
            focusedSubParents.find((x) => x === inFocusElement.value!) || null
          if (focusedSubParent) {
            const target =
              subFocusMap.value.get(focusedSubParent) ||
              ref({
                direction,
                subs: unref(subElems),
              })
            target.value.subs = unref(subElems)
            subFocusMap.value.set(focusedSubParent, target)
          }
          const unset = focusedSubParents.filter((x) => x !== focusedSubParent)
          unset.forEach((x) => subFocusMap.value.delete(x))
        })
      })
    }
  }
  const useSubFocus = createUseSubFocus(direction)
  // 命名沿用原语义（skip 列表的续航恢复）
  const useSubFocusAll = createUseSubFocus('all')
  const useSubFocusHorizontal = createUseSubFocus('horizontal')
  const useSubFocusVertical = createUseSubFocus('vertical')

  const states = reactive({
    target: inFocusElement,
    skip,
    focus,
    goThrough,
    quit,
    curSubParent,
    useSubFocus,
    useSubFocusAll,
    useSubFocusHorizontal,
    useSubFocusVertical,
  })

  return states
}

export const useFocus = createUseFocus('all')
export const useFocusHorizontal = createUseFocus('horizontal')
export const useFocusVertical = createUseFocus('vertical')

/**
 * 将传入的元素列表转换为二维数组
 */
function normalizeElements(elems: Elems): Ref<HTMLElement[][]> {
  const elements = ref([] as HTMLElement[][])

  // 初始化元素列表
  watchEffect(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const _elems = unref(elems) || []

    const isZeroDimention = !Array.isArray(_elems)
    const isSingleDimention =
      !isZeroDimention && !(_elems as Array<any>).find((elem) => Array.isArray(unref(elem)))
    elements.value = (
      isZeroDimention
        ? [[unrefElement(_elems as unknown as MaybeElementRef)]]
        : isSingleDimention
          ? (_elems as MaybeElementRef[]).map((elem) => [unrefElement(elem)])
          : (_elems as MaybeElementRef[][]).map((xs) =>
              Array.isArray(xs)
                ? (xs as unknown as MaybeElement[])?.map((elem) => unrefElement(elem))
                : unrefElement(xs),
            )
    ).filter((x) => x) as HTMLElement[][]
  })

  return elements
}
