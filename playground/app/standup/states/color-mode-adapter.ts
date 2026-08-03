import { computed } from 'vue'

import type { Ref } from 'vue'
import type { ThemePreference } from './theme'

/**
 * color-mode 运行时适配：把 @nuxtjs/color-mode（由 @nuxt/ui 自动注册）的
 * preference 桥接为可写 Ref。注意 useColorMode() 返回的是 useState 解包后的
 * 响应式实例，preference 是其属性（直读为原始值、直赋可写），并非 Ref；
 * 误当 Ref 用会在 .value= 时对字符串赋属性抛错且被异步点击链静默吞掉。
 * 独立成层：composable 只能经 Nuxt auto-import 在运行时解析，
 * 测试环境以 vi.mock 整模块替换注入受控 ref。
 */
export const useColorModePreference = (): Ref<ThemePreference> => {
  // useColorMode 为 Nuxt auto-import；此处不经 import，保持与宿主运行时一致
  const colorMode = useColorMode()
  return computed({
    get: () => colorMode.preference as ThemePreference,
    set: (v) => {
      // color-mode 的 preference 类型宽于本域三态（含自定义 theme 扩展位），赋值即触发持久化与 html class 切换
      colorMode.preference = v
    },
  })
}
