import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import PanelItems from './panel/items.vue'
import CxInput from '../input/index'
import { popperPlacementOptions } from '@lionad/cx-vue'
import { bindQuery, bindOption } from './slots'
import { zItem } from './types'
import { binds as inputBinds } from '../input/slots'
import { omit as useOmit } from 'lodash-es'

export default normalize({
  key: 'cx-input-menu',
  name: '搜索输入框',
  description: '带搜索功能以及补全功能的输入框',
  icon: 'i-tabler-input-search',
  component,
  props: {
    options: {
      type: 'custom',
      name: '选项',
      component: PanelItems,
      initial: () => []
    },
    direction: {
      type: 'card-selector',
      name: '打开方向',
      options: popperPlacementOptions
    },
    /**
     * @see https://ui.nuxt.com/components/input-menu#usage
     */
    multiple: {
      type: 'boolean',
      name: '多选',
      disabled: true,
      help: '输入菜单组件不支持多选，请使用选择菜单组件'
    },
    dftQuery: CxInput._cx_meta.props.dftValue!,
    placeholder: CxInput._cx_meta.props.placeholder!,
    icon: CxInput._cx_meta.props.icon!,
    trailingIcon: {
      ...CxInput._cx_meta.props.icon!,
      name: '尾部图标'
    },
    disabled: CxInput._cx_meta.props.disabled!,
    loading: CxInput._cx_meta.props.loading!,
    padded: CxInput._cx_meta.props.padded!,
    variant: {
      ...CxInput._cx_meta.props.variant!,
      pickData: ({ data }: any) => useOmit(data, ['options'])
    },
    size: {
      ...CxInput._cx_meta.props.size!,
      pickData: ({ data }: any) => useOmit(data, ['options'])
    },
    color: {
      ...CxInput._cx_meta.props.color!,
      pickData: ({ data }: any) => useOmit(data, ['options'])
    }
  },
  emits: {
    open: {
      name: '打开',
      description: '当下拉菜单打开时触发'
    },
    close: {
      name: '关闭',
      description: '当下拉菜单关闭时触发'
    },
    change: {
      name: '变更',
      description: '当选项变更时触发',
      schema: zItem
    }
  },
  slots: {
    'leading': {
      key: 'leading',
      name: '输入前区域',
      binds: inputBinds
    },
    'trailing': {
      key: 'trailing',
      name: '输入后区域',
      binds: inputBinds
    },
    'option': {
      key: 'option',
      name: '选项',
      binds: bindOption
    },
    'empty': {
      key: 'empty',
      name: '没有选项',
      binds: bindQuery
    },
    'option-empty': {
      key: 'option-empty',
      name: '没有搜索结果',
      binds: bindQuery
    }
  }
})
