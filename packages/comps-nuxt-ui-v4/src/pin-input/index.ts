import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-pin-input',
  name: 'PIN 输入',
  description: 'Nuxt UI v4 PIN 输入，分段字符输入（验证码/密码场景），支持掩码与 OTP',
  icon: 'i-tabler-password',
  component,
  props: {
    length: {
      name: '位数',
      type: 'number',
      initial: 6,
    },
    type: {
      name: '字符类型',
      type: 'card-selector',
      isPreview: true,
      initial: 'text',
      options: [
        { label: '任意字符', value: 'text' },
        { label: '仅数字', value: 'number' },
      ],
    },
    mask: {
      name: '掩码',
      type: 'switch',
    },
    otp: {
      name: 'OTP 自动填充',
      type: 'switch',
    },
    placeholder: {
      name: '占位符',
      type: 'short',
      initial: '○',
    },
    separator: {
      name: '分组间隔',
      type: 'number',
      initial: 0,
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      initial: 'primary',
      options: [
        { label: '主要', value: 'primary' },
        { label: '次要', value: 'secondary' },
        { label: '成功', value: 'success' },
        { label: '信息', value: 'info' },
        { label: '警告', value: 'warning' },
        { label: '错误', value: 'error' },
        { label: '中性', value: 'neutral' },
      ],
    },
    disabled: {
      name: '禁用',
      type: 'switch',
    },
  },
})
