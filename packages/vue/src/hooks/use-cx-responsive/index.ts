import type { breakPointOptions } from '@cx/hooks'
import { useElementSize } from '@vueuse/core'
import type { MaybeElementRef } from '@vueuse/core'

// import './index.css'

const breaks = {
  mobile: 375 + 1,
  tablet: 768 + 1,
  laptop: 1366 + 1,
  desktop: 1920 + 1
  // 2k: 1920,
} as Record<(typeof breakPointOptions)[number]['value'], number>

export const useCxBreakpoints = () => useBreakpoints(breaks)

export const cxPageBreakpoints = useCxBreakpoints()

/**
 * 根据当前组件宽度返回对应的断点类型
 */
export const useCxBreakpointType = (
  element?: MaybeElementRef,
  breakpoints?: ReturnType<typeof useCxBreakpoints>
) => {
  const cleanups = useCleanups()
  const type = ref<'' | (typeof breakPointOptions)[number]['value']>('')
  const width = ref(0)

  watch(
    () => [unref(element)],
    ([el]) => {
      cleanups.cleanup()
      if (!(el instanceof HTMLElement) || !el) {
        return
      }
      const { width: _w } = useElementSize(
        el,
        {
          width: 0,
          height: 0
        },
        {
          box: 'border-box'
        }
      )
      cleanups.add(watchEffect(() => {
        width.value = _w.value
      }))
    },
    { immediate: true }
  )

  // console.log('[debug] cxPageBreakpoints', breakpoints)

  watchEffect(() => {
    if (element) {
      type.value = ([
        (width.value && width.value < breaks.mobile) && 'mobile',
        (width.value >= breaks.mobile && width.value < breaks.tablet) && 'tablet',
        (width.value >= breaks.tablet && width.value < breaks.laptop) && 'laptop',
        (width.value >= breaks.laptop) && 'desktop'
      ] as const).filter(Boolean)?.[0] || ''
    } else if (breakpoints) {
      type.value = !unref(breakpoints.mobile)
        ? ''
        : !unref(breakpoints.tablet)
            ? 'mobile'
            : !unref(breakpoints.laptop)
                ? 'tablet'
                : !unref(breakpoints.desktop)
                    ? 'laptop'
                    : 'desktop'
    }
  }, {
    flush: 'sync'
  })

  tryOnScopeDispose(() => {
    cleanups.cleanup()
  })

  return type
}
