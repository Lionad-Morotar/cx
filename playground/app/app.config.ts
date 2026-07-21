// appConfig.ui 双 schema 共存:
// @nuxt/ui v4 运行时插件要求 ui.colors 为「语义色 → tailwind 色名」对象;
// vendored nuxt-ui v2 物料的 color validator 经 Object.keys(ui.colors) 兼容读取,无需数组。
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
      secondary: 'blue',
      success: 'green',
      info: 'blue',
      warning: 'yellow',
      error: 'red',
      neutral: 'slate',
    },
    // vendored v2 组件主题读取(appConfig.ui.primary / .gray)
    primary: 'green',
    gray: 'cool',
  },
})
