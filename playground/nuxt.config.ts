// cx playground：零配置消费 @lionad/cx-nuxt 的验收环境
// 站会模块为一等公民内容区（EAP 迁移版）
export default defineNuxtConfig({
  modules: ['@lionad/cx-nuxt'],
  // cx 是客户端渲染系统；站会组件 setup 顶层访问 window/localStorage
  ssr: false,
  css: ['~/standup/styles/index.less'],
  devServer: {
    port: 3209,
    host: '0.0.0.0',
  },
  compatibilityDate: '2026-07-19',
})
