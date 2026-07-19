import z from 'zod'
import { normalize, CxEvents } from '@lionad/cx-definition'
import component from './src/index.vue'
import CxButton from '../button'

export default normalize({
  name: '警告',
  description: '引人注目的警告信息',
  key: 'cx-alert',
  icon: 'i-ant-design-notification-outlined',
  component,
  props: {
    title: {
      type: 'short',
      name: '标题',
      initial: () => '错误警告'
    },
    description: {
      type: 'short',
      name: '描述',
      initial: () => '警告可以伴随一条详细的描述信息'
    },
    icon: {
      type: 'icon',
      name: '图标'
    },
    closeable: {
      type: 'boolean',
      name: '可关闭',
      initial: false
    },
    variant: {
      type: 'card-selector',
      name: '警告样式',
      isPreview: true,
      ui: {
        item: 'w-[90%] h-36 p-4 pb-6'
      },
      options: [
        {
          value: 'solid',
          label: '实心'
        },
        {
          value: 'outline',
          label: '描边'
        },
        {
          value: 'subtle',
          label: '低调'
        },
        {
          value: 'soft',
          label: '柔和'
        }
      ]
    },
    color: {
      ...CxButton._cx_meta.props.color!,
      ui: {
        item: 'w-[90%] h-36 p-4 pb-6'
      },
      // @ts-ignore
      options: (CxButton._cx_meta.props.color.options)
        .filter((color: any) => !['black', 'gray'].includes(color.value))
    }
  },
  emits: {
    open: {
      name: '打开',
      description: '打开警告'
    },
    close: {
      name: '关闭',
      description: '关闭警告'
    }
  },
  exposes: {
    open: {
      name: '打开',
      description: '打开警告'
    },
    close: {
      name: '关闭',
      description: '关闭警告'
    },
    ...CxEvents.displaySubCmpt.define,
    ...CxEvents.init.define
  },
  slots: ((): any => {
    return [
      {
        key: 'title',
        name: '标题区域',
        binds: {
          title: {
            name: '标题',
            description: '警告组件的标题',
            schema: z.string()
          }
        }
      },
      {
        key: 'description',
        name: '描述区域',
        binds: {
          description: {
            name: '描述',
            description: '警告组件的描述',
            schema: z.string()
          }
        }
      },
      {
        key: 'icon',
        name: '图标区域',
        binds: {
          icon: {
            name: '图标',
            description: '警告组件的图标',
            schema: z.string()
          }
        }
      },
      {
        key: 'actions',
        name: '操作区域',
        binds: {
          // * 没有实现 actions 的快速编辑，所以暂时不需要
          // actions: {
          //   name: '操作',
          //   description: '警告组件的操作按钮',
          //   schema: z.array(z.object({
          //     label: z.string(),
          //     onClick: z.instanceof(Function),
          //   })),
          // }
        }
      }
    ].filter(Boolean)
  })
})
