import { getRect, getStyle } from '../../vue/dom'
import { useMacroTask } from '@lionad/cx-definition'
import type { WatchSource, MaybeRef } from 'vue'
import { ref } from 'vue'
import { watchEffect } from 'vue'
import { unref } from 'vue'
import { unrefElement } from '@vueuse/core'
import { watch } from 'vue'

type UseCxReRenderOptions = {
  withMargin?: boolean
}

// popper 配置项变化时重新渲染，并使用空 div 做占位防回流，
// 也许应该有 popper instance 的 API 可以直接调用？
export const useCxReRender = <T extends MaybeRef<HTMLElement>>(
  cmptRef: T,
  getter: WatchSource,
  opts: UseCxReRenderOptions = {},
) => {
  const isReRendering = ref(false)
  const size = ref({ width: '0', height: '0' })

  const notNormalElement = (elem: HTMLElement) => {
    const invalids = ['#text']
    return invalids.includes(elem.nodeName)
  }

  watchEffect(() => {
    const withMargin = opts?.withMargin || false

    const cmpt = unref(cmptRef) as HTMLElement
    // console.log('[debug] cmpt', cmpt)
    if (!cmpt) return
    let elem = unrefElement(cmpt)
    while (elem && notNormalElement(elem)) {
      elem = elem.nextElementSibling as HTMLElement
    }
    // console.log('[debug] elem', elem)
    if (!elem?.getBoundingClientRect) return

    const { width, height } = getRect(elem as HTMLElement)!
    if (!withMargin) {
      return (size.value = {
        width: `${width}px`,
        height: `${height}px`,
      })
    }

    const style = getStyle(elem as HTMLElement)
    const marginTop = parseInt(style?.marginTop || '0')
    const marginBottom = parseInt(style?.marginBottom || '0')
    const marginLeft = parseInt(style?.marginLeft || '0')
    const marginRight = parseInt(style?.marginRight || '0')

    // console.log('[debug]', { width, height, marginTop, marginBottom, marginLeft, marginRight })

    const w = width + marginLeft + marginRight
    const h = height + marginTop + marginBottom

    size.value = {
      width: `${w}px`,
      height: `${h}px`,
    }
  })

  watch(getter, async () => {
    isReRendering.value = true

    // for debug
    // await useSleep(1000 * 10)

    useMacroTask(() => (isReRendering.value = false))
  })

  return {
    isReRendering,
    size,
  }
}
