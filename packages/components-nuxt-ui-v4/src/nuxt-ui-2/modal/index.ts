import { normalize, CxEvents } from '@lionad/cx-definition'
import component from './src/index.vue'
import { unref } from 'vue'

export default normalize({
  key: 'cx-modal',
  name: '弹窗',
  description: '打断交互流程，引导用户进行下一步操作',
  icon: 'i-material-symbols-light-multimodal-hand-eye-outline',
  component,
  props: {
    label: {
      type: 'short',
      name: '按钮内容',
      initial: '打开弹窗',
      help: '向弹窗的触发区域添加组件将会覆盖默认的触发按钮。如果您已经添加了新的触发组件，想打开弹窗而不是选中触发组件，需要长按 0.5 秒。'
    },
    overlay: {
      type: 'boolean',
      name: '遮罩',
      initial: true
    },
    fullscreen: {
      type: 'boolean',
      name: '全屏弹窗',
      initial: false
    },
    notPreventClose: {
      type: 'boolean',
      name: '点击空白处关闭弹窗',
      initial: true,
      help: '在编辑模式中，可以通过双击弹窗的空白处关闭弹窗'
    }
    // escClose: {
    //   type: 'boolean',
    //   name: '按 ESC 键关闭弹窗',
    //   initial: false,
    //   hidden: ({ cmpt }: any) => !cmpt.data?.notPreventClose,
    // },
  },
  emits: {
    'close': {
      name: '关闭',
      description: '弹窗关闭时触发'
    },
    'close-prevented': {
      name: '关闭被阻止',
      description: '尝试关闭弹窗但被阻止时触发'
    },
    'after-leave': {
      name: '销毁',
      description: '弹窗关闭动画结束后触发，此时界面是可交互的'
    }
  },
  exposes: {
    ...CxEvents.displaySubCmpt.define
  },
  slots: ({ cmpt, cx }: any) => {
    const res = [
      {
        key: 'trigger',
        name: '触发区域'
      },
      {
        key: 'modal',
        name: '弹窗内容'
      }
    ]
    const ref = (cx?.refs?.get?.(cmpt.id) || {}).ref
    if (unref(ref?.isOpen)) {
      return res.reverse()
    } else {
      return res
    }
  }
})
