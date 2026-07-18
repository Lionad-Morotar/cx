import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import cmptBlock from './src/block.vue'
import cmptFigure from './src/figure.vue'
import cmptHeader from './src/header.vue'
import cmptH1 from './src/h1.vue'
import cmptH2 from './src/h2.vue'
import cmptH3 from './src/h3.vue'
import cmptH4 from './src/h4.vue'
import cmptH5 from './src/h5.vue'
import cmptP from './src/p.vue'
import cmptLogic from './src/logic.vue'
import cmptDatas from './src/datas.vue'

const CxText = normalize({
  name: '文本',
  icon: 'i-tabler-edit',
  description: '用来展示基础的文字内容',
  key: 'cx-text',
  component: cmptP,
  props: {
    content: {
      name: '文本内容',
      type: 'short',
      initial: '',
    },
    truncate: {
      name: '允许截断',
      type: 'switch',
      help: '文本内容超出一行时，使用省略号截断',
    },
  },
})

const CxHeader = normalize({
  name: '标题',
  icon: 'i-tabler-h-1',
  description: '用来展示标题内容',
  key: 'cx-header',
  component: cmptHeader,
  props: {
    content: {
      name: '标题内容',
      type: 'short',
      initial: '',
    },
    truncate: {
      name: '允许截断',
      type: 'switch',
    },
  },
})

const CxH1 = normalize({
  name: '一级标题',
  icon: 'i-tabler-h-1',
  description: '用来展示标题内容',
  key: 'cx-h1',
  component: cmptH1,
  props: {
    content: {
      name: '标题内容',
      type: 'short',
      initial: '',
    },
    truncate: {
      name: '允许截断',
      type: 'switch',
    },
  },
})

const CxH2 = normalize({
  name: '二级标题',
  icon: 'i-tabler-h-2',
  description: '用来展示标题内容',
  key: 'cx-h2',
  component: cmptH2,
  props: {
    content: {
      name: '标题内容',
      type: 'short',
      initial: '',
    },
    truncate: {
      name: '允许截断',
      type: 'switch',
    },
  },
})

const CxH3 = normalize({
  name: '三级标题',
  icon: 'i-tabler-h-3',
  description: '用来展示标题内容',
  key: 'cx-h3',
  component: cmptH3,
  props: {
    content: {
      name: '标题内容',
      type: 'short',
      initial: '',
    },
    truncate: {
      name: '允许截断',
      type: 'switch',
    },
  },
})

const CxH4 = normalize({
  name: '四级标题',
  icon: 'i-tabler-h-4',
  description: '用来展示标题内容',
  key: 'cx-h4',
  component: cmptH4,
  props: {
    content: {
      name: '标题内容',
      type: 'short',
      initial: '',
    },
    truncate: {
      name: '允许截断',
      type: 'switch',
    },
  },
})

const CxH5 = normalize({
  name: '五级标题',
  icon: 'i-tabler-h-5',
  description: '用来展示标题内容',
  key: 'cx-h5',
  component: cmptH5,
  props: {
    content: {
      name: '标题内容',
      type: 'short',
      initial: '',
    },
    truncate: {
      name: '允许截断',
      type: 'switch',
    },
  },
})

const CxBlock = normalize({
  name: '块',
  icon: 'i-tabler-box-model',
  description: '一个独立的页面区域，可以在内部填充其他组件',
  key: 'cx-block',
  component: cmptBlock,
  props: {},
  slots: {
    default: {
      key: 'default',
      name: '内容区',
    },
  },
})

const CxFigure = normalize({
  name: '插图',
  icon: 'i-ant-design-picture-outlined',
  description: '图片等内容',
  key: 'cx-figure',
  component: cmptFigure,
  props: {
    image: {
      name: '图片',
      type: 'image-upload',
      initial: '',
      options: {
        ratio: '1:1',
      },
    },
    enableCaption: {
      name: '开启图片标题',
      type: 'switch',
      initial: false,
    },
    caption: {
      name: '插图标题',
      type: 'short',
      initial: '',
      hidden: ({ data }: any) => !data.enableCaption,
    },
  },
})

const CxLogic = normalize({
  key: 'cx-logic',
  name: '条件容器',
  description: '在指定条件显示、隐藏或重复容器内的内容',
  icon: 'i-tabler-logic-xnor',
  component: cmptLogic,
  headless: true,
  props: {
    type: {
      type: 'select',
      name: '控制类型',
      initial: 'none',
      options: [
        { label: '条件销毁', value: 'none' },
        { label: '条件隐藏', value: 'hide' },
        { label: '重复', value: 'for' },
      ],
    },
    value: {
      type: 'number',
      name: '条件值',
      initial: 0,
      help: ({ cmpt }: any) => {
        if (cmpt.data?.type === 'for') {
          return '重复次数最大为100'
        }
        return ''
      },
    },
  },
  slots: ({ cmpt }: any) => {
    const dftSlot = {
      key: 'default',
      name: '内容区域',
      binds: {
        index: {
          name: '索引',
          description: '当前重复的顺序（0、1、2...）',
          schema: z.number(),
        },
        length: {
          name: '总数',
          description: '重复的总次数',
          schema: z.number(),
        },
      },
    }
    if (cmpt.data?.type !== 'for') {
      delete (dftSlot as any).binds
    }
    return [dftSlot]
  },
})

const CxDatas = normalize({
  key: 'cx-datas',
  name: '数据容器',
  description: '创造新的数据，提供给插槽内其他组件',
  icon: 'i-mdi-database-outline',
  component: cmptDatas,
  headless: true,
  props: {},
  slots: {
    default: {
      key: 'default',
      name: '内容区域',
    },
  },
})

export default [CxText, CxHeader, CxH1, CxH2, CxH3, CxH4, CxH5, CxBlock, CxFigure, CxLogic, CxDatas]
