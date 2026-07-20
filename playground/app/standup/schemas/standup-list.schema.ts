import type { CxComponentRuntime } from '@lionad/cx-definition'

/**
 * 站会列表页的页面结构 schema（静态骨架）。
 *
 * 整页由这一棵 CxComponentRuntime 树描述、经 CxRender 渲染：
 * 动态数据（分组/卡片/成员/会议类型）由各容器物料自行从 store 消费，
 * 动态数量（分组数/卡片数）经 card-tabs 式模板插槽循环展开，schema 本身保持静态。
 */

const node = (
  id: string,
  key: string,
  children: Record<string, CxComponentRuntime[]> = {},
  data: Record<string, unknown> = {},
): CxComponentRuntime =>
  ({
    id,
    key,
    name: id,
    data,
    components: children,
    parents: [],
    aliasKeys: [],
    props: {},
    emits: {},
    exposes: {},
  }) as CxComponentRuntime

export const standupListSchema: CxComponentRuntime[] = [
  node('page-root', 'cx-page-main', {
    default: [
      node('list-layout', 'cx-standup-list-layout', {
        default: [
          node('header-bar', 'cx-standup-header-bar'),
          node('list-main', 'cx-standup-list-main', {
            default: [
              node('group-list', 'cx-standup-group-list', {
                'group-item': [
                  node('folder', 'cx-folder-container', {
                    header: [node('group-header', 'cx-standup-group-header')],
                    content: [
                      node('card-list', 'cx-standup-card-list', {
                        'card-item': [node('standup-card', 'cx-standup-card')],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          node('member-draggable', 'cx-standup-member-draggable'),
          node('participants-dialog', 'cx-select-participants-dialog'),
        ],
      }),
    ],
  }),
]
