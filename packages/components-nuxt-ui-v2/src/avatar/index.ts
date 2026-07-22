import { normalize, not } from '@lionad/cx-definition'
import { cmptColorNames, positionOptions, useSizeOptions } from '@lionad/cx-vue'
import component from './src/index.vue'
import { unref } from 'vue'

export default normalize({
  key: 'cx-avatar',
  name: '头像',
  description: '头像组件用于展示账号头像等图片信息',
  icon: 'i-heroicons-user-circle',
  component,
  props: {
    max: {
      type: 'number',
      name: '最大数量',
      initial: 5,
      hidden: ({ cmpt, cx }: any) => {
        const ref = (cx.refs?.get?.(cmpt.id) || {}).ref
        return unref(ref?.isInGroup)
      },
    },
    image: {
      name: '图片',
      type: 'image-upload',
      initial: '',
      options: {
        ratio: '1:1',
      },
    },
    alt: {
      type: 'short',
      name: '图片描述',
      help: '当图片尚未加载时，将显示此描述，建议使用1~2个英文字母',
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      options: useSizeOptions('3xs', '3xl'),
      isPreview: true,
      hidden: ({ cmpt, cx }: any) => {
        const ref = (cx.refs?.get?.(cmpt.id) || {}).ref
        return unref(ref?.isInGroup)
      },
    },
    enableChip: {
      type: 'switch',
      name: '启用标记',
    },
    chipText: {
      type: 'short',
      name: '标记文本',
      hidden: ({ cmpt }: any) => not(cmpt.data?.enableChip),
    },
    chipColor: {
      type: 'card-selector',
      name: '标记颜色',
      hidden: ({ cmpt }: any) => not(cmpt.data?.enableChip),
      isPreview: true,
      options: cmptColorNames,
    },
    chipPosition: {
      type: 'card-selector',
      name: '标记位置',
      hidden: ({ cmpt }: any) => not(cmpt.data?.enableChip),
      isPreview: true,
      options: positionOptions,
    },
  },
  slots: (({ cmpt, cx }: any) => {
    const ref = (cx.refs?.get?.(cmpt.id) || {}).ref
    const isGroup = not(unref(ref?.isInGroup))
    return [
      isGroup && {
        key: 'tail',
        name: '追加头像组件',
        help: '在头像组件右侧追加一个头像组件，组成头像组',
        whitelist: ['cx-avatar'],
      },
    ].filter(Boolean)
  }) as any,
})
