import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import { popperPlacementOptions } from '@lionad/cx-vue'
import { unref } from 'vue'

export default normalize({
  key: 'cx-tooltip',
  name: '弹出提示',
  description: '弹出提示',
  icon: 'i-tabler-tooltip',
  component,
  props: {
    label: {
      type: 'short',
      name: '触发区文本',
      initial: '触发区',
      help: '向弹出提示的触发区域添加组件将会覆盖默认的触发按钮。编辑模式下，双击触发区域可持久弹出提示。',
    },
    direction: {
      type: 'card-selector',
      name: '打开方向',
      options: popperPlacementOptions,
    },
    openDelay: {
      type: 'range',
      name: '打开延迟',
      initial: 0,
      min: 0,
      max: 1000,
      help: '鼠标进入触发区域后，弹出提示打开的延迟时间，单位毫秒。',
    },
    closeDelay: {
      type: 'range',
      name: '关闭延迟',
      initial: 0,
      min: 0,
      max: 1000,
      help: '鼠标离开触发区域后，弹出提示关闭的延迟时间，单位毫秒。',
    },
  },
  slots: ({ cmpt, cx }: any) => {
    const res = [
      {
        key: 'default',
        name: '触发区域',
        binds: {
          open: {
            name: '打开',
            description: '打开面板',
            schema: z.instanceof(Function),
          },
        },
      },
      {
        key: 'text',
        name: '弹出内容',
      },
    ]
    const ref = (cx?.refs?.get?.(cmpt.id) || {}).ref
    if (unref(ref?.dblClickMode)) {
      return res.reverse()
    } else {
      return res
    }
  },
})
