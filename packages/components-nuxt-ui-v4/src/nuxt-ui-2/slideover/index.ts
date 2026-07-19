import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import CxModal from '../modal'
import { unref } from 'vue'

export default normalize({
  key: 'cx-slideover',
  name: '侧边弹窗',
  description: '打断当前交互流程，并展示一个新的交互层',
  icon: 'i-material-symbols-light-transition-slide-outline-sharp',
  component,
  props: {
    label: {
      type: 'short',
      name: '触发按钮内容',
      initial: '打开侧边弹窗',
      help: '向侧边弹窗的触发区域添加组件将会覆盖默认的触发按钮。如果您已经添加了新的触发组件，想打开侧边弹窗而不是选中触发组件，需要长按 0.5 秒。',
    },
    notPreventClose: {
      type: 'boolean',
      name: '点击空白处关闭弹窗',
      initial: true,
      help: '在编辑模式中，可以通过双击弹窗的空白处关闭弹窗',
    },
    escClose: {
      type: 'boolean',
      name: '按 ESC 键关闭弹窗',
      initial: false,
      hidden: ({ cmpt }: any) => !cmpt.data?.notPreventClose,
    },
  },
  emits: CxModal._cx_meta.emits,
  slots: ({ cmpt, cx }: any) => {
    const res = [
      {
        key: 'trigger',
        name: '触发区域',
      },
      {
        key: 'slideover',
        name: '侧边弹窗内容',
      },
    ]
    const ref = (cx?.refs?.get?.(cmpt.id) || {}).ref
    if (unref(ref?.isOpen)) {
      return res.reverse()
    } else {
      return res
    }
  },
})
