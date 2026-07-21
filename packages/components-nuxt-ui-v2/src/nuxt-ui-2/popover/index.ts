import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import { popperPlacementOptions } from '@lionad/cx-vue'
import { binds } from './slots'

export default normalize({
  key: 'cx-popover',
  name: '弹出层',
  description: '展示弹出式的内容，如悬浮提示、悬浮菜单等',
  icon: 'i-carbon-popup',
  component,
  props: {
    label: {
      type: 'short',
      name: '触发区文本',
      initial: '触发区',
      help: '向弹出层的触发区域添加组件将会覆盖默认的触发按钮。',
    },
    hoverMode: {
      type: 'boolean',
      name: '悬停打开',
      initial: true,
    },
    dftOpen: {
      type: 'boolean',
      name: '默认打开',
      initial: false,
    },
    direction: {
      type: 'card-selector',
      name: '打开方向',
      options: popperPlacementOptions,
    },
    // * 显示会有问题，先不展示箭头的配置项
    // arrow: {
    //   type: 'boolean',
    //   name: '显示箭头',
    //   initial: false,
    // },
  },
  slots: () => {
    return [
      {
        key: 'trigger',
        name: '触发区域',
        binds,
      },
      {
        key: 'panel',
        name: '弹出内容',
        binds,
      },
    ].filter(Boolean)
  },
})
