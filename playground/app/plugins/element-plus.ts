// Element Plus 全量注册（保真原站会应用形态；后续再替换为 Nuxt UI）
import ElementPlus from 'element-plus'

export default defineNuxtPlugin((nuxtApp) => {
  // EP 的 install 类型签名与 Vue Plugin 泛型存在出入，运行时行为正确
  nuxtApp.vueApp.use(ElementPlus as unknown as Parameters<typeof nuxtApp.vueApp.use>[0])
})
