import mitt from 'mitt'
import type { CxComponentMetaDefined, CxComponentRuntime } from '../types'

/**
 * CxLoader 相关钩子函数和事件管理
 */
export const cxLoaderHooks = mitt<{
  // 异步组件加载完成
  'comp:async-comp:loaded': {
    comp: CxComponentMetaDefined
  }
  // 异步组件完成后，在 cx-render 再次重置数据也完成
  'comp:async-comp-data:loaded': {
    comp: CxComponentMetaDefined
  }
  'comp:cx-event:emit': {
    id: string
    event: any
    args: any[]
  }
  'comp:before-mount': {
    comp: CxComponentRuntime
  }
  'comp:mounted': {
    comp: CxComponentRuntime
  }
  'comp:before-unmount': {
    comp: CxComponentRuntime
  }
  'comp:unmounted': {
    comp: CxComponentRuntime
  }
}>()
