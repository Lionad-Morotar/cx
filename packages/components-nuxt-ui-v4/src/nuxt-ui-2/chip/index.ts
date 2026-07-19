import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import { cmptColorNames3, positionOptions , useSizeOptions} from '@lionad/cx-vue'
import component from './src/index.vue'
import type { CxComponentSlot } from '@lionad/cx-definition'

export default normalize({
  key: 'cx-chip',
  name: '标记',
  description: '使用标记组件在任意组件上展示轻量化，如标签、状态等',
  icon: 'i-lucide-bell-dot',
  component,
  props: {
    size: {
      type: 'card-selector',
      name: '大小',
      isPreview: true,
      options: useSizeOptions('3xs', '3xl'),
      pickComponent: () => ({})
    },
    color: {
      type: 'card-selector',
      name: '颜色',
      isPreview: true,
      options: cmptColorNames3,
      pickComponent: () => ({})
    },
    position: {
      type: 'card-selector',
      name: '位置',
      options: positionOptions
    },
    text: {
      type: 'short',
      name: '文本'
    },
    show: {
      type: 'switch',
      name: '是否显示',
      initial: true
    },
    inset: {
      type: 'switch',
      name: '更靠近内部',
      initial: false
    }
  },
  slots: ({ cmpt }: any) => {
    const res = [] as CxComponentSlot[]
    res.push(
      {
        key: 'default',
        name: '被标记内容'
      },
      // 防止没有内容时往标记内容添加一个很宽很长的组件导致样式错乱
      cmpt.components?.['default']?.length && {
        key: 'content',
        name: '标记文字',
        binds: {
          text: {
            name: '文本',
            description: '标记内的简短的文字',
            schema: z.string()
          }
        }
      }
    )
    return res.filter(Boolean)
  }
})
