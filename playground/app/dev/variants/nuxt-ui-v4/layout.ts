import type { VariantRegistry } from '../../variants-utils'

// Layout 组手写 variants：页面骨架件中有视觉属性的 4 件。
// 裁决不补 4 件（默认单 variant 兜底）：container/main/theme 无任何 props；
// footer 同样零 props（五个内容槽但 variants 只能覆盖 data），组间无视觉差异。

export const layoutVariants: VariantRegistry = {
  'cx-nuxt-ui-v4-app': [
    { label: '默认从左到右', data: { dir: 'ltr' } },
    { label: '从右到左', data: { dir: 'rtl' } },
  ],
  'cx-nuxt-ui-v4-error': [
    { label: '404 页面未找到', data: {} },
    { label: '500 服务器错误', data: { statusCode: 500, statusMessage: 'Server error', message: '服务器开了一个小差，请稍后再试。' } },
    { label: '403 带图标', data: { statusCode: 403, statusMessage: 'Forbidden', message: '没有访问权限', icon: 'i-lucide-shield-x' } },
  ],
  'cx-nuxt-ui-v4-header': [
    { label: '默认弹窗导航', data: {} },
    { label: '抽屉导航', data: { mode: 'drawer', title: '站点导航' } },
    { label: '侧滑导航', data: { mode: 'slideover', title: '文档站' } },
  ],
  'cx-nuxt-ui-v4-sidebar': [
    { label: '默认左栏图标折叠', data: {} },
    { label: '右侧栏', data: { side: 'right' } },
    { label: '离屏折叠无导轨', data: { collapsible: 'offcanvas', rail: false } },
  ],
}
