// appConfig.ui 补全：vendored nuxt-ui v2 物料的 color validator 与主题读取依赖
// （cx-nuxt 模块兜底为空对象会导致 uiColors=[]，任何 color 值都校验失败）
export default defineAppConfig({
  ui: {
    colors: [
      'primary',
      'white',
      'gray',
      'black',
      'red',
      'orange',
      'amber',
      'yellow',
      'lime',
      'green',
      'emerald',
      'teal',
      'cyan',
      'sky',
      'blue',
      'indigo',
      'violet',
      'purple',
      'fuchsia',
      'pink',
      'rose',
    ],
    primary: 'green',
    gray: 'cool',
  },
})
