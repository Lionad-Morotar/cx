import z from 'zod'
import { normalize, has, not } from '@lionad/cx-definition'
import component from './src/index.vue'
import PanelColumns from './panel/columns.vue'
import PanelSorts from './panel/sorts.vue'
import { zData, zColumn } from './types'
import { unref } from 'vue'

export default normalize({
  key: 'cx-table',
  name: '表格',
  description: '表格用于展示数据列表，支持排序、筛选等功能',
  icon: 'i-mdi-table-large',
  component,
  props: {
    datas: {
      type: 'custom',
      label: '数据',
      initial: () => [
        {
          id: 1,
          name: 'Lindsay Walton',
          title: 'Front-end Developer',
          email: 'lindsay.walton@example.com',
          role: 'Member',
        },
        {
          id: 2,
          name: 'Courtney Henry',
          title: 'Designer',
          email: 'courtney.henry@example.com',
          role: 'Admin',
        },
        {
          id: 3,
          name: 'Tom Cook',
          title: 'Director of Product',
          email: 'tom.cook@example.com',
          role: 'Member',
        },
        {
          id: 4,
          name: 'Whitney Francis',
          title: 'Copywriter',
          email: 'whitney.francis@example.com',
          role: 'Admin',
        },
        {
          id: 5,
          name: 'Leonard Drinkwater',
          title: 'Senior Designer',
          email: 'leonard.krasner@example.com',
          role: 'Owner',
        },
        {
          id: 6,
          name: 'Floyd Miles',
          title: 'Principal Designer',
          email: 'floyd.miles@example.com',
          role: 'Member',
        },
      ],
    },
    columns: {
      type: 'custom',
      name: '显示列',
      help: '选择要显示的列，不选则全部显示',
      component: PanelColumns,
      multiple: true,
      initial: () => [],
    },
    sorts: {
      type: 'custom',
      name: '列排序',
      initial: () => [],
      component: PanelSorts,
    },
    showSelect: {
      type: 'boolean',
      name: '显示选择列',
      initial: false,
    },
    singleSelect: {
      type: 'switch',
      name: '单选',
      initial: false,
      hidden: ({ cmpt }: any) => not(cmpt.data?.showSelect),
    },
  },
  emits: {
    'select:all': {
      name: '全选变化',
      description: '全选或取消全选时触发，真为全选，假为取消全选',
      schema: z.boolean(),
    },
  },
  slots: ({ cmpt, cx }: any) => {
    const ref = (cx?.refs?.get?.(cmpt.id) || {}).ref
    const columns = unref(ref?.columns) || []
    const data = cmpt.data || {}
    const showSelect = has(data?.showSelect) && not(data?.singleSelect)
    return [
      {
        key: 'caption',
        name: '表格标题',
        binds: {
          caption: {
            name: '标题',
            description: '表格标题',
            schema: z.string(),
          },
        },
      },
      showSelect && {
        key: 'selectHeader',
        name: '选中头',
        description: '当表格支持多选且在栏目配置了选择列时，才会显示全选按钮区域',
        binds: {
          indeterminate: {
            name: '半选',
            description: '表格是否处于半选状态',
            schema: z.boolean(),
          },
          checked: {
            name: '全选',
            description: '表格是否处于全选状态',
            schema: z.boolean(),
          },
          change: {
            name: '切换全选',
            description: '切换全选和取消全选',
            schema: z.instanceof(Function),
          },
        },
      },
      ...columns.map((col: any) => {
        return {
          key: `${col.key}-header`,
          name: `${col.label}表头`,
          binds: {
            column: {
              name: '列',
              description: '当前插槽对应的列配置',
              schema: zColumn,
            },
            sort: {
              name: '列排序',
              description: '当前列的排序方式',
              schema: z.object({
                direction: z.enum(['asc', 'desc']).optional(),
              }),
            },
            onSort: {
              name: '排序',
              description: '触发列排序',
              schema: z.instanceof(Function),
            },
          },
        }
      }),
      {
        key: 'loading-state',
        name: '加载状态',
      },
      {
        key: 'empty-state',
        name: '空状态',
      },
      {
        key: 'expand-action',
        name: '展开行',
        binds: {
          row: {
            name: '行',
            description: '当前插槽对应的行数据',
            schema: zData,
          },
          isExpanded: {
            name: '展开状态',
            description: '当前行是否展开',
            schema: z.boolean(),
          },
          toggle: {
            name: '切换展开',
            description: '切换当前行的展开状态',
            schema: z.instanceof(Function),
          },
        },
      },
      showSelect && {
        key: 'select-data',
        name: '选中行',
        binds: {
          checked: {
            name: '选中',
            description: '当前行是否选中',
            schema: z.boolean(),
          },
          change: {
            name: '改变选中',
            description: '改变当前行的选中状态',
            schema: z.instanceof(Function),
          },
        },
      },
      ...columns.map((col: any) => {
        return {
          key: `${col.key}-data`,
          name: `${col.label}数据`,
          binds: {
            column: {
              name: '列',
              description: '当前插槽对应的列配置',
              schema: zColumn,
            },
            row: {
              name: '行',
              description: '当前插槽对应的行数据',
              schema: zData,
            },
            index: {
              name: '索引',
              description: '当前插槽对应的行索引',
              schema: z.number(),
            },
            getRowData: {
              name: '获取行数据',
              description: '获取当前行的数据',
              schema: z.instanceof(Function).describe('默认值'),
            },
          },
        }
      }),
      {
        key: 'expand',
        name: '展开行内容',
        binds: {
          row: {
            name: '行',
            description: '当前插槽对应的行数据',
            schema: zData,
          },
          index: {
            name: '索引',
            description: '当前插槽对应的行索引',
            schema: z.number(),
          },
        },
      },
    ].filter(has)
  },
})
