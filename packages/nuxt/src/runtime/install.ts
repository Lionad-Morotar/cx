import type { CxLoaderInstance, CxMaterialBundle } from '@lionad/cx-definition'
import type { NuxtApp } from '#app'

// 装配清单由 module 按宿主启用声明生成（#build/cx-bundles.mjs）：
// 未启用的物料包不出现在清单中，也不会被构建期解析
import { cxBundles } from '#build/cx-bundles.mjs'

/**
 * 安装宿主启用的物料 bundle 到 cx 实例（与 p-ray 编辑器相同的装配形态）。
 * async 签名保留以兼容既有调用方。
 */
export const installCxBundles = async (cx: CxLoaderInstance, _nuxtApp: NuxtApp) => {
  for (const bundle of cxBundles as CxMaterialBundle[]) {
    for (const cmpt of bundle.materials) {
      cmpt._cx_meta.type = 'local'
      // normalize 产物（组件对象挂 _cx_meta）与 installComponent 的 meta 形态签名不符，
      // 运行时行为与历史一致（该调用自始以宽松类型通过）
      cx.installComponent(cmpt._cx_meta.key, cmpt as any)
    }
  }
}
