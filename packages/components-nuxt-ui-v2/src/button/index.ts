import { define } from '@lionad/cx-definition'
import { compColorNames2, useSizeOptions } from '@lionad/cx-vue'
import component from './src/index.vue'
import { slotBinds } from './slots'
import type { CxComponentSlot } from '@lionad/cx-definition'

export default define({
  name: '按钮',
  description: '按钮组件用于触发用户交互，如跳转页面、提交表单、打开弹窗等',
  key: 'cx-button',
  icon: 'i-tabler-click',
  component,
  props: {
    label: {
      name: '按钮文本',
      type: 'short',
      initial: '按钮',
    },
    variant: {
      name: '按钮样式',
      type: 'card-selector',
      isPreview: true,
      options: [
        {
          label: '实心',
          value: 'solid',
        },
        {
          label: '线框',
          value: 'outline',
        },
        {
          label: '柔和',
          value: 'soft',
        },
        {
          label: '幽灵',
          value: 'ghost',
        },
        {
          label: '链接',
          value: 'link',
        },
      ],
    },
    size: {
      name: '尺寸',
      type: 'card-selector',
      isPreview: true,
      options: useSizeOptions('2xs', 'xl'),
    },
    round: {
      name: '圆角',
      type: 'switch',
    },
    block: {
      name: '撑满',
      description: '可以控制按钮宽度是否在长度上撑满容器',
      type: 'switch',
    },
    _icon: {
      name: '图标',
      type: 'icon',
    },
    square: {
      name: '方形',
      description: '是否强制按钮在水平和垂直方向上具有相同的内边距（适合仅显示图标的按钮）',
      type: 'switch',
      hidden: ({ data }: any) => !data._icon,
    },
    iconPos: {
      name: '图标位置',
      type: 'card-selector',
      isPreview: true,
      hidden: ({ data }: any) => !data._icon || !data.label,
      options: [
        {
          label: '前',
          value: 'leading',
        },
        {
          label: '后',
          value: 'trailing',
        },
      ],
    },
    disabled: {
      name: '禁用',
      type: 'switch',
    },
    loading: {
      name: '加载中',
      type: 'switch',
    },
    color: {
      name: '颜色',
      type: 'card-selector',
      isPreview: true,
      options: compColorNames2,
    },
  },
  slots: ({ comp }: any) => {
    const res = [] as CxComponentSlot[]
    res.push({
      name: '内容',
      key: 'default',
    })
    if (comp.data._icon) {
      if (comp.data.iconPos === 'leading') {
        res.push({
          name: '内容后',
          key: 'trailing',
          binds: slotBinds,
        })
      }
      if (comp.data.iconPos === 'trailing') {
        res.push({
          name: '内容前',
          key: 'leading',
          binds: slotBinds,
        })
      }
    } else {
      res.push(
        {
          name: '内容前',
          key: 'leading',
          binds: slotBinds,
        },
        {
          name: '内容后',
          key: 'trailing',
          binds: slotBinds,
        },
      )
    }
    return res
  },
})
