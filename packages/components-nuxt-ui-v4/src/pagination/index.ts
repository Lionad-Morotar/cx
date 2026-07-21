import { normalize } from '@lionad/cx-definition'
import component from './src/index.vue'

export default normalize({
  key: 'cx-nuxt-ui-v4-pagination',
  name: '分页',
  description: 'Nuxt UI v4 分页，展示页码与翻页控件',
  icon: 'i-fluent-dual-screen-pagination-24-regular',
  component,
  props: {
    total: {
      name: '总条数',
      type: 'number',
      initial: 100,
    },
    page: {
      name: '当前页',
      type: 'number',
      initial: 1,
    },
    itemsPerPage: {
      name: '每页条数',
      type: 'number',
      initial: 10,
    },
    siblingCount: {
      name: '相邻页码数',
      type: 'number',
      initial: 1,
    },
    showEdges: {
      name: '显示首尾页',
      type: 'boolean',
      initial: false,
    },
  },
  slots: {
    // v4 Pagination 的 slots 均为翻页控件渲染位
    prev: { key: 'prev', name: '上一页' },
    next: { key: 'next', name: '下一页' },
    item: { key: 'item', name: '页码' },
    first: { key: 'first', name: '第一页' },
    last: { key: 'last', name: '最后一页' },
  },
})
