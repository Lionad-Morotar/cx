import z from 'zod'
import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'
import { useSizeOptions } from '@lionad/cx-vue'

export default normalize({
  key: 'cx-pagination',
  name: '分页指示',
  description: '展示分页信息，如上一页、下一页、跳转到指定页等',
  icon: 'i-fluent-dual-screen-pagination-24-regular',
  component,
  props: {
    total: {
      type: 'number',
      name: '总项目数',
      initial: 100
    },
    pageCount: {
      type: 'number',
      name: '每页数量',
      help: '总页数 = (总项目数 / 每页数量)',
      initial: 10
    },
    max: {
      type: 'number',
      name: '最大页码按钮数',
      help: '当分页数量很大时，保证页面上的页码按钮数量不会过多，默认为 10',
      initial: 10
    },
    size: {
      type: 'card-selector',
      name: '尺寸',
      isPreview: true,
      options: useSizeOptions('2xs', 'xl')
    },
    disabled: {
      type: 'boolean',
      name: '禁用'
    }
  },
  slots: {
    first: {
      key: 'first',
      name: '第一页',
      binds: {
        canGoFirst: {
          name: '可跳转',
          description: '是否可以跳转到第一页',
          schema: z.boolean()
        },
        onClick: {
          name: '跳转',
          description: '跳转到第一页',
          schema: z.instanceof(Function)
        }
      }
    },
    prev: {
      key: 'prev',
      name: '上一页',
      binds: {
        canGoPrev: {
          name: '可跳转',
          description: '是否可以跳转到上一页',
          schema: z.boolean()
        },
        onClick: {
          name: '跳转',
          description: '跳转到上一页',
          schema: z.instanceof(Function)
        }
      }
    },
    next: {
      key: 'next',
      name: '下一页',
      binds: {
        canGoNext: {
          name: '可跳转',
          description: '是否可以跳转到下一页',
          schema: z.boolean()
        },
        onClick: {
          name: '跳转',
          description: '跳转到下一页',
          schema: z.instanceof(Function)
        }
      }
    },
    last: {
      key: 'last',
      name: '最后一页',
      binds: {
        canGoLast: {
          name: '可跳转',
          description: '是否可以跳转到最后一页',
          schema: z.boolean()
        },
        onClick: {
          name: '跳转',
          description: '跳转到最后一页',
          schema: z.instanceof(Function)
        }
      }
    }
  }
})
