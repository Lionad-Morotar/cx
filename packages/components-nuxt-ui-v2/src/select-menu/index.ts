import z from 'zod'
import { define, has } from '@lionad/cx-definition'
import component from './src/index.vue'
import PanelItems from './panel/items.vue'
import CxSelect from '../select/index'
import { popperPlacementOptions } from '@lionad/cx-vue'
import { createItem } from './utils'
import { bindQuery, bindOption } from './slots'
import { binds as inputBinds } from '../input/slots'
import { zItem } from './types'
import type { CxComponentSlot } from '@lionad/cx-definition'
import { omit as useOmit } from 'lodash-es'

export default define({
  key: 'cx-select-menu',
  name: '下拉菜单',
  description: '增强版选项框组件，增加了多选，搜索等实用功能',
  icon: 'i-tabler-select',
  component,
  props: {
    options: {
      type: 'custom',
      name: '选项',
      component: PanelItems,
      initial: () => [createItem({ label: '选项1', value: '1' })],
    },
    multiple: {
      type: 'boolean',
      name: '多选',
      disabled: false,
    },
    // maxSelectCount: {
    //   type: 'number',
    //   name: '最大选择数量',
    //   initial: 0,
    // },
    dftValue: CxSelect._cx_meta.props.dftValue!,
    placeholder: CxSelect._cx_meta.props.placeholder!,
    icon: CxSelect._cx_meta.props.icon!,
    trailingIcon: {
      ...CxSelect._cx_meta.props.icon!,
      name: '尾部图标',
    },
    disabled: CxSelect._cx_meta.props.disabled!,
    loading: CxSelect._cx_meta.props.loading!,
    padded: CxSelect._cx_meta.props.padded!,
    variant: {
      ...CxSelect._cx_meta.props.variant!,
      pickData: ({ data }: any) => useOmit(data, ['options']),
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-5',
      },
    },
    size: {
      ...CxSelect._cx_meta.props.size!,
      pickData: ({ data }: any) => useOmit(data, ['options']),
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-5',
      },
    },
    color: {
      ...CxSelect._cx_meta.props.color!,
      pickData: ({ data }: any) => useOmit(data, ['options']),
      ui: {
        item: 'w-[80%] h-28 px-4 pt-1 pb-5',
      },
    },
    searchable: {
      type: 'boolean',
      name: '可搜索',
      initial: false,
    },
    searchablePlaceholder: {
      type: 'short',
      name: '搜索占位符',
      initial: '搜索',
    },
    clearSearchOnClose: {
      type: 'boolean',
      name: '关闭时清空搜索',
      initial: true,
    },
    dftQuery: {
      ...CxSelect._cx_meta.props.dftValue!,
      name: '默认搜索值',
    },
    creatable: {
      type: 'boolean',
      name: '搜索时可创建新选项',
      initial: false,
      disabled: true,
      help: '暂不支持',
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
  emits: {
    open: {
      name: '打开',
      description: '当下拉菜单打开时触发',
    },
    close: {
      name: '关闭',
      description: '当下拉菜单关闭时触发',
    },
    change: {
      name: '变更',
      description: '当选项变更时触发',
      schema: z.union([zItem, z.array(zItem)]),
    },
  },
  slots: ({ comp }: any) => {
    const canSearch = comp.data?.searchable
    const canCreate = comp.data?.creatable
    return [
      {
        key: 'leading',
        name: '输入前区域',
        binds: inputBinds,
      },
      {
        key: 'trailing',
        name: '输入后区域',
        binds: inputBinds,
      },
      {
        key: 'label',
        name: '选中区域',
        binds: {
          selected: bindOption.selected,
        },
      },
      {
        key: 'option',
        name: '选项',
        binds: bindOption,
      },
      {
        key: 'empty',
        name: '没有选项',
        binds: bindQuery,
      },
      canSearch && {
        key: 'option-empty',
        name: '没有搜索结果',
        binds: bindQuery,
      },
      canSearch &&
        canCreate && {
          key: 'option-create',
          name: '创建新选项',
          disabled: true,
          binds: bindOption,
        },
    ].filter(has) as CxComponentSlot[]
  },
})
