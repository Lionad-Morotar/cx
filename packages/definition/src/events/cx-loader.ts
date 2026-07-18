import mitt from 'mitt'
import type { CxComponentMetaDefined, CxComponentRuntime } from '../types'

/**
 * CxLoader 相关钩子函数和事件管理
 */
export const cxLoaderHooks = mitt<{
  // 异步组件加载完成
  'cmpt:async-cmpt:loaded': {
    cmpt: CxComponentMetaDefined
  }
  // 异步组件完成后，在 cx-render 再次重置数据也完成
  'cmpt:async-cmpt-data:loaded': {
    cmpt: CxComponentMetaDefined
  }
  'cmpt:cx-event:emit': {
    id: string
    event: any
    args: any[]
  }
  'cmpt:before-mount': {
    cmpt: CxComponentRuntime
  }
  'cmpt:mounted': {
    cmpt: CxComponentRuntime
  }
  'cmpt:before-unmount': {
    cmpt: CxComponentRuntime
  }
  'cmpt:unmounted': {
    cmpt: CxComponentRuntime
  }
}>()
