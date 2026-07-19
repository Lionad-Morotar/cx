// cx playground：零配置消费 @lionad/cx-nuxt 的验收环境
export default defineNuxtConfig({
  modules: ['@lionad/cx-nuxt'],
  devServer: {
    port: 3209,
    host: '0.0.0.0',
  },
  compatibilityDate: '2026-07-19',
})
