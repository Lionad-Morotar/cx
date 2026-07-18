import type { AnyFn } from '@vueuse/core'
import type { InjectionKey } from 'vue'

export const CxEventDisplayCmptKey: InjectionKey<AnyFn> = Symbol('displaySubCmpt')
export const CxEventDisplayCmpt = {
  name: '显示子组件',
  help: '示例，编辑器选中组件后执行显示子组件方法，让实现了此方法的 Tabs 切换到对应的标签页，以显示对应组件',
  args: [{ type: 'cx-cmpt' }],
}

export const CxEventInitCmptKey: InjectionKey<AnyFn> = Symbol('init')
export const CxEventInitCmpt = {
  name: '初始化组件',
  help: '示例，关闭警告组件后，需运行初始化组件函数，以便重新显示警告组件',
}

export const CxEvents = Object.assign([CxEventDisplayCmptKey, CxEventInitCmptKey], {
  displaySubCmpt: {
    key: CxEventDisplayCmptKey,
    value: CxEventDisplayCmpt,
    define: { [CxEventDisplayCmptKey]: CxEventDisplayCmpt },
  },
  init: {
    key: CxEventInitCmptKey,
    value: CxEventInitCmpt,
    define: { [CxEventInitCmptKey]: CxEventInitCmpt },
  },
})

export type CxEventKey = (typeof CxEvents)[number]
export * from './pkg'
