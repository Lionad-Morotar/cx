import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-user',
  name: '用户',
  description:
    'Nuxt UI v4 用户信息，姓名/描述/头像组合展示；物料层将 avatar 对象扁平化为头像地址 prop',
  icon: 'i-tabler-user',
  component,
  props: {
    name: {
      name: '姓名',
      type: 'short',
      initial: '张三',
    },
    description: {
      name: '描述',
      type: 'short',
      initial: '软件工程师',
    },
    avatarSrc: {
      name: '头像地址',
      type: 'short',
      initial: 'https://i.pravatar.cc/150?u=default',
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      initial: 'md',
      options: [
        { label: 'xs', value: 'xs' },
        { label: 'sm', value: 'sm' },
        { label: 'md', value: 'md' },
        { label: 'lg', value: 'lg' },
        { label: 'xl', value: 'xl' },
      ],
    },
  },
})
