// 虚拟模块类型占位：真实文件由 module 在宿主构建期生成（addTemplate）
declare module '#build/cx-bundles.mjs' {
  export const cxBundles: import('@lionad/cx-definition').CxMaterialBundle[]
}
