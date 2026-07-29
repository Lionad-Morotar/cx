import { getCurrentInstance, reactive, useAttrs, inject, computed } from 'vue'
import type {
  CxUtils,
  ComponentEmits,
  CxComponentRuntime,
  CxLoaderInstance,
  CxPropBase,
} from '@lionad/cx-definition'

type PropsWithDefaults<Base, Defaults> = Base & {
  [K in keyof Defaults]: K extends keyof Base
    ? Defaults[K] extends undefined
      ? Base[K]
      : Exclude<Base[K], undefined>
    : never
}

/**
 * 属性面板绑定了一些固定的属性，要写一些模板代码，
 * 可以通过此函数简化
 */
export const useCxPanel = <
  T = unknown,
  ExtraProps = Record<string, never>,
>(
  defaultValue?: T,
  // extra?: Record<string, unknown>
) => {
  const cx = inject<CxLoaderInstance>('cx')!
  const instance = getCurrentInstance()!
  const emits = instance.emit as ComponentEmits<{
    // cxCompRuntime.data
    'update:data': [x: CxComponentRuntime['data']]
    // same as 'update:data'
    'update:datas': [x: CxComponentRuntime['data']]
  }>

  // withDefaults 不能在运行时填充默认值，所以 extra 没有效果
  const props = useAttrs() as PropsWithDefaults<
    Readonly<
      Partial<CxPropBase> & {
        cx: CxUtils
        comp: CxComponentRuntime
        data: Record<string, unknown>
        datas: Record<string, unknown>
        valueKey: string
      } & ExtraProps
    >,
    Record<string, never>
  >

  const value = computed({
    get() {
      return (props.datas[props.valueKey] ?? defaultValue) as unknown as T
    },
    set(val: T) {
      // console.log('set', val)
      // emits['update:datas']({ ...props.datas, [props.valueKey]: val })
      return ((props.datas[props.valueKey] as T) = val)
    },
  })
  if (defaultValue && !value.value) {
    value.value = defaultValue
  }

  // console.log('[debug] useCxPanel', value)

  const states = {
    cx,
    instance,
    emits,
    props: reactive(props),
    value,
  }
  return states
}
