import { define } from '@lionad/cx-definition'
import component from './src/index.vue'
import PanelItems from './panel/items.vue'
import CxInput from '../input/index'
import { popperPlacementOptions } from '@lionad/cx-vue'
import { createItem } from './utils'
import { zItem } from './types'
import { binds as inputBinds } from '../input/slots'
import { omit as useOmit } from 'lodash-es'

export default define({
  key: 'cx-select',
  name: '选项框',
  description: '从一组设定好的选项中选择其中一个选项',
  icon: 'i-tabler-select',
  component,
  props: {
    options: {
      type: 'custom',
      name: '选项',
      component: PanelItems,
      initial: () => [createItem({ label: '选项1', value: '1' })],
    },
    /**
     * @see https://ui.nuxt.com/components/input-menu#usage
     */
    multiple: {
      type: 'boolean',
      name: '多选',
      disabled: true,
      help: '选项框组件不支持多选，请使用下拉菜单组件',
    },
    direction: {
      type: 'card-selector',
      name: '打开方向',
      options: popperPlacementOptions,
      disabled: true,
      help: '选项框组件不支持打开方向，请使用下拉菜单组件',
    },
    dftValue: CxInput._cx_meta.props.dftValue!,
    placeholder: CxInput._cx_meta.props.placeholder!,
    icon: CxInput._cx_meta.props.icon!,
    trailingIcon: {
      ...CxInput._cx_meta.props.icon!,
      name: '尾部图标',
    },
    disabled: CxInput._cx_meta.props.disabled!,
    loading: CxInput._cx_meta.props.loading!,
    padded: CxInput._cx_meta.props.padded!,
    variant: {
      ...CxInput._cx_meta.props.variant!,
      pickData: ({ data }: any) => useOmit(data, ['options']),
    },
    size: {
      ...CxInput._cx_meta.props.size!,
      pickData: ({ data }: any) => useOmit(data, ['options']),
    },
    color: {
      ...CxInput._cx_meta.props.color!,
      pickData: ({ data }: any) => useOmit(data, ['options']),
    },
  },
  emits: {
    change: {
      name: '选中改变',
      description: '当选中项改变时触发',
      schema: zItem,
    },
  },
  slots: {
    leading: {
      key: 'leading',
      name: '输入前区域',
      binds: inputBinds,
    },
    trailing: {
      key: 'trailing',
      name: '输入后区域',
      binds: inputBinds,
    },
  },
})
