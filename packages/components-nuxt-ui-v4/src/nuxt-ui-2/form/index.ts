import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import { zError } from './types'

export default normalize({
  key: 'cx-form',
  name: '表单',
  description: '用于展示表单内容，并提供流程化控制',
  icon: 'i-fluent-form-48-regular',
  component,
  props: {
    uiEmptyTip: {
      type: 'boolean',
      name: '空提示',
      initial: true
    },
    uiEmptyTipText: {
      type: 'short',
      name: '空提示文本'
    }
  },
  emits: {
    submit: {
      name: '提交',
      description: '表单提交时触发',
      schema: z.any() as z.ZodType<SubmitEvent> // UFormSubmitEvent
    },
    error: {
      name: '错误',
      description: '表单校验失败时触发',
      schema: z.object({
        errors: z.array(zError)
      })
    }
  },
  exposes: {
    validate: {
      name: '校验',
      description: '手动校验表单',
      schema: z.instanceof(Function)
    },
    setErrors: {
      name: '设置错误',
      description: '设置表单错误信息',
      schema: z.instanceof(Function)
    },
    submit: {
      name: '提交',
      description: '提交表单',
      schema: z.instanceof(Function)
    },
    getErrors: {
      name: '获取错误',
      description: '获取表单错误信息',
      schema: z.instanceof(Function)
    },
    clear: {
      name: '清空错误',
      description: '清空表单的错误信息',
      schema: z.instanceof(Function)
    }
  },
  slots: {
    default: {
      key: 'default',
      name: '表单区域',
      whitelist: ['cx-form-item'],
      binds: {
        errors: {
          name: '错误',
          description: '表单校验时产生的错误信息',
          schema: z.array(zError)
        }
      }
    }
  }
})
