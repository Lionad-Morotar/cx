import type { VariantRegistry } from '../../variants-utils'

// 表格组手写 variants：data-table 为 array trigger 物料（arrayKey 为 data 行数组），
// 行/列项形态与其 trigger 声明一致（回放剧本真实）；对照维度为斑马纹/边框/尺寸
// 与列数行数组合。
export const tableVariants: VariantRegistry = {
  'cx-naive-ui-data-table': [
    { label: '默认两行两列', data: {} },
    {
      label: '斑马纹小尺寸三行',
      data: {
        striped: true,
        size: 'small',
        data: [
          { name: 'Alice', role: '管理员' },
          { name: 'Bob', role: '成员' },
          { name: 'Carol', role: '访客' },
        ],
      },
    },
    {
      label: '无边框三列',
      data: {
        bordered: false,
        columns: [
          { key: 'name', label: '名称' },
          { key: 'role', label: '角色' },
          { key: 'city', label: '城市' },
        ],
        data: [
          { name: 'Alice', role: '管理员', city: '上海' },
          { name: 'Bob', role: '成员', city: '杭州' },
        ],
      },
    },
  ],
}
