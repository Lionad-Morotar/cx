import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import type { CxComponentSlot } from '@lionad/cx-definition'
import { useSizeOptions } from '@lionad/cx-vue'

export default normalize({
  key: 'cx-kbd',
  name: '键盘键',
  description: '以方块形式展示键盘按键',
  icon: 'i-material-symbols-light-keyboard-outline-sharp',
  component,
  props: {
    value: {
      type: 'short',
      name: '内容',
      initial: 'Ctrl'
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      isPreview: true,
      options: useSizeOptions('xs', 'md')
    }
  },
  slots: () => {
    const res = [] as CxComponentSlot[]
    res.push({
      key: 'default',
      name: '按键内容'
    })
    return res.filter(Boolean)
  }
})
