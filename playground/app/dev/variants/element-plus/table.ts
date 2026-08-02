import type { VariantRegistry } from '../../variants-utils'

// 表格组手写 variants：列定义与行数据的形态差异对照。
// table 为 array trigger 物料——variant 主数组（data）即回放剧本，
// 数据形态与 trigger arrayKey 一致；列定义数组形态与 extraScanPaths 声明一致。
export const tableVariants: VariantRegistry = {
  'cx-element-plus-table': [
    {
      label: '两列两行',
      data: {
        columns: [
          { key: 'name', label: '名称' },
          { key: 'role', label: '角色' },
        ],
        data: [
          { name: 'Alice', role: '管理员' },
          { name: 'Bob', role: '成员' },
        ],
      },
    },
    // 列定义形态差异：宽度/排序/对齐字段进列定义，行数据换领域对照
    {
      label: '排序小尺寸',
      data: {
        size: 'small',
        stripe: true,
        columns: [
          { key: 'version', label: '版本', width: 100 },
          { key: 'env', label: '环境', sortable: true },
          { key: 'status', label: '状态', align: 'center' },
        ],
        data: [
          { version: 'v2.4.0', env: '生产', status: '成功' },
          { version: 'v2.4.1', env: '预发', status: '进行中' },
          { version: 'v2.5.0', env: '开发', status: '待启动' },
        ],
      },
    },
  ],
}
