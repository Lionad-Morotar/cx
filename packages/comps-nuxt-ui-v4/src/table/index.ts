import { define } from '@lionad/cx-definition'
import component from './src/index.vue'

export default define({
  key: 'cx-nuxt-ui-v4-table',
  name: '表格',
  description: 'Nuxt UI v4 表格，基于 TanStack Table 的数据展示',
  icon: 'i-mdi-table-large',
  component,
  props: {
    data: {
      name: '数据',
      type: 'custom',
      initial: () => [
        { id: 1, name: '张三', role: '管理员' },
        { id: 2, name: '李四', role: '成员' },
      ],
    },
    columns: {
      name: '列定义',
      type: 'custom',
      initial: () => [
        { accessorKey: 'name', header: '姓名' },
        { accessorKey: 'role', header: '角色' },
      ],
    },
  },
  slots: {
    // v4 Table 的动态 slot 形如 `${columnId}-cell` / `${columnId}-header`，随列定义变化；
    // 物料层只展开通用的 #caption 与 #empty，动态列 slot 请在业务侧按列 id 填充
    caption: { key: 'caption', name: '表格标题' },
    empty: { key: 'empty', name: '空状态' },
  },
})
