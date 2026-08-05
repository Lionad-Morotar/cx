import { define, translate } from '@lionad/cx-definition'
import component from './page-main.vue'

export default define({
  name: translate('页面预加载组件'),
  description: translate(
    '页面预加载组件，允许你在当前页面空闲时提前加载一些可能用到的东西，以提升用户体验。比如，在下一个页面初始化请求速度比较慢等场景有不错的效果。',
  ),
  key: 'cx-page-main',
  icon: 'i-tabler-browser',
  component,
  // preload 槽为 runtime 预加载机制（schema 不承载），仅声明 schema 子节点可填入的默认槽
  slots: {
    default: { key: 'default', name: translate('默认插槽') },
  },
})
