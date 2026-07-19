import { computed } from 'vue'
import { useBreakpoints, useElementSize } from '@vueuse/core'
import type { MaybeElementRef } from '@vueuse/core'

import './index.css'

const breaks = {
  x9s: 28,
  x8s: 40,
  x7s: 62,
  x6s: 90,
  x5s: 136,
  x4s: 195,
  x3s: 295,
  x2s: 440,
  xs: 640,
  sm: 768,
  md: 1024,
  lg: 1280,
  xl: 1536,
  x2l: 1920,
  x3l: 2560,
  x4l: 3840,
  x5l: 5120,
  x6l: 7680,
  x7l: 10240,
  x8l: 15360,
  x9l: 20480,
}
const breakpoints = useBreakpoints(breaks)

export const useResponseClassName = (element?: MaybeElementRef) => {
  if (!element) {
    return computed(() => ({
      // 'is-smaller-x9s': breakpoints.smaller('x9s'),
      // 'is-smaller-x8s': breakpoints.smaller('x8s'),
      // 'is-smaller-x7s': breakpoints.smaller('x7s'),
      // 'is-smaller-x6s': breakpoints.smaller('x6s'),
      // 'is-smaller-x5s': breakpoints.smaller('x5s'),
      // 'is-smaller-x4s': breakpoints.smaller('x4s'),
      // 'is-smaller-x3s': breakpoints.smaller('x3s'),
      // 'is-smaller-x2s': breakpoints.smaller('x2s'),
      // 'is-smaller-xs': breakpoints.smaller('xs'),
      // 'is-smaller-sm': breakpoints.smaller('sm'),
      // 'is-smaller-md': breakpoints.smaller('md'),
      // 'is-smaller-lg': breakpoints.smaller('lg'),
      // 'is-smaller-xl': breakpoints.smaller('xl'),
      // 'is-smaller-x2l': breakpoints.smaller('x2l'),
      // 'is-smaller-x3l': breakpoints.smaller('x3l'),
      // 'is-smaller-x4l': breakpoints.smaller('x4l'),
      // 'is-smaller-x5l': breakpoints.smaller('x5l'),
      // 'is-smaller-x6l': breakpoints.smaller('x6l'),
      // 'is-smaller-x7l': breakpoints.smaller('x7l'),
      // 'is-smaller-x8l': breakpoints.smaller('x8l'),
      // 'is-smaller-x9l': breakpoints.smaller('x9l'),
      'is-x9s': breakpoints.smaller('x8s'),
      'is-x8s': breakpoints.between('x8s', 'x7s'),
      'is-x7s': breakpoints.between('x7s', 'x6s'),
      'is-x6s': breakpoints.between('x6s', 'x5s'),
      'is-x5s': breakpoints.between('x5s', 'x4s'),
      'is-x4s': breakpoints.between('x4s', 'x3s'),
      'is-x3s': breakpoints.between('x3s', 'x2s'),
      'is-xs': breakpoints.between('xs', 'sm'),
      'is-sm': breakpoints.between('sm', 'md'),
      'is-md': breakpoints.between('md', 'lg'),
      'is-lg': breakpoints.between('lg', 'xl'),
      'is-xl': breakpoints.between('xl', 'x2l'),
      'is-x2l': breakpoints.between('x2l', 'x3l'),
      'is-x3l': breakpoints.between('x3l', 'x4l'),
      'is-x4l': breakpoints.between('x4l', 'x5l'),
      'is-x5l': breakpoints.between('x5l', 'x6l'),
      'is-x6l': breakpoints.between('x6l', 'x7l'),
      'is-x7l': breakpoints.between('x7l', 'x8l'),
      'is-x8l': breakpoints.between('x8l', 'x9l'),
      // 'is-greater-x9s': breakpoints.greater('x9s'),
      // 'is-greater-x8s': breakpoints.greater('x8s'),
      // 'is-greater-x7s': breakpoints.greater('x7s'),
      // 'is-greater-x6s': breakpoints.greater('x6s'),
      // 'is-greater-x5s': breakpoints.greater('x5s'),
      // 'is-greater-x4s': breakpoints.greater('x4s'),
      // 'is-greater-x3s': breakpoints.greater('x3s'),
      // 'is-greater-x2s': breakpoints.greater('x2s'),
      // 'is-greater-xs': breakpoints.greater('xs'),
      // 'is-greater-sm': breakpoints.greater('sm'),
      // 'is-greater-md': breakpoints.greater('md'),
      // 'is-greater-lg': breakpoints.greater('lg'),
      // 'is-greater-xl': breakpoints.greater('xl'),
      // 'is-greater-x2l': breakpoints.greater('x2l'),
      // 'is-greater-x3l': breakpoints.greater('x3l'),
      // 'is-greater-x4l': breakpoints.greater('x4l'),
      // 'is-greater-x5l': breakpoints.greater('x5l'),
      // 'is-greater-x6l': breakpoints.greater('x6l'),
      // 'is-greater-x7l': breakpoints.greater('x7l'),
      // 'is-greater-x8l': breakpoints.greater('x8l'),
      // 'is-greater-x9l': breakpoints.greater('x9l'),
    }))
  } else {
    const { width } = useElementSize(
      element,
      {
        width: 0,
        height: 0,
      },
      {
        box: 'border-box',
      },
    )
    return computed(() => ({
      // 'is-smaller-x9s': width.value < breaks.x9s,
      // 'is-smaller-x8s': width.value < breaks.x8s,
      // 'is-smaller-x7s': width.value < breaks.x7s,
      // 'is-smaller-x6s': width.value < breaks.x6s,
      // 'is-smaller-x5s': width.value < breaks.x5s,
      // 'is-smaller-x4s': width.value < breaks.x4s,
      // 'is-smaller-x3s': width.value < breaks.x3s,
      // 'is-smaller-x2s': width.value < breaks.x2s,
      // 'is-smaller-xs': width.value < breaks.xs,
      // 'is-smaller-sm': width.value < breaks.sm,
      // 'is-smaller-md': width.value < breaks.md,
      // 'is-smaller-lg': width.value < breaks.lg,
      // 'is-smaller-xl': width.value < breaks.xl,
      // 'is-smaller-x2l': width.value < breaks.x2l,
      // 'is-smaller-x3l': width.value < breaks.x3l,
      // 'is-smaller-x4l': width.value < breaks.x4l,
      // 'is-smaller-x5l': width.value < breaks.x5l,
      // 'is-smaller-x6l': width.value < breaks.x6l,
      // 'is-smaller-x7l': width.value < breaks.x7l,
      // 'is-smaller-x8l': width.value < breaks.x8l,
      // 'is-smaller-x9l': width.value < breaks.x9l,
      'is-x9s': width.value < breaks.x8s,
      'is-x8s': width.value >= breaks.x8s && width.value < breaks.x7s,
      'is-x7s': width.value >= breaks.x7s && width.value < breaks.x6s,
      'is-x6s': width.value >= breaks.x6s && width.value < breaks.x5s,
      'is-x5s': width.value >= breaks.x5s && width.value < breaks.x4s,
      'is-x4s': width.value >= breaks.x4s && width.value < breaks.x3s,
      'is-x3s': width.value >= breaks.x3s && width.value < breaks.x2s,
      'is-x2s': width.value >= breaks.x2s && width.value < breaks.sm,
      'is-xs': width.value >= breaks.xs && width.value < breaks.sm,
      'is-sm': width.value >= breaks.sm && width.value < breaks.md,
      'is-md': width.value >= breaks.md && width.value < breaks.lg,
      'is-lg': width.value >= breaks.lg && width.value < breaks.xl,
      'is-xl': width.value >= breaks.xl && width.value < breaks.x2l,
      'is-x2l': width.value >= breaks.x2l && width.value < breaks.x3l,
      'is-x3l': width.value >= breaks.x3l && width.value < breaks.x4l,
      'is-x4l': width.value >= breaks.x4l && width.value < breaks.x5l,
      'is-x5l': width.value >= breaks.x5l && width.value < breaks.x6l,
      'is-x6l': width.value >= breaks.x6l && width.value < breaks.x7l,
      'is-x7l': width.value >= breaks.x7l && width.value < breaks.x8l,
      'is-x8l': width.value >= breaks.x8l && width.value < breaks.x9l,
      // 'is-greater-x9s': width.value > breaks.x9s,
      // 'is-greater-x8s': width.value > breaks.x8s,
      // 'is-greater-x7s': width.value > breaks.x7s,
      // 'is-greater-x6s': width.value > breaks.x6s,
      // 'is-greater-x5s': width.value > breaks.x5s,
      // 'is-greater-x4s': width.value > breaks.x4s,
      // 'is-greater-x3s': width.value > breaks.x3s,
      // 'is-greater-x2s': width.value > breaks.x2s,
      // 'is-greater-xs': width.value > breaks.xs,
      // 'is-greater-sm': width.value > breaks.sm,
      // 'is-greater-md': width.value > breaks.md,
      // 'is-greater-lg': width.value > breaks.lg,
      // 'is-greater-xl': width.value > breaks.xl,
      // 'is-greater-x2l': width.value > breaks.x2l,
      // 'is-greater-x3l': width.value > breaks.x3l,
      // 'is-greater-x4l': width.value > breaks.x4l,
      // 'is-greater-x5l': width.value > breaks.x5l,
      // 'is-greater-x6l': width.value > breaks.x6l,
      // 'is-greater-x7l': width.value > breaks.x7l,
      // 'is-greater-x8l': width.value > breaks.x8l,
      // 'is-greater-x9l': width.value > breaks.x9l,
    }))
  }
}

export const useResponseClassNameArray = (element?: MaybeElementRef) => {
  const responseClassName = useResponseClassName(element)
  return computed(() => {
    const result: string[] = []
    for (const key in responseClassName.value) {
      // @ts-ignore
      if (responseClassName.value[key]) {
        result.push(key)
      }
    }
    return result
  })
}
