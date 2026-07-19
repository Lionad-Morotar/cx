import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import { cmptColorNames3 } from '@lionad/cx-vue'
import component from './src/index.vue'
import type { CxComponentSlot } from '@lionad/cx-definition'

export default normalize({
  key: 'cx-checkbox',
  name: '复选框',
  description: '复选框组件用于展示一个可选中的按钮，用于表示一个选中或未选中的二元状态',
  icon: 'i-tabler-checkbox',
  component,
  props: {
    label: {
      type: 'short',
      name: '标题',
      initial: '复选框'
    },
    help: {
      type: 'short',
      name: '提示信息',
      initial: '关于复选框的提示信息'
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      options: cmptColorNames3
    },
    required: {
      name: '是否必填',
      type: 'switch'
    },
    disabled: {
      name: '禁用',
      type: 'switch'
    }
  },
  emits: {
    change: {
      name: '勾选改变',
      description: '当勾选状态变化时触发',
      schema: z.boolean()
    }
  },
  slots: () => {
    const res = [] as CxComponentSlot[]
    res.push(
      {
        key: 'label',
        name: '标题',
        binds: {
          label: {
            name: '标题',
            description: '复选框的标题',
            schema: z.string()
          },
          required: {
            name: '是否必填',
            description: '必填时，默认的标题后会有星号',
            schema: z.boolean()
          }
        }
      },
      {
        key: 'help',
        name: '提示信息',
        binds: {
          help: {
            name: '提示信息',
            description: '复选框的提示信息',
            schema: z.string()
          }
        }
      }
    )
    return res
  }
})
