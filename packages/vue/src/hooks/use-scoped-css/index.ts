import { unref, watchEffect } from 'vue'
import { useStyleTag } from '@vueuse/core'
import cssParser from './css-parser'
import type { MaybeRef } from 'vue'

export const scopeCSS = (css: string, prefix?: string) => {
  if (css) {
    cssParser.reset()
    return cssParser.exec(css, prefix || '') as string
  } else {
    return ''
  }
}

const getTimeRecorder = () => {
  const instance = {
    id: Math.random().toString(36).slice(-3),
    time: performance.now(),
    getTime: () => performance.now(),
    recordParseTime: () => {
      const timeEnd = instance.getTime()
      const timeCost = Number(timeEnd - instance.time).toFixed(2)
      console.log(`[info:${instance.id}] parse time cost: ${timeCost}ms`)
    },
    recordRenderTime: () => {
      const timeEnd = instance.getTime()
      const timeCost = Number(timeEnd - instance.time).toFixed(2)
      console.log(`[info:${instance.id}] render time cost: ${timeCost}ms`)
    },
    done: () => {
      instance.recordParseTime()
      setTimeout(instance.recordRenderTime, 0)
    },
  }
  return instance
}

/**
 * runtime css parser, scope selectors,
 * to make content safe,
 * also avoid style conflict
 */
export const useScopedCSS = (id: string, unScoped: MaybeRef<string>, prefix?: MaybeRef<string>) => {
  const { css } = useStyleTag('', { id })
  watchEffect(() => {
    try {
      const record = getTimeRecorder()
      css.value = scopeCSS(unref(unScoped), unref(prefix))
      record.done()
      // * for debug
      // console.log('-----------', css.value)
    } catch (e) {
      console.error(e)
    }
  })
  return css
}
