import { normalize, type CxComponentSlot } from '@lionad/cx-definition'
import component from './src/index.vue'
import { binds } from './slots'
import { useSizeOptions } from '@lionad/cx-vue'

export default normalize({
  key: 'cx-form-item',
  name: '表单项',
  description: '在表单元素周围显示标签和其他信息。',
  icon: 'i-fluent-form-multiple-20-regular',
  component,
  props: {
    label: {
      type: 'short',
      name: '标题',
      initial: '标题',
    },
    description: {
      type: 'short',
      name: '描述',
      initial: '',
    },
    hint: {
      type: 'short',
      name: '提示',
      initial: '',
    },
    help: {
      type: 'short',
      name: '帮助',
      initial: '',
    },
    required: {
      type: 'boolean',
      name: '是否必填',
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      options: useSizeOptions('2xs', 'xl'),
    },
    eagerValidation: {
      type: 'boolean',
      name: '立即校验',
      help: '默认情况下，表单项失去鼠标焦点后才进行校验。开启立即校验后，表单项在输入时就会进行校验，这在提示某些“必填”选项的时候很有用',
    },
  },
  slots: () => {
    return [
      {
        key: 'default',
        name: '表单项区域',
        binds: {
          error: binds.error,
        },
      },
      {
        key: 'label',
        name: '标题区域',
        binds,
      },
      {
        key: 'description',
        name: '描述区域',
        binds,
      },
      {
        key: 'hint',
        name: '提示区域',
        binds,
      },
      {
        key: 'help',
        name: '帮助区域',
        binds,
      },
      {
        key: 'error',
        name: '错误区域',
        binds,
      },
    ].filter(Boolean) as CxComponentSlot[]
  },
})
