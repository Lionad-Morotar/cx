import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-error',
  name: '错误页',
  description:
    'Nuxt UI v4 错误页，展示状态码与错误信息，物料层将 error 对象扁平化为状态码/状态文案/详情三个 prop',
  icon: 'i-tabler-alert-triangle',
  component,
  props: {
    statusCode: {
      name: '状态码',
      type: 'number',
      initial: 404,
    },
    statusMessage: {
      name: '状态文案',
      type: 'short',
      initial: 'Page not found',
    },
    message: {
      name: '错误详情',
      type: 'short',
      initial: 'The page you are looking for does not exist.',
    },
    icon: {
      name: '图标',
      type: 'short',
      initial: '',
    },
    redirect: {
      name: '返回链接',
      type: 'short',
      initial: '/',
    },
    clear: {
      name: '清除按钮',
      type: 'switch',
      initial: true,
    },
  },
  slots: {
    leading: { key: 'leading', name: '前置内容' },
    links: { key: 'links', name: '链接区' },
  },
})
