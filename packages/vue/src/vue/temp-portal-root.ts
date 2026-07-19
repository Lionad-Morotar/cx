import { ref } from 'vue'
import { tryOnScopeDispose } from '@vueuse/core'

export const HEADLESS_UI_PORTAL_ROOT_ID = 'headlessui-portal-root'

export const tempPortalRootID = ref(HEADLESS_UI_PORTAL_ROOT_ID)

export const resetTempPortalRoot = () => {
  tempPortalRootID.value = HEADLESS_UI_PORTAL_ROOT_ID
}

/**
 * 临时设置 headless ui 的 portal root（原为 p-ray headless-ui/use-temp-portal-root）。
 */
export function useTempPortalRoot(id: string) {
  tempPortalRootID.value = id
  tryOnScopeDispose(resetTempPortalRoot)

  return resetTempPortalRoot
}
