import { inject } from 'vue'

import type { CxLoaderInstance } from '@lionad/cx-definition'

/** Utils? */

export * from './use-cx-interval-fn'
export * from './use-cx-min-time'
export * from './use-cx-panel'
export * from './use-cx-props'
export * from './use-cx-responsive'
export * from './use-cx-re-render'

/** CxComp */

export * from './use-cx-slot'
export * from './use-cx-states'

/** CxRender */

export * from './use-cx-edit-mode'

/** Global */

export * from './use-request'
export * from './use-scoped-css'
export * from './use-task'
export * from './use-cx-media'
export * from './use-cx-toast'
export * from './use-cx-navigate'

export const useCx = () => {
  return inject<CxLoaderInstance>('cx')!
}
export const useCX = () => {
  return inject<CxLoaderInstance>('cx')!
}
