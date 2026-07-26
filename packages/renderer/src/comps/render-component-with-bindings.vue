/** * * 1. 给组件绑定 vue 指令 * 2. 给组件绑定 cx-styles * 其他如事件监听等在 render-component
做了，之后可能会迁移到此组件，专门用于绑定属性 */

<script lang="ts">
import { has } from '@lionad/cx-definition'

import { watchImmediate } from '@vueuse/core'
import {
  resolveDirective,
  resolveComponent,
  unref,
  defineComponent,
  inject,
  type Ref,
  useAttrs,
  useSlots,
  computed,
  ref,
  h,
  markRaw,
  withDirectives,
} from 'vue'
import {
  useCxStyleLayout,
  useCxStyleBox,
  useCxStyleMargin,
  useCxStylePadding,
  useCxStyleRound,
  useCxStyleBorder,
  useCxStyleFont,
  useCxStyleCosm,
  // breakPointOptions,
  useCxBreakpointType,
} from '@lionad/cx-vue'
import { kebabCase } from 'lodash-es'
import type { Component, DirectiveArguments } from 'vue'
import type {
  CxComponentRuntime,
  CxComponentMetaDefined,
  CxComponentStyle,
  CxLoaderInstance,
} from '@lionad/cx-definition'

// defineOptions({ name: 'CxRenderCompWithBindings' })

const cache = new Map<any, any>()

const getCachedCxRenderBreakpointType = (cxRenderRef: any) => {
  if (!cache.get(unref(cxRenderRef))) {
    cache.clear()
    cache.set(unref(cxRenderRef), useCxBreakpointType(unref(cxRenderRef) as HTMLElement))
  }
  return cache.get(unref(cxRenderRef))
}

export default defineComponent({
  props: {
    compID: {
      type: String,
      required: true,
    },
    componentType: {
      type: String,
      required: true,
    },
    componentDirectives: {
      type: Object,
      required: true,
    },
    // componentDatas: {
    //   type: Object,
    //   required: true,
    // },
    // componentEvents: {
    //   type: Object,
    //   required: true,
    // },
    setRef: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    const cx = inject<CxLoaderInstance | undefined>('cx')!
    const comp = inject<Ref<CxComponentRuntime>>('cx-comp')!
    const meta = inject<Ref<CxComponentMetaDefined>>('cx-comp-meta')!

    const attrs = useAttrs()
    const slots = useSlots()

    /** 确定需要绑定的指令 */

    const resolvedDirectives = computed(() =>
      Object.entries(props.componentDirectives || {}).map(([k, v]) => {
        const name = k.replace(/^v-/, '')
        const directive = resolveDirective(name)
        // console.log('[debug] directive', directive)
        return [directive, v]
      }),
    )

    /** 确定需要渲染的组件类型 */

    const componentType = computed(() => {
      const cxComp = cx?.utils?.findFromCX?.(props.componentType)
      const targetComp = cxComp || (resolveComponent(props.componentType) as Component) || 'div'
      // @ts-ignore
      if (window && window?._debug_verbose) {
        if (cxComp) {
          console.info(
            '[verbose:render-component-with-bindings] using comp in cx',
            props.componentType,
          )
        } else {
          console.info(
            '[verbose:render-component-with-bindings] not found in cx',
            props.componentType,
            'fallback to resolved-component',
            targetComp,
          )
        }
      }
      return targetComp
    })

    /** 确定组件样式 todo perf 不必每个组件都初始化 */
    // const breakpointKeys = breakPointOptions.map(x => x.value)

    // * 也许可以把每个组件都做成断点形式
    const cxRenderRef = inject('cx-render-parent')!

    const pageBreakpointType = computed(() => getCachedCxRenderBreakpointType(unref(cxRenderRef)))

    let styleBox: any,
      styleMargin: any,
      stylePadding: any,
      styleLayout: any,
      styleRound: any,
      styleBorder: any,
      styleFont: any,
      styleCosm: any
    let isStyleInited = false
    const initStyle = ({ w, m, p, l, r, b, f, c }: CxComponentStyle) => {
      if (!isStyleInited) {
        isStyleInited = true
        styleBox = useCxStyleBox({})
        styleMargin = useCxStyleMargin({})
        stylePadding = useCxStylePadding({})
        styleLayout = useCxStyleLayout({})
        styleRound = useCxStyleRound({})
        styleBorder = useCxStyleBorder({})
        styleFont = useCxStyleFont({})
        styleCosm = useCxStyleCosm({})
      }
      styleBox.init(w)
      styleMargin.init(m)
      stylePadding.init(p)
      styleLayout.init(l)
      styleRound.init(r)
      styleBorder.init(b)
      styleFont.init(f)
      styleCosm.init(c)
      // * for debug
      // if (comp.value.data?._cx_name?.startsWith('debug')) {
      //   console.log(
      //     '[debug]',
      //     comp.value,
      //     styleBox,
      //     styleMargin,
      //     stylePadding,
      //     styleLayout,
      //     styleRound,
      //     styleBorder,
      //     styleFont,
      //     styleCosm,
      //   )
      // }
    }

    const styles = ref({} as CSSStyleDeclaration)
    // todo deep
    watchImmediate(
      () => [
        has(meta.value?.headless),
        comp.value?.data?._cx_style,
        unref(unref(pageBreakpointType)),
      ],
      ([headless, cxStyle, breakpointType]) => {
        if (headless) {
          return
        }
        const v = (cxStyle || {}) as CxComponentStyle
        const vOverride = breakpointType ? (v as any)[breakpointType] : {}
        const { w: wo, m: mo, p: po, l: lo, r: ro, b: bo, f: fo, c: co } = vOverride || {}
        const { w, m, p, l, r, b, f, c } = v
        // console.log('style', comp.value.data._cx_name, v, vOverride, breakpointType)
        initStyle({
          w: wo || w,
          m: mo || m,
          p: po || p,
          l: lo || l,
          r: ro || r,
          b: bo || b,
          f: fo || f,
          c: co || c,
        })
        styles.value = {} as CSSStyleDeclaration
      },
    )

    const kls = computed(() => {
      const kls: (string | false)[] = [
        `is-${comp.value.key}`,
        `cx-${comp.value.id}`,
        `is-render-as-${props.componentType}`,
        'is-cx-component',
      ]
      if (!isStyleInited) {
        return kls
      }

      /* Box(width & height) */
      if (styleBox.isInited.value) {
        if (styleBox.widthMeter.value) {
          if (styleBox.isFreeSetW.value) {
            styles.value.width = `${styleBox.width.value}${styleBox.widthMeter.value}`
          } else {
            kls.push(`w-${styleBox.widthMeter.value}`)
          }
        }
        if (styleBox.minWidthMeter.value) {
          if (styleBox.isFreeSetMinW.value) {
            styles.value.minWidth = `${styleBox.minWidth.value}${styleBox.minWidthMeter.value}`
          } else {
            kls.push(`min-w-${styleBox.minWidthMeter.value}`)
          }
        }
        if (styleBox.maxWidthMeter.value) {
          if (styleBox.isFreeSetMaxW.value) {
            styles.value.maxWidth = `${styleBox.maxWidth.value}${styleBox.maxWidthMeter.value}`
          } else {
            kls.push(`max-w-${styleBox.maxWidthMeter.value}`)
          }
        }
        if (styleBox.heightMeter.value) {
          if (styleBox.isFreeSetH.value) {
            styles.value.height = `${styleBox.height.value}${styleBox.heightMeter.value}`
          } else {
            kls.push(`h-${styleBox.heightMeter.value}`)
          }
        }
        if (styleBox.minHeightMeter.value) {
          if (styleBox.isFreeSetMinH.value) {
            styles.value.minHeight = `${styleBox.minHeight.value}${styleBox.minHeightMeter.value}`
          } else {
            kls.push(`min-h-${styleBox.minHeightMeter.value}`)
          }
        }
        if (styleBox.maxHeightMeter.value) {
          if (styleBox.isFreeSetMaxH.value) {
            styles.value.maxHeight = `${styleBox.maxHeight.value}${styleBox.maxHeightMeter.value}`
          } else {
            kls.push(`max-h-${styleBox.maxHeightMeter.value}`)
          }
        }
      }

      /* margin */
      if (styleMargin.isInited.value) {
        kls.push(
          'box-border',
          styleMargin.top.value && `mt-${styleMargin.top.value}`,
          styleMargin.right.value && `mr-${styleMargin.right.value}`,
          styleMargin.bottom.value && `mb-${styleMargin.bottom.value}`,
          styleMargin.left.value && `ml-${styleMargin.left.value}`,
        )
      }

      /* padding */
      if (stylePadding.isInited.value) {
        kls.push(
          stylePadding.top.value && `pt-${stylePadding.top.value}`,
          stylePadding.right.value && `pr-${stylePadding.right.value}`,
          stylePadding.bottom.value && `pb-${stylePadding.bottom.value}`,
          stylePadding.left.value && `pl-${stylePadding.left.value}`,
        )
      }

      /* border */
      if (styleBorder.isInited.value) {
        kls.push(
          styleBorder.top.value &&
            (styleBorder.top.value === '1' ? 'border-t' : `border-t-${styleBorder.top.value}`),
          styleBorder.right.value &&
            (styleBorder.right.value === '1' ? 'border-r' : `border-r-${styleBorder.right.value}`),
          styleBorder.bottom.value &&
            (styleBorder.bottom.value === '1'
              ? 'border-b'
              : `border-b-${styleBorder.bottom.value}`),
          styleBorder.left.value &&
            (styleBorder.left.value === '1' ? 'border-l' : `border-l-${styleBorder.left.value}`),
          styleBorder.top.value === '0' &&
            styleBorder.right.value === '0' &&
            styleBorder.bottom.value === '0' &&
            styleBorder.left.value === '0' &&
            'ring-0',
        )
      }

      /* round */
      if (styleRound.isInited.value) {
        if (styleRound.isConfigured.value) {
          kls.push('overflow-hidden')
          const isSame =
            styleRound.top.value === styleRound.right.value &&
            styleRound.top.value === styleRound.bottom.value &&
            styleRound.top.value === styleRound.left.value
          const isCircle = isSame && styleRound.top.value === 'full'
          if (isCircle) {
            kls.push('rounded-full')
          } else {
            styleRound.top.value && kls.push(`rounded-tl-${styleRound.top.value}`)
            styleRound.right.value && kls.push(`rounded-tr-${styleRound.right.value}`)
            styleRound.bottom.value && kls.push(`rounded-bl-${styleRound.bottom.value}`)
            styleRound.left.value && kls.push(`rounded-br-${styleRound.left.value}`)
          }
        }
      }

      /* layout */
      if (styleLayout.isInited.value) {
        if (styleLayout.direction.value) {
          kls.push('flex')
          if (styleLayout.direction.value === 'h') {
            styleLayout.isReverse.value ? kls.push('flex-row-reverse') : kls.push('flex-row')
          }
          if (styleLayout.direction.value === 'w') {
            styleLayout.isReverse.value
              ? kls.push('flex-row-reverse flex-wrap')
              : kls.push('flex-row flex-wrap')
          }
          if (styleLayout.direction.value === 'v') {
            styleLayout.isReverse.value ? kls.push('flex-col-reverse') : kls.push('flex-col')
          }
        }
        if (styleLayout.isFull.value) {
          kls.push('w-full h-full')
        }
        if (styleLayout.gap.value) {
          kls.push(`gap-${styleLayout.gap.value}`)
        }
        if (styleLayout.align.value) {
          const isRow = styleLayout.direction.value === 'h' || styleLayout.direction.value === 'w'
          const isCol = styleLayout.direction.value === 'v'
          const canStretch =
            styleLayout.isStretch.value && ['h', 'v'].includes(styleLayout.direction.value)
          const [align, mode] = [
            styleLayout.align.value.slice(0, 2),
            styleLayout.align.value.slice(2, 3) || ' ',
          ]
          if (align === 'tl') {
            if (isRow) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-start content-start')
              canStretch ? kls.push('justify-between') : kls.push('justify-start')
            }
            if (isCol) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-start')
              canStretch ? kls.push('justify-between') : kls.push('justify-start')
            }
          }
          if (align === 'tc') {
            if (isRow) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-start content-start')
              canStretch ? kls.push('justify-between') : kls.push('justify-center')
            }
            if (isCol) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-center')
              canStretch ? kls.push('justify-between') : kls.push('justify-start')
            }
          }
          if (align === 'tr') {
            if (isRow) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-start content-start')
              canStretch ? kls.push('justify-between') : kls.push('justify-end')
            }
            if (isCol) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-end')
              canStretch ? kls.push('justify-between') : kls.push('justify-start')
            }
          }
          if (align === 'cl') {
            if (isRow) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-center content-center')
              canStretch ? kls.push('justify-between') : kls.push('justify-start')
            }
            if (isCol) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-start')
              canStretch ? kls.push('justify-between') : kls.push('justify-center')
            }
          }
          if (align === 'cc') {
            if (isRow) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-center content-center')
              canStretch ? kls.push('justify-between') : kls.push('justify-center')
            }
            if (isCol) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-center')
              canStretch ? kls.push('justify-between') : kls.push('justify-center')
            }
          }
          if (align === 'cr') {
            if (isRow) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-center content-center')
              canStretch ? kls.push('justify-between') : kls.push('justify-end')
            }
            if (isCol) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-end')
              canStretch ? kls.push('justify-between') : kls.push('justify-center')
            }
          }
          if (align === 'bl') {
            if (isRow) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-end content-end')
              canStretch ? kls.push('justify-between') : kls.push('justify-start')
            }
            if (isCol) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-start')
              canStretch ? kls.push('justify-between') : kls.push('justify-end')
            }
          }
          if (align === 'bc') {
            if (isRow) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-end content-end')
              canStretch ? kls.push('justify-between') : kls.push('justify-center')
            }
            if (isCol) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-center')
              canStretch ? kls.push('justify-between') : kls.push('justify-end')
            }
          }
          if (align === 'br') {
            if (isRow) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-end content-end')
              canStretch ? kls.push('justify-between') : kls.push('justify-end')
            }
            if (isCol) {
              mode === 'n' && kls.push('items-normal')
              mode === 's' && kls.push('items-stretch')
              mode === ' ' && kls.push('items-end')
              canStretch ? kls.push('justify-between') : kls.push('justify-end')
            }
          }
        }
      }

      /* fonts */
      if (styleFont.isInited.value) {
        styleFont.size.value && kls.push(`text-${styleFont.size.value}`)
        styleFont.align.value && kls.push(`text-${styleFont.align.value}`)
        styleFont.lineHeight.value && kls.push(`leading-${styleFont.lineHeight.value}`)
        if (styleFont.family.value) {
          if (styleFont.familySubset.value) {
            styleFont.family.value &&
              kls.push(
                `font-${kebabCase(styleFont.family.value)}-${kebabCase(styleFont.familySubset.value)}`,
              )
          } else {
            styleFont.family.value && kls.push(`font-${kebabCase(styleFont.family.value)}`)
          }
        } else {
          styleFont.weight.value && kls.push(`font-${styleFont.weight.value}`)
        }
      }

      /* cosm */
      if (styleCosm.isInited.value) {
        if (styleCosm.bgType.value) {
          if (styleCosm.bgType.value === 'color') {
            if (styleCosm.bgColorStrength.value) {
              kls.push(`bg-${styleCosm.bgColorName.value}-${styleCosm.bgColorStrength.value}`)
            } else {
              kls.push(`bg-${styleCosm.bgColorName.value}`)
            }
          }
        }
      }

      return kls
    })

    /** Render Function */

    const isHeadless = computed(() => has(meta.value?.headless))
    // watchEffect(() => {
    //   console.log('[debug] notHeadless', unref(isHeadless))
    // })

    // ?
    // const setRef = (ref: ComponentPublicInstance) => {
    //   const toSet = ref.$ ? ref.$.exposed : ref
    //   props.setRef(toSet)
    //   return toSet
    // }

    return () =>
      unref(isHeadless)
        ? h(
            componentType.value,
            {
              ...attrs,
              // @ts-ignore
              ref: props.setRef,
              comp: markRaw(comp.value),
            },
            slots,
          )
        : withDirectives(
            h(
              componentType.value,
              {
                ...attrs,
                // @ts-ignore
                ref: props.setRef,
                comp: markRaw(comp.value),
                // 空样式不下传：styles 由 _cx_style（编辑器样式）驱动，默认空对象；
                // 空的响应式 style 进入组件链会在 Reka Primitive 的 vnode 归一化阶段
                // 触发只读代理写入异常（'set' on proxy），仅在有实际样式时传 style
                ...(Object.keys(styles.value).length > 0 ? { style: styles.value } : {}),
                class: kls.value,
                ['data-is-cx-comp']: true,
                ['data-cx-comp-id']: comp.value?.id,
                ['data-cx-comp-key']: comp.value?.key,
              },
              slots,
            ),
            unref(resolvedDirectives) as unknown as DirectiveArguments,
          )
  },
})
</script>

<style>
@reference "tailwindcss";

@layer app-base {
  /* 提前引用这些工具类 */
  /* .ignore_purge {
    @apply flex flex-row flex-row-reverse flex-wrap flex-col flex-col-reverse items-stretch items-start items-center items-end content-normal content-start content-center content-end justify-start justify-center justify-end w-full h-full;
    @apply gap-px gap-0 gap-0.5 gap-1 gap-2 gap-3 gap-4 gap-5 gap-6 gap-8 gap-10 gap-12 gap-16 gap-20 gap-24 gap-32 gap-40 gap-48 gap-56 gap-64;
    @apply basis-0 basis-1 basis-2 basis-3 basis-4 basis-5 basis-6 basis-8 basis-10 basis-12 basis-16 basis-20 basis-24 basis-32 basis-40 basis-48 basis-56 basis-64 basis-full;
    @apply basis-1/2 basis-1/3 basis-1/4 basis-1/5 basis-1/6 basis-1/12 basis-2/3 basis-2/5 basis-3/4 basis-3/5 basis-4/5 basis-5/6 basis-11/12;
    @apply min-w-0 min-w-1 min-w-2 min-w-3 min-w-4 min-w-5 min-w-6 min-w-8 min-w-10 min-w-12 min-w-16 min-w-20 min-w-24 min-w-32 min-w-40 min-w-48 min-w-56 min-w-64 min-w-full;
    @apply min-w-px min-w-0.5 min-w-1.5 min-w-2.5 min-w-3.5;
    @apply w-0 w-1 w-2 w-3 w-4 w-5 w-6 w-8 w-10 w-12 w-16 w-20 w-24 w-32 w-40 w-48 w-56 w-64 w-full;
    @apply w-px w-0.5 w-1.5 w-2.5 w-3.5;
    @apply w-1/2 w-1/3 w-1/4 w-1/5 w-1/6 w-1/12 w-2/3 w-2/5 w-3/4 w-3/5 w-4/5 w-5/6 w-11/12;
    @apply max-w-0 max-w-1 max-w-2 max-w-3 max-w-4 max-w-5 max-w-6 max-w-8 max-w-10 max-w-12 max-w-16 max-w-20 max-w-24 max-w-32 max-w-40 max-w-48 max-w-56 max-w-64 max-w-full;
    @apply max-w-px max-w-0.5 max-w-1.5 max-w-2.5 max-w-3.5;
    @apply min-h-0 min-h-1 min-h-2 min-h-3 min-h-4 min-h-5 min-h-6 min-h-8 min-h-10 min-h-12 min-h-16 min-h-20 min-h-24 min-h-32 min-h-40 min-h-48 min-h-56 min-h-64 min-h-full;
    @apply min-h-px min-h-0.5 min-h-1.5 min-h-2.5 min-h-3.5;
    @apply h-0 h-1 h-2 h-3 h-4 h-5 h-6 h-8 h-10 h-12 h-16 h-20 h-24 h-32 h-40 h-48 h-56 h-64 h-full;
    @apply h-px h-0.5 h-1.5 h-2.5 h-3.5;
    @apply h-1/2 h-1/3 h-1/4 h-1/5 h-1/6 h-2/3 h-2/5 h-3/4 h-3/5 h-4/5 h-5/6;
    @apply max-h-0 max-h-1 max-h-2 max-h-3 max-h-4 max-h-5 max-h-6 max-h-8 max-h-10 max-h-12 max-h-16 max-h-20 max-h-24 max-h-32 max-h-40 max-h-48 max-h-56 max-h-64 max-h-full;
    @apply max-h-px max-h-0.5 max-h-1.5 max-h-2.5 max-h-3.5;
    @apply mt-px mt-0 mt-0.5 mt-1 mt-2 mt-3 mt-4 mt-5 mt-6 mt-8 mt-10 mt-12 mt-16 mt-20 mt-24 mt-32 mt-40 mt-48 mt-56 mt-64;
    @apply mr-px mr-0 mr-0.5 mr-1 mr-2 mr-3 mr-4 mr-5 mr-6 mr-8 mr-10 mr-12 mr-16 mr-20 mr-24 mr-32 mr-40 mr-48 mr-56 mr-64;
    @apply mb-px mb-0 mb-0.5 mb-1 mb-2 mb-3 mb-4 mb-5 mb-6 mb-8 mb-10 mb-12 mb-16 mb-20 mb-24 mb-32 mb-40 mb-48 mb-56 mb-64;
    @apply ml-px ml-0 ml-0.5 ml-1 ml-2 ml-3 ml-4 ml-5 ml-6 ml-8 ml-10 ml-12 ml-16 ml-20 ml-24 ml-32 ml-40 ml-48 ml-56 ml-64;
    @apply pt-px pt-0 pt-0.5 pt-1 pt-2 pt-3 pt-4 pt-5 pt-6 pt-8 pt-10 pt-12 pt-16 pt-20 pt-24 pt-32 pt-40 pt-48 pt-56 pt-64;
    @apply pr-px pr-0 pr-0.5 pr-1 pr-2 pr-3 pr-4 pr-5 pr-6 pr-8 pr-10 pr-12 pr-16 pr-20 pr-24 pr-32 pr-40 pr-48 pr-56 pr-64;
    @apply pb-px pb-0 pb-0.5 pb-1 pb-2 pb-3 pb-4 pb-5 pb-6 pb-8 pb-10 pb-12 pb-16 pb-20 pb-24 pb-32 pb-40 pb-48 pb-56 pb-64;
    @apply pl-px pl-0 pl-0.5 pl-1 pl-2 pl-3 pl-4 pl-5 pl-6 pl-8 pl-10 pl-12 pl-16 pl-20 pl-24 pl-32 pl-40 pl-48 pl-56 pl-64;
    @apply rounded-tl-sm rounded-tl-md rounded-tl-lg rounded-tl-xl rounded-tl-2xl rounded-tl-full overflow-hidden rounded-full rounded-none;
    @apply rounded-tr-sm rounded-tr-md rounded-tr-lg rounded-tr-xl rounded-tr-2xl rounded-tr-full;
    @apply rounded-bl-sm rounded-bl-md rounded-bl-lg rounded-bl-xl rounded-bl-2xl rounded-bl-full;
    @apply rounded-br-sm rounded-br-md rounded-br-lg rounded-br-xl rounded-br-2xl rounded-br-full;
    @apply border-t-0 border-t border-t-2 border-t-4;
    @apply border-r-0 border-r border-r-2 border-r-4;
    @apply border-b-0 border-b border-b-2 border-b-4;
    @apply border-l-0 border-l border-l-2 border-l-4;
    @apply leading-3 leading-4 leading-5 leading-6 leading-7 leading-8 leading-9 leading-10 leading-none;
    @apply text-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-4xl text-5xl text-6xl text-7xl text-8xl;
    @apply font-light font-normal font-medium font-bold;
    @apply text-left text-center text-right;
    @apply bg-slate-50 bg-slate-100 bg-slate-200 bg-slate-300 bg-slate-400 bg-slate-500 bg-slate-600 bg-slate-700 bg-slate-800 bg-slate-900 bg-slate-950 bg-neutral-50 bg-neutral-100 bg-neutral-200 bg-neutral-300 bg-neutral-400 bg-neutral-500 bg-neutral-600 bg-neutral-700 bg-neutral-800 bg-neutral-900 bg-neutral-950 bg-zinc-50 bg-zinc-100 bg-zinc-200 bg-zinc-300 bg-zinc-400 bg-zinc-500 bg-zinc-600 bg-zinc-700 bg-zinc-800 bg-zinc-900 bg-zinc-950 bg-neutral-50 bg-neutral-100 bg-neutral-200 bg-neutral-300 bg-neutral-400 bg-neutral-500 bg-neutral-600 bg-neutral-700 bg-neutral-800 bg-neutral-900 bg-neutral-950 bg-stone-50 bg-stone-100 bg-stone-200 bg-stone-300 bg-stone-400 bg-stone-500 bg-stone-600 bg-stone-700 bg-stone-800 bg-stone-900 bg-stone-950 bg-red-50 bg-red-100 bg-red-200 bg-red-300 bg-red-400 bg-red-500 bg-red-600 bg-red-700 bg-red-800 bg-red-900 bg-red-950 bg-orange-50 bg-orange-100 bg-orange-200 bg-orange-300 bg-orange-400 bg-orange-500 bg-orange-600 bg-orange-700 bg-orange-800 bg-orange-900 bg-orange-950 bg-amber-50 bg-amber-100 bg-amber-200 bg-amber-300 bg-amber-400 bg-amber-500 bg-amber-600 bg-amber-700 bg-amber-800 bg-amber-900 bg-amber-950 bg-yellow-50 bg-yellow-100 bg-yellow-200 bg-yellow-300 bg-yellow-400 bg-yellow-500 bg-yellow-600 bg-yellow-700 bg-yellow-800 bg-yellow-900 bg-yellow-950 bg-lime-50 bg-lime-100 bg-lime-200 bg-lime-300 bg-lime-400 bg-lime-500 bg-lime-600 bg-lime-700 bg-lime-800 bg-lime-900 bg-lime-950 bg-green-50 bg-green-100 bg-green-200 bg-green-300 bg-green-400 bg-green-500 bg-green-600 bg-green-700 bg-green-800 bg-green-900 bg-green-950 bg-emerald-50 bg-emerald-100 bg-emerald-200 bg-emerald-300 bg-emerald-400 bg-emerald-500 bg-emerald-600 bg-emerald-700 bg-emerald-800 bg-emerald-900 bg-emerald-950 bg-teal-50 bg-teal-100 bg-teal-200 bg-teal-300 bg-teal-400 bg-teal-500 bg-teal-600 bg-teal-700 bg-teal-800 bg-teal-900 bg-teal-950 bg-cyan-50 bg-cyan-100 bg-cyan-200 bg-cyan-300 bg-cyan-400 bg-cyan-500 bg-cyan-600 bg-cyan-700 bg-cyan-800 bg-cyan-900 bg-cyan-950 bg-sky-50 bg-sky-100 bg-sky-200 bg-sky-300 bg-sky-400 bg-sky-500 bg-sky-600 bg-sky-700 bg-sky-800 bg-sky-900 bg-sky-950 bg-blue-50 bg-blue-100 bg-blue-200 bg-blue-300 bg-blue-400 bg-blue-500 bg-blue-600 bg-blue-700 bg-blue-800 bg-blue-900 bg-blue-950 bg-indigo-50 bg-indigo-100 bg-indigo-200 bg-indigo-300 bg-indigo-400 bg-indigo-500 bg-indigo-600 bg-indigo-700 bg-indigo-800 bg-indigo-900 bg-indigo-950 bg-violet-50 bg-violet-100 bg-violet-200 bg-violet-300 bg-violet-400 bg-violet-500 bg-violet-600 bg-violet-700 bg-violet-800 bg-violet-900 bg-violet-950 bg-purple-50 bg-purple-100 bg-purple-200 bg-purple-300 bg-purple-400 bg-purple-500 bg-purple-600 bg-purple-700 bg-purple-800 bg-purple-900 bg-purple-950 bg-fuchsia-50 bg-fuchsia-100 bg-fuchsia-200 bg-fuchsia-300 bg-fuchsia-400 bg-fuchsia-500 bg-fuchsia-600 bg-fuchsia-700 bg-fuchsia-800 bg-fuchsia-900 bg-fuchsia-950 bg-pink-50 bg-pink-100 bg-pink-200 bg-pink-300 bg-pink-400 bg-pink-500 bg-pink-600 bg-pink-700 bg-pink-800 bg-pink-900 bg-pink-950 bg-rose-50 bg-rose-100 bg-rose-200 bg-rose-300 bg-rose-400 bg-rose-500 bg-rose-600 bg-rose-700 bg-rose-800 bg-rose-900 bg-rose-950;
    @apply bg-transparent bg-black bg-white bg-sky-50 bg-sky-100 bg-sky-200 bg-sky-300 bg-sky-400 bg-sky-500 bg-sky-600 bg-sky-700 bg-sky-800 bg-sky-900 bg-sky-950 bg-sky;
  } */
  .items-normal {
    align-items: normal;
  }
}
</style>
