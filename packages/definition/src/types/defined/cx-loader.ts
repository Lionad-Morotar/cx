import type { CxLoader } from '../../loader'
import type { App } from 'vue'

export type CxLoaderConfig = {
  app: App
  /**
   * * esm-native
   * esm mode means cx-loader will transform esm default exports to var assign,
   * for example,
   * "export { index as default }" -> "window[ModuleName] = index"
   */
  type?: 'umd' | 'esm-native' | 'esm' | 'module-federation'
  fetchModule?(url: string, exportsName: string, pkgName: string): Promise<unknown>
}

export type CxLoaderInstance = InstanceType<typeof CxLoader>

/**
 * @deprecated
 * backward capability, remove later
 */
export type LoaderInstance = InstanceType<typeof CxLoader>
