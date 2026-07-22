import type { App } from 'vue'

/**
 * normalize 产物的最小协议面：装配层（cx-nuxt / 编辑器宿主）只依赖
 * _cx_meta 与 _cx_install，不耦合具体物料的 props/slots 泛型。
 */
export interface CxMaterialComponent {
  name?: string
  key?: string
  _cx_install: (app: App, ...options: any[]) => any
  _cx_meta: {
    key: string
    type?: 'umd' | 'esm' | 'local'
    [key: string]: any
  }
}

/**
 * 物料包自描述单元（bundle）。
 * 装配方按 bundle 装配物料，无需 import 包内路径、无需感知物料清单；
 * 新增物料包只需导出一个 bundle 并由宿主声明启用，即达成物料包级插拔。
 */
export interface CxMaterialBundle {
  /** bundle 标识（如 'render' / 'components' / 'nuxt-ui' / 'nuxt-ui-v4'），装配日志与调试使用 */
  name: string
  /** 物料清单（normalize 产物：Vue 组件挂载 _cx_meta/_cx_install） */
  materials: ReadonlyArray<CxMaterialComponent>
}
