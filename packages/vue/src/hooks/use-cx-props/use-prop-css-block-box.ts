import { has, genUseHooks } from '@lionad/cx-definition'
import { isFunction, isString, isBoolean } from 'lodash-es'
import { useToggle, whenever } from '@vueuse/core'
import { useSemanticVersion } from 'use-semantic-version'
import {
  colorNameOptions,
  circleOption,
  fontFamilyOptions,
  roundOptions,
} from './use-cx-styles/config'
import type { Ref, MaybeRef } from 'vue'
import type { CxComponentStyle } from '@lionad/cx-definition'
import { ref } from 'vue'
import { computed } from 'vue'
import { unref } from 'vue'
import { watch } from 'vue'
import { watchEffect } from 'vue'

export * from './use-cx-styles/config'

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (...args: unknown[]) => unknown ? T[P] : DeepPartial<T[P]>
}

const CSSDefaultValue = [
  { value: '', label: '默认' },
  // { value: 'unset', label: '不设置' },
  // { value: 'inherit', label: '继承父组件' },
  // { value: 'auto', label: '自动' },
  // { value: 'initial', label: '初始' },
  // { value: 'revert', label: '还原' },
]

type UseCxStyleOptions<Initial = string> = {
  options?: { value: string; label: string }[]
  initValue?: Initial
  onChange?: (x: Initial) => void
}

/**
 * 可以统一设置的值（border、round）
 */
const genUseCxStyleUnified =
  (
    _options: MaybeRef<UseCxStyleOptions['options']>,
    _optionsUnified?: MaybeRef<UseCxStyleOptions['options']>,
  ) =>
  (_opts: UseCxStyleOptions) => {
    const useHooks = genUseHooks()
    const version = useSemanticVersion('0.0.1')
    const opts = Object.assign(
      {
        initValue: '',
        onChange: undefined,
      },
      _opts || {},
    )

    // 是否统一设置所有值
    const isSetAll = ref(true)

    const optionsUnUnified = computed(() =>
      CSSDefaultValue.concat(unref(_options)!.concat(_opts.options || [])),
    )
    const optionsUnified = computed(() => {
      return _optionsUnified
        ? CSSDefaultValue.concat(unref(_optionsUnified)!.concat(_opts.options || []))
        : unref(optionsUnUnified)
    })
    const options = computed(() => {
      return isSetAll.value ? unref(optionsUnified) : unref(optionsUnUnified)
    })

    const [_t, r, b, l] = [ref(''), ref(''), ref(''), ref('')]
    const t = computed({
      get() {
        return unref(_t)
      },
      set(x: string) {
        _t.value = x
        if (unref(isSetAll)) {
          r.value = x
          b.value = x
          l.value = x
        }
      },
    })
    const values = computed({
      get() {
        return [unref(_t), unref(r), unref(b), unref(l)]
      },
      set(x: string[]) {
        _t.value = x[0]!
        r.value = x[1]!
        b.value = x[2]!
        l.value = x[3]!
      },
    })

    // 触发 values 的响应式依赖追踪（读取使其成为依赖源）；参数为 ref/computed
    const touch = (x: MaybeRef<unknown>) => unref(x)
    touch(values)

    const isEnabled = ref(true)
    const toggleEnable = useHooks(() => (isEnabled.value = !isEnabled.value))

    const isConfigured = computed(() => {
      return values.value.map((x) => unref(x) !== '').filter(Boolean).length > 0
    })

    const getIDX = (x: Ref<string>) => options.value.findIndex((y) => y.value === unref(x))
    const getZipValue = () => `${getIDX(_t)}/${getIDX(r)}/${getIDX(l)}/${getIDX(b)}`
    const unzipValue = (s: string) => {
      const [tl, tr, br, bl] = s
        .split('/')
        .concat(['', '', '', ''])
        .slice(0, 4)
        .map((x) => options.value[Number(x)]?.value || '') as [string, string, string, string]
      _t.value = tl
      r.value = tr
      l.value = br
      b.value = bl
      // console.log('[debug] unzipValue', tl, tr, br, bl)
      if (tl) {
        if (tl === tr && tr === br && br === bl) {
          isSetAll.value = true
        } else {
          isSetAll.value = false
        }
      }
    }

    const toggleSetAll = () => {
      if (!isEnabled.value) {
        return false
      } else {
        isSetAll.value = !isSetAll.value
      }
      const x = Number(_t.value) >= 0 && _t.value ? _t.value : ''
      values.value = [x, x, x, x]
    }

    const isInited = ref(false)
    const init = (x: string = '') => {
      unzipValue(x)
      isEnabled.value = has(x)
      isInited.value = true
    }

    if (Object.keys(opts).includes('initValue')) {
      init(opts.initValue)
    }

    const reset = () => {
      init('')
      isInited.value = false
    }
    whenever(() => !isEnabled.value, reset)

    const onChangeFn = ref<((x: string) => void) | undefined>(opts.onChange)
    const onChange = (fn: (x: string) => void) => (onChangeFn.value = fn)
    // todo perf when onChangeFn is not null
    watch(
      values,
      () => {
        if (isFunction(unref(onChangeFn))) {
          onChangeFn.value!(getZipValue())
        }
      },
      {
        deep: true,
      },
    )

    const states = {
      version,
      isEnabled,
      toggleEnable,
      options,
      top: t,
      right: r,
      bottom: b,
      left: l,
      values,
      isConfigured,
      getZipValue,
      unzipValue,
      isSetAll,
      init,
      reset,
      isInited,
      toggleSetAll,
      onChange,
    } as const

    return states
  }
export const useCxStyleRound = (_opts: UseCxStyleOptions) => {
  return genUseCxStyleUnified(roundOptions, roundOptions.concat([circleOption]))(_opts)
}
export const useCxStyleBorder = (_opts: UseCxStyleOptions) => {
  return genUseCxStyleUnified([
    { value: '0', label: '无' },
    { value: '1', label: '细' },
    { value: '2', label: '中' },
    { value: '4', label: '粗' },
  ])(_opts)
}

const SpacingValues = [0, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64]
const WHValues = [
  '0.5',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '8',
  '10',
  '12',
  '16',
  '20',
  '24',
  '32',
  '40',
  '48',
  '56',
  '64',
  '1/2',
  '1/3',
  '2/3',
  '1/4',
  '2/4',
  '3/4',
  '1/5',
  '2/5',
  '3/5',
  '4/5',
  '1/6',
  '2/6',
  '3/6',
  '4/6',
  '5/6',
  '1/12',
  '2/12',
  '3/12',
  '4/12',
  '5/12',
  '6/12',
  '7/12',
  '8/12',
  '9/12',
  '10/12',
  '11/12',
]

/**
 * Box（Width & Height）
 */
export const useCxStyleBox = (_opts: UseCxStyleOptions) => {
  const useHooks = genUseHooks()
  const version = useSemanticVersion('0.0.1')
  const opts = Object.assign(
    {
      initValue: '',
      onChange: undefined,
    },
    _opts || {},
  )

  const options = CSSDefaultValue.concat(
    [
      { value: '0', label: '无' },
      { value: 'px', label: '像素' },
      { value: '%', label: '百分比' },
      { value: 'auto', label: '适应' },
      { value: 'vw', label: '屏幕宽度' },
      { value: 'vh', label: '屏幕高度' },
    ].concat(
      WHValues.map((x) => ({
        value: x.toString(),
        label: `${x} size`,
      })),
    ),
  )

  const [w, minW, maxW, wMeter, minWMeter, maxWMeter] = [
    ref(''),
    ref(''),
    ref(''),
    ref(''),
    ref(''),
    ref(''),
  ]
  const [h, minH, maxH, hMeter, minHMeter, maxHMeter] = [
    ref(''),
    ref(''),
    ref(''),
    ref(''),
    ref(''),
    ref(''),
  ]
  const values = computed({
    get() {
      return [
        unref(w),
        unref(minW),
        unref(maxW),
        unref(wMeter),
        unref(minWMeter),
        unref(maxWMeter),
        unref(h),
        unref(minH),
        unref(maxH),
        unref(hMeter),
        unref(minHMeter),
        unref(maxHMeter),
      ]
    },
    set(x: string[]) {
      w.value = x[0] || ''
      minW.value = x[1] || ''
      maxW.value = x[2] || ''
      wMeter.value = x[3] || ''
      minWMeter.value = x[4] || ''
      maxWMeter.value = x[5] || ''
      h.value = x[6] || ''
      minH.value = x[7] || ''
      maxH.value = x[8] || ''
      hMeter.value = x[9] || ''
      minHMeter.value = x[10] || ''
      maxHMeter.value = x[11] || ''
    },
  })

  // 判断该单位是否需要配合数值使用
  const isMeterFreeSetting = (x: string) => {
    return ['auto', '%', 'px', 'vw', 'vh'].includes(x)
  }

  const isFreeSetW = computed(() => isMeterFreeSetting(unref(wMeter)))
  const isFreeSetMinW = computed(() => isMeterFreeSetting(unref(minWMeter)))
  const isFreeSetMaxW = computed(() => isMeterFreeSetting(unref(maxWMeter)))
  watchEffect(() => !isFreeSetW.value && (w.value = ''))
  watchEffect(() => !isFreeSetMinW.value && (minW.value = ''))
  watchEffect(() => !isFreeSetMaxW.value && (maxW.value = ''))

  const isFreeSetH = computed(() => isMeterFreeSetting(unref(hMeter)))
  const isFreeSetMinH = computed(() => isMeterFreeSetting(unref(minHMeter)))
  const isFreeSetMaxH = computed(() => isMeterFreeSetting(unref(maxHMeter)))
  watchEffect(() => !isFreeSetH.value && (h.value = ''))
  watchEffect(() => !isFreeSetMinH.value && (minH.value = ''))
  watchEffect(() => !isFreeSetMaxH.value && (maxH.value = ''))

  const isEnabled = ref(true)
  const toggleEnable = useHooks(() => (isEnabled.value = !isEnabled.value))

  const isEnabledMinWidth = computed({
    get: () => isMeterFreeSetting(unref(wMeter)),
    set: (mw) => !mw && (minW.value = ''),
  })
  const isEnabledMaxWidth = computed({
    get: () => isMeterFreeSetting(unref(wMeter)),
    set: (mw) => !mw && (maxW.value = ''),
  })
  const toggleEnableMinMaxWidth = useHooks(() => {
    isEnabledMinWidth.value = !isEnabledMinWidth.value
    isEnabledMaxWidth.value = !isEnabledMaxWidth.value
  })

  const isEnabledMinHeight = computed({
    get: () => isMeterFreeSetting(unref(hMeter)),
    set: (mw) => !mw && (minH.value = ''),
  })
  const isEnabledMaxHeight = computed({
    get: () => isMeterFreeSetting(unref(hMeter)),
    set: (mw) => !mw && (maxH.value = ''),
  })
  const toggleEnableMinMaxHeight = useHooks(() => {
    isEnabledMinHeight.value = !isEnabledMinHeight.value
    isEnabledMaxHeight.value = !isEnabledMaxHeight.value
  })

  const isConfigured = computed(() => {
    return values.value.map((x) => unref(x) !== '').filter(Boolean).length > 0
  })

  const getZipValue = () => {
    const wMeterIDX = options.findIndex((x) => x.value === unref(wMeter))
    const hMeterIDX = options.findIndex((x) => x.value === unref(hMeter))
    const minWMeterIDX = options.findIndex((x) => x.value === unref(minWMeter))
    const maxWMeterIDX = options.findIndex((x) => x.value === unref(maxWMeter))
    const minHMeterIDX = options.findIndex((x) => x.value === unref(minHMeter))
    const maxHMeterIDX = options.findIndex((x) => x.value === unref(maxHMeter))
    return `${w.value}/${minW.value}/${maxW.value}/${wMeterIDX}/${minWMeterIDX}/${maxWMeterIDX}/${h.value}/${minH.value}/${maxH.value}/${hMeterIDX}/${minHMeterIDX}/${maxHMeterIDX}`
  }
  const unzipValue = (s: string) => {
    const [w1, w2, w3, w4, w5, w6, h1, h2, h3, h4, h5, h6] = s
      .split('/')
      .concat(['', '', '', '', '', '', '', '', '', '', '', ''])
      .slice(0, 12)
      .map((x) => x || '') as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ]
    w.value = w1
    minW.value = w2
    maxW.value = w3
    wMeter.value = options[Number(w4) || 0]?.value || ''
    minWMeter.value = options[Number(w5) || 0]?.value || ''
    maxWMeter.value = options[Number(w6) || 0]?.value || ''
    h.value = h1
    minH.value = h2
    maxH.value = h3
    hMeter.value = options[Number(h4) || 0]?.value || ''
    minHMeter.value = options[Number(h5) || 0]?.value || ''
    maxHMeter.value = options[Number(h6) || 0]?.value || ''
  }

  const isInited = ref(false)
  const init = (x: string = '') => {
    unzipValue(x)
    isEnabledMinWidth.value = has(minW.value)
    isEnabledMaxWidth.value = has(maxW.value)
    isEnabledMinHeight.value = has(minH.value)
    isEnabledMaxHeight.value = has(maxH.value)
    isEnabled.value = has(x)
    isInited.value = true
  }

  if (Object.keys(opts).includes('initValue')) {
    init(opts.initValue)
  }

  const reset = () => {
    init('')
    isInited.value = false
  }
  whenever(() => !isEnabled.value, reset)

  const onChangeFn = ref<((x: string) => void) | undefined>(opts.onChange)
  const onChange = (fn: (x: string) => void) => (onChangeFn.value = fn)
  // todo perf when onChangeFn is not null
  watch(
    values,
    () => {
      if (isFunction(unref(onChangeFn))) {
        onChangeFn.value!(getZipValue())
      }
    },
    {
      deep: true,
    },
  )

  const states = {
    version,
    isEnabled,
    toggleEnable,
    options,
    width: w,
    minWidth: minW,
    maxWidth: maxW,
    widthMeter: wMeter,
    minWidthMeter: minWMeter,
    maxWidthMeter: maxWMeter,
    height: h,
    minHeight: minH,
    maxHeight: maxH,
    heightMeter: hMeter,
    minHeightMeter: minHMeter,
    maxHeightMeter: maxHMeter,
    isEnabledMinWidth,
    isEnabledMaxWidth,
    isEnabledMinHeight,
    isEnabledMaxHeight,
    toggleEnableMinMaxWidth,
    toggleEnableMinMaxHeight,
    isFreeSetW,
    isFreeSetMinW,
    isFreeSetMaxW,
    isFreeSetH,
    isFreeSetMinH,
    isFreeSetMaxH,
    values,
    isConfigured,
    getZipValue,
    unzipValue,
    init,
    reset,
    isInited,
    onChange,
  } as const

  return states
}

/**
 * Spacing(Margin & Padding)
 */
export const useCxStyleSpacing = (_opts: UseCxStyleOptions) => {
  const useHooks = genUseHooks()
  const version = useSemanticVersion('0.0.1')
  const opts = Object.assign(
    {
      initValue: '',
      onChange: undefined,
    },
    _opts || {},
  )

  const options = CSSDefaultValue.concat(
    [
      { value: '0', label: '无' },
      { value: '1px', label: '1px' },
    ].concat(
      SpacingValues.map((x) => ({
        value: x.toString(),
        label: `${x} size`,
      })),
    ),
  )

  const [top, right, bottom, left] = [ref(''), ref(''), ref(''), ref('')]
  const values = computed({
    get() {
      return [unref(top), unref(right), unref(bottom), unref(left)]
    },
    set(x: string[] | string) {
      if (isString(x)) {
        x = [x, x, x, x]
      }
      top.value = x[0]!
      right.value = x[1]!
      bottom.value = x[2]!
      left.value = x[3]!
    },
  })

  const isEnabled = ref(true)
  const toggleEnable = useHooks(() => (isEnabled.value = !isEnabled.value))

  const isConfigured = computed(() => {
    return values.value.map((x) => unref(x) !== '').filter(Boolean).length > 0
  })

  const getZipValue = () => {
    return `${top.value}/${right.value}/${bottom.value}/${left.value}`
  }
  const unzipValue = (s: string) => {
    const [t, r, d, l] = s
      .split('/')
      .concat(['', '', '', ''])
      .slice(0, 4)
      .map((x) => x || '') as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ]
    top.value = t
    right.value = r
    bottom.value = d
    left.value = l
  }

  const isInited = ref(false)
  const init = (x: string = '') => {
    unzipValue(x)
    isEnabled.value = has(x)
    isInited.value = true
  }

  if (Object.keys(opts).includes('initValue')) {
    init(opts.initValue)
  }

  const reset = () => {
    init('')
    isInited.value = false
  }
  whenever(() => !isEnabled.value, reset)

  const onChangeFn = ref<((x: string) => void) | undefined>(opts.onChange)
  const onChange = (fn: (x: string) => void) => (onChangeFn.value = fn)
  // todo perf when onChangeFn is not null
  watch(
    values,
    () => {
      if (isFunction(unref(onChangeFn))) {
        onChangeFn.value!(getZipValue())
      }
    },
    {
      deep: true,
    },
  )

  const states = {
    version,
    isEnabled,
    toggleEnable,
    options,
    top,
    right,
    bottom,
    left,
    values,
    isConfigured,
    getZipValue,
    unzipValue,
    init,
    reset,
    isInited,
    onChange,
  } as const

  return states
}
export const useCxStyleMargin = (_opts: UseCxStyleOptions) => {
  return useCxStyleSpacing(_opts)
}
export const useCxStylePadding = (_opts: UseCxStyleOptions) => {
  return useCxStyleSpacing(_opts)
}

/**
 * Layout
 */
export const useCxStyleLayout = (_opts: UseCxStyleOptions) => {
  const useHooks = genUseHooks()
  const version = useSemanticVersion('0.0.1')
  const opts = Object.assign(
    {
      initValue: '',
      onChange: undefined,
    },
    _opts || {},
  )

  const direction = ref('')
  const directionOptions = [
    {
      value: 'h',
      label: '水平',
    },
    {
      value: 'v',
      label: '垂直',
    },
    {
      value: 'w',
      label: '换行',
    },
  ]

  const [isReverse, toggleReverse] = useToggle<true | false | ''>('')

  const gap = ref('')
  const gapOptions = CSSDefaultValue.concat(
    SpacingValues.map((x) => ({
      value: x.toString(),
      label: `${x} size`,
    })),
  )

  const align = ref('')
  const alignOptions = CSSDefaultValue.concat([
    { value: 'tl', label: '左上对齐' },
    { value: 'tc', label: '顶部居中' },
    { value: 'tr', label: '右上对齐' },
    { value: 'cl', label: '左侧居中' },
    { value: 'cc', label: '居中' },
    { value: 'cr', label: '右侧居中' },
    { value: 'bl', label: '左下对齐' },
    { value: 'bc', label: '底部居中' },
    { value: 'br', label: '右下对齐' },
    // { value: 't', label: '顶部对齐' },
    // { value: 'c', label: '中间对齐' },
    // { value: 'b', label: '底部对齐' },
    // { value: 'l', label: '左侧对齐' },
    // { value: 'r', label: '右侧对齐' },
  ])

  const [isFull, toggleFull] = useToggle<true | false | ''>('')
  const [isStretch, toggleStretch] = useToggle<true | false | ''>('')
  watchEffect(() => {
    if (direction.value === 'w') {
      isStretch.value = false
    }
    // if (!isStretch.value && align.value.length === 1) {
    //   if (direction.value === 'h') {
    //     align.value += 'c'
    //   } else if (direction.value === 'v') {
    //     align.value = 'c' + align.value
    //   }
    // }
  })

  const values = computed({
    get() {
      return [
        unref(direction),
        unref(align),
        unref(gap),
        unref(isFull),
        unref(isReverse),
        unref(isStretch),
      ]
    },
    set(x: [string, string, string, '' | boolean, '' | boolean, '' | boolean]) {
      direction.value = x[0]
      align.value = x[1]
      gap.value = x[2]
      isFull.value = Boolean(x[3])
      isReverse.value = Boolean(x[4])
      isStretch.value = Boolean(x[5])
    },
  })

  const isEnabled = ref(true)
  const toggleEnable = useHooks(() => (isEnabled.value = !isEnabled.value))

  const isConfigured = computed(() => {
    return values.value.map((x) => unref(x) !== '').filter(Boolean).length > 0
  })

  const getZipValue = () => {
    return `${direction.value}/${align.value}/${gap.value}/${isBoolean(isFull.value) ? (isFull.value ? 1 : 0) : ''}/${isBoolean(isReverse.value) ? (isReverse.value ? 1 : 0) : ''}/${isBoolean(isStretch.value) ? (isStretch.value ? 1 : 0) : ''}`
  }
  const unzipValue = (s: string) => {
    const [d, a, g, f, r, b] = s
      .split('/')
      .concat(['', '', '', '', '', ''])
      .slice(0, 6)
      .map((x) => x || '') as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ]
    direction.value = d
    align.value = a
    gap.value = g
    isFull.value = f === '1' ? true : f === '0' ? false : ''
    isReverse.value = r === '1' ? true : r === '0' ? false : ''
    isStretch.value = b === '1' ? true : b === '0' ? false : ''
  }

  const isInited = ref(false)
  const init = (x: string = '') => {
    unzipValue(x)
    isEnabled.value = has(x)
    isInited.value = true
  }

  if (Object.keys(opts).includes('initValue')) {
    init(opts.initValue)
  }

  const reset = () => {
    init('')
    isInited.value = false
  }
  whenever(() => !isEnabled.value, reset)

  const onChangeFn = ref<((x: string) => void) | undefined>(opts.onChange)
  const onChange = (fn: (x: string) => void) => (onChangeFn.value = fn)
  // todo perf when onChangeFn is not null
  watch(
    values,
    () => {
      if (isFunction(unref(onChangeFn))) {
        onChangeFn.value!(getZipValue())
      }
    },
    {
      deep: true,
    },
  )

  const states = {
    version,
    isEnabled,
    toggleEnable,
    direction,
    directionOptions,
    gap,
    gapOptions,
    align,
    alignOptions,
    isFull,
    toggleFull,
    isStretch,
    toggleStretch,
    isReverse,
    toggleReverse,
    values,
    isConfigured,
    getZipValue,
    unzipValue,
    init,
    reset,
    isInited,
    onChange,
  } as const

  return states
}

const LineHeightValues = [3, 4, 5, 6, 7, 8, 9, 10]

/**
 * Fonts
 */
export const useCxStyleFont = (_opts: UseCxStyleOptions) => {
  const useHooks = genUseHooks()
  const version = useSemanticVersion('0.0.1')
  const opts = Object.assign(
    {
      initValue: '',
      onChange: undefined,
    },
    _opts || {},
  )

  type FontAlign = '' | 'left' | 'center' | 'right'
  type FontWeight = '' | 'light' | 'regular' | 'medium' | 'bold'
  type FontCosm = '' | 'normal' | 'italic' | 'oblique'

  const align = ref<FontAlign>('')
  const alignOptions = CSSDefaultValue.concat([
    { value: 'left', label: '左对齐' },
    { value: 'center', label: '居中' },
    { value: 'right', label: '右对齐' },
  ])

  const lineHeight = ref('')
  const lineHeightOptions = CSSDefaultValue.concat(
    LineHeightValues.map((x) => ({
      value: x.toString(),
      label: `${x} size`,
    })),
  )

  const size = ref('')
  const sizeOptions = CSSDefaultValue.concat([
    { value: 'xs', label: '极小' },
    { value: 'sm', label: '小' },
    { value: 'md', label: '中' },
    { value: 'lg', label: '大' },
    { value: 'xl', label: '超大' },
    { value: '2xl', label: '超大2' },
    { value: '3xl', label: '超大3' },
    { value: '4xl', label: '超大4' },
    { value: '5xl', label: '超大5' },
    { value: '6xl', label: '超大6' },
    { value: '7xl', label: '超大7' },
    { value: '8xl', label: '超大8' },
  ])

  const weight = ref<FontWeight>('')
  const weightOptions = CSSDefaultValue.concat([
    { value: 'normal', label: '正常' },
    { value: 'light', label: '细' },
    { value: 'medium', label: '中等' },
    { value: 'bold', label: '粗' },
  ])

  const cosm = ref<FontCosm>('')
  const cosmOptions = CSSDefaultValue.concat([
    { value: 'normal', label: '正常' },
    { value: 'italic', label: '斜体' },
    { value: 'oblique', label: '强制斜体' },
  ])

  /**
   * @todo 检测各种字体的版权，从稿定设计搬一套免费字体
   */
  const family = ref('')
  const familyOptions = CSSDefaultValue.concat(fontFamilyOptions) as {
    value: string
    label: string
    subsets: string[]
  }[]
  const familySubsets = computed(() => {
    return familyOptions.find((x) => x.value === unref(family))
  })

  const familySubset = ref('')
  const isEnableFamilySubset = computed(() => (familySubsets.value?.subsets?.length ?? 0) > 0)
  const familySubsetOptions = computed(() => {
    return (familySubsets.value?.subsets?.length ?? 0) > 0
      ? familySubsets.value!.subsets!.map((x) => ({ value: x, label: x }))
      : []
  })
  watchEffect(() => {
    if (!familySubsets.value?.subsets?.length) {
      familySubset.value = ''
    }
  })

  const values = computed({
    get() {
      return [
        unref(lineHeight),
        unref(align),
        unref(size),
        unref(weight),
        unref(cosm),
        unref(family),
        unref(familySubset),
      ]
    },
    set(x: [string, string, string, string, string, string, string]) {
      lineHeight.value = x[0]
      align.value = x[1] as FontAlign
      size.value = x[2]
      weight.value = x[3] as FontWeight
      cosm.value = x[4] as FontCosm
      family.value = x[5]
      familySubset.value = x[6]
    },
  })

  const isEnabled = ref(true)
  const toggleEnable = useHooks(() => (isEnabled.value = !isEnabled.value))

  const isConfigured = computed(() => {
    return values.value.map((x) => unref(x) !== '').filter(Boolean).length > 0
  })

  const getZipValue = () => {
    return `${lineHeight.value}/${align.value}/${size.value}/${weight.value}/${cosm.value}/${family.value}/${familySubset.value}`
  }
  const unzipValue = (_s: string) => {
    const [l, a, s, w, c, f, fs] = _s
      .split('/')
      .concat(['', '', '', '', '', '', '', ''])
      .slice(0, 7)
      .map((x) => x || '') as [
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
      string,
    ]
    lineHeight.value = l
    align.value = a as FontAlign
    size.value = s
    weight.value = w as FontWeight
    cosm.value = c as FontCosm
    family.value = f
    familySubset.value = fs
  }

  const isInited = ref(false)
  const init = (x: string = '') => {
    unzipValue(x)
    isEnabled.value = has(x)
    isInited.value = true
  }

  if (Object.keys(opts).includes('initValue')) {
    init(opts.initValue)
  }

  const reset = () => {
    init('')
    isInited.value = false
  }
  whenever(() => !isEnabled.value, reset)

  const onChangeFn = ref<((x: string) => void) | undefined>(opts.onChange)
  const onChange = (fn: (x: string) => void) => (onChangeFn.value = fn)
  // todo perf when onChangeFn is not null
  watch(
    values,
    () => {
      if (isFunction(unref(onChangeFn))) {
        onChangeFn.value!(getZipValue())
      }
    },
    {
      deep: true,
    },
  )

  const states = {
    version,
    isEnabled,
    toggleEnable,
    lineHeight,
    lineHeightOptions,
    align,
    alignOptions,
    size,
    sizeOptions,
    weight,
    weightOptions,
    cosm,
    cosmOptions,
    family,
    familyOptions,
    isEnableFamilySubset,
    familyOption: familySubsets,
    familySubset,
    familySubsetOptions,
    values,
    isConfigured,
    getZipValue,
    unzipValue,
    init,
    reset,
    isInited,
    onChange,
  } as const

  return states
}

/**
 * Cosmetic(Background, Opacity, Shadow, Cursor, Filters)
 */
export const useCxStyleCosm = (_opts: UseCxStyleOptions<CxComponentStyle['c']>) => {
  const useHooks = genUseHooks()
  const version = useSemanticVersion('0.0.1')
  const opts = Object.assign(
    {
      initValue: '',
      onChange: undefined,
    },
    _opts || {},
  )

  const bgType = ref('')
  const bgTypeOptions = CSSDefaultValue.concat([
    { value: 'color', label: '颜色' },
    // { value: 'gradient', label: '渐变' },
    // { value: 'image', label: '图片' },
  ])

  const bgColorName = ref('')
  const bgColorNameOptions = CSSDefaultValue.concat(colorNameOptions) as {
    value: string
    label: string
    strength?: string[]
  }[]

  const bgColorStrengths = computed(() => {
    return bgColorNameOptions.find((x) => x.value === unref(bgColorName))?.strength || []
  })
  const bgColorStrength = ref('')
  const bgColorStrengthOptions = computed(() => {
    return bgColorStrengths.value.map((x) => ({
      value: x,
      label: x,
    }))
  })
  watchEffect(() => {
    if (!bgColorStrengths.value.length) {
      bgColorStrength.value = ''
    }
  })

  const opacity = ref('')
  const opacityOptions = CSSDefaultValue.concat(
    [{ value: '0', label: '透明' }].concat(
      [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100].map((x) => ({
        value: x.toString(),
        label: `${x}%`,
      })),
    ),
  )

  // const shadow = ref('')
  // const shadowOptions = CSSDefaultValue.concat([

  const cursor = ref('')
  const cursorOptions = CSSDefaultValue.concat([
    { value: 'default', label: '默认' },
    { value: 'pointer', label: '可点击' },
    { value: 'text', label: '文本' },
    { value: 'move', label: '移动' },
    { value: 'not-allowed', label: '不允许' },
    { value: 'help', label: '帮助' },
  ])

  const filter = ref('')
  const filterOptions = CSSDefaultValue.concat([
    { value: 'none', label: '无' },
    { value: 'blur', label: '模糊' },
    { value: 'brightness', label: '亮度' },
    { value: 'contrast', label: '对比度' },
    { value: 'grayscale', label: '灰度' },
    { value: 'hue-rotate', label: '色相旋转' },
    { value: 'invert', label: '反色' },
    { value: 'opacity', label: '透明度' },
    { value: 'saturate', label: '饱和度' },
    { value: 'sepia', label: '深褐色' },
  ])

  const values = computed({
    get() {
      return {
        b: [unref(bgType), unref(bgColorName), unref(bgColorStrength)],
        o: unref(opacity),
        c: unref(cursor),
        f: unref(filter),
      }
    },
    set(x: { b: [string, string, string]; o: string; c: string; f: string }) {
      bgType.value = x.b?.[0] || ''
      bgColorName.value = x.b?.[1] || ''
      bgColorStrength.value = x.b?.[2] || ''
      opacity.value = x.o || ''
      cursor.value = x.c || ''
      filter.value = x.f || ''
    },
  })

  const isEnabled = ref(true)
  const toggleEnable = useHooks(() => (isEnabled.value = !isEnabled.value))

  const isConfigured = computed(() => {
    const changed: string[] = []
    // values 形如 { b:[...], o, c, f }，逐项检查是否有非空配置
    ;(['o', 'c', 'f'] as const).forEach((x) => {
      if ((values.value as unknown as Record<string, string>)[x] !== '') {
        changed.push(x)
      }
    })
    if (values.value.b) {
      values.value.b.forEach((x) => {
        if (x !== '') {
          changed.push(x)
        }
      })
    }
    return changed.length > 0
  })

  const getZipValue = () => {
    return {
      // b 与 CxComponentStyle['c']['b'] 的三元组对齐
      b: [bgType.value || '', bgColorName.value || '', bgColorStrength.value || ''] as [
        string,
        string,
        string,
      ],
      o: opacity.value || '',
      c: cursor.value || '',
      f: filter.value || '',
    }
  }
  const unzipValue = (_s: CxComponentStyle['c']) => {
    _s = _s || {}
    bgType.value = _s.b?.[0] || ''
    bgColorName.value = _s.b?.[1] || ''
    bgColorStrength.value = _s.b?.[2] || ''
    opacity.value = _s.o || ''
    cursor.value = _s.c || ''
    filter.value = _s.f || ''
  }

  const isInited = ref(false)
  const init = (x: CxComponentStyle['c']) => {
    unzipValue(x)
    isEnabled.value = has(x)
    isInited.value = true
  }

  if (Object.keys(opts).includes('initValue')) {
    init(opts.initValue)
  }

  const reset = () => {
    init({ b: ['', '', ''], o: '', c: '', f: '' })
    isInited.value = false
  }
  whenever(() => !isEnabled.value, reset)

  // Cosm 的 getZipValue 返回对象（{ b, o, c, f }），与前 5 个 hook 的 string 不同
  const onChangeFn = ref<((x: CxComponentStyle['c']) => void) | undefined>(opts.onChange)
  const onChange = (fn: (x: CxComponentStyle['c']) => void) => (onChangeFn.value = fn)
  // todo perf when onChangeFn is not null
  watch(
    values,
    () => {
      if (isFunction(unref(onChangeFn))) {
        onChangeFn.value!(getZipValue())
      }
    },
    {
      deep: true,
    },
  )

  const states = {
    version,
    isEnabled,
    toggleEnable,
    bgType,
    bgTypeOptions,
    bgColorName,
    bgColorNameOptions,
    bgColorStrength,
    bgColorStrengthOptions,
    opacity,
    opacityOptions,
    cursor,
    cursorOptions,
    filter,
    filterOptions,
    values,
    isConfigured,
    getZipValue,
    unzipValue,
    init,
    reset,
    isInited,
    onChange,
  } as const

  return states
}
