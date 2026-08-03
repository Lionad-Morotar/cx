// cx playground：零配置消费 @lionad/cx-nuxt 的验收环境
// 站会模块为一等公民内容区（EAP 迁移版）

export default defineNuxtConfig({
  // @nuxt/ui 须在 cx-nuxt 之前注册：standup 业务组件模板裸用 U* 组件与 useToast
  // cx-nuxt 内联 module options：dev 验收启用 v2(cx-*) + v4(cx-nuxt-ui-v4-*) + vtu(cx-vtu-*)
  // + element-plus(cx-element-plus-*) + naive-ui(cx-naive-ui-*) 物料
  modules: [
    '@nuxt/ui',
    [
      '@lionad/cx-nuxt',
      { materials: ['render', 'components', 'nuxt-ui-v2', 'nuxt-ui-v4', 'vtu', 'element-plus', 'naive-ui'] },
    ],
  ],
  // cx 是客户端渲染系统；站会组件 setup 顶层访问 window/localStorage
  ssr: false,
  // vtu 样式不在此手写：cx-nuxt 模块在启用 vtu bundle 时条件注入 @lionad/vtu-components/style.css
  // （其 @source "." 指令由宿主 Tailwind v4 处理，扫描 vtu dist 生成工具类）
  css: [
    '~/assets/css/main.css',
    '@lionad/cx-comps/style.css',
    '~/standup/styles/theme.css',
    '~/standup/styles/index.css',
  ],
  devServer: {
    port: 3209,
    host: '0.0.0.0',
  },
  compatibilityDate: '2026-07-19',
})
